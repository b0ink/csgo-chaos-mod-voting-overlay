const _this = module.exports;
const { ipcMain, safeStorage, app } = require("electron");
const ElectronPreferences = require("electron-preferences");
const path = require("path");

_this.preferences = new ElectronPreferences({
    dataStore: path.resolve(app.getPath("userData"), "preferences.json"),
    defaults: {
        connection: {
            'streamingservice': "Twitch",
        },
        voting: {
            'highlightedeffectcolor': "#b14299",
            'votingstyle': "proportional",
        },
    },
    sections: [
        {
            id: "connection",
            label: "Connection",
            // icon: 'world',
            icon: "preferences",
            // icon: 'dashboard-level',
            form: {
                groups: [
                    {
                        label: "Connection Details",
                        fields: [
                            {
                                label: "Default streaming service",
                                key: "streamingservice",
                                type: "radio",
                                options: [
                                    { label: "Twitch", value: "Twitch" },
                                    { label: "YouTube", value: "YouTube" },
                                ],
                                help: "Which streaming service you want to be selected by default on start",
                            },
                            {
                                label: "Save passwords on connect?",
                                key: "savepasswords",
                                type: "radio",
                                options: [
                                    { label: "Yes", value: true },
                                    { label: "No", value: false },
                                ],
                                help: 'Note: Selecting no will clear any saved passwords on your next connection.'
                            },
                        ],
                    },
                ],
            },
        },
        {
            id: "voting",
            label: "Voting",
            icon: "handout",
            form: {
                groups: [
                    {
                        label: "Voting",
                        fields: [
                            {
                                label: "Voting Style",
                                key: "votingstyle",
                                type: "radio",
                                options: [
                                    { label: "Proportional", value: "proportional" },
                                    { label: "Most Voted", value: "mostvoted" },
                                ],
                                help: "Determines which effect is picked. Most Voted will pick the highest voted effect. Proportional will randomly pick the effect based off each effect's chance, the more votes the higher the chance.",
                            },
                            {
                                label: "Highlighted effect color",
                                key: "highlightedeffectcolor",
                                type: "color",
                                format: "hex",
                                default: "#b14299",
                                help: "The highlight color to indicate which effect was selected (Default: #b14299)",
                            },
                        ],
                    },
                    
                ],
            },
        },
    ],
});

const Store = require("electron-store");
const store = new Store();

const GetStoredValue = (key, returnEmptyOnFail = true) => {
    try {
        let info = safeStorage.decryptString(Buffer.from(JSON.parse(store.get(configindex[key]))));
        if (info) return info;
    } catch (e) {
        if (returnEmptyOnFail) {
            return "";
        } else {
            return store.get(configindex[key]);
        }
    }
};

const configindex = {
    username: "1",
    channelname: "2",
    twitchpassword: "3",
    serverip: "4",
    port: "5",
    serverpassword: "6",
    youtubeChannelID: "11",
    "remember-choice": "7",
    "always-save-passwords": "8",
    "votingWindow-location": "9",
    "setupWindow-location": "10",
};

_this.GetSavedLogin = function () {
    let config = {
        username: GetStoredValue("username"),
        channelname: GetStoredValue("channelname"),
        twitchpassword: GetStoredValue("twitchpassword"),
        serverip: GetStoredValue("serverip"),
        port: GetStoredValue("port"),
        serverpassword: GetStoredValue("serverpassword"),
        youtubeChannelID: GetStoredValue("youtubeChannelID"),
        rememberChoice: GetStoredValue("remember-choice", false),
        allowSave: GetStoredValue("always-save-passwords", false),
    };
    return config;
};

_this.SaveLogin = function (data, savePasswords = true, rememberChoice = false) {
    if (data.username) store.set(configindex["username"], JSON.stringify(safeStorage.encryptString(data.username)));
    if (data.channelname) store.set(configindex["channelname"], JSON.stringify(safeStorage.encryptString(data.channelname)));
    if (data.serverip) store.set(configindex["serverip"], JSON.stringify(safeStorage.encryptString(data.serverip)));
    if (data.port) store.set(configindex["port"], JSON.stringify(safeStorage.encryptString(data.port)));
    if (savePasswords) {
        if (data.youtubeChannelID) store.set(configindex["youtubeChannelID"], JSON.stringify(safeStorage.encryptString(data.youtubeChannelID)));
        if (data.twitchpassword) store.set(configindex["twitchpassword"], JSON.stringify(safeStorage.encryptString(data.twitchpassword)));
        if (data.serverpassword) store.set(configindex["serverpassword"], JSON.stringify(safeStorage.encryptString(data.serverpassword)));
    } else {
        // clear passwords
        store.set(configindex["twitchpassword"], "");
        store.set(configindex["serverpassword"], "");
    }
    store.set(configindex["always-save-passwords"], savePasswords);
    store.set(configindex["remember-choice"], rememberChoice);
};

_this.GetWindowLocation = (windowName) => {
    let position = store.get(configindex[`${windowName}-location`]);
    try {
        return {
            x: parseInt(position.split(" ")[0]),
            y: parseInt(position.split(" ")[1]),
        };
    } catch (e) {
        return { x: null, y: null };
    }
};

_this.SaveWindowLocation = (windowName, x, y) => {
    store.set(configindex[`${windowName}-location`], `${x} ${y}`);
};

_this.preferences.on('save', data => {
    if(data.connection.savePasswords){
        _this.SaveLogin(null, true, true);
    }
})


/* REMOTES */

ipcMain.handle("Preferences_SaveDetails", async (event, data) => {
    _this.SaveLogin(data, data.allowSave, data.rememberChoice);
});

ipcMain.handle("Preferences_GetDetails", async (event, data) => {
    return _this.GetSavedLogin();
});

ipcMain.handle("Preferences_GetValue", async (event, data) => {
    return _this.preferences.value(data);
});

ipcMain.handle("Preferences_SetValue", async (event, data) => {
    try{
        _this.preferences.value(data.key, data.value);
    }catch(e){
        console.log(e);
    }
});