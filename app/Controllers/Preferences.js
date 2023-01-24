const _this = module.exports;
const { ipcMain, ipcRenderer, safeStorage, app } = require("electron");
const ElectronPreferences = require("electron-preferences");
const path = require("path");

_this.preferences = new ElectronPreferences({
    dataStore: path.resolve(app.getPath("userData"), "preferences.json"),
    defaults: {
        connection: {
            streamingService: "Twitch",
            savePasswords: false,
            isFirstTimeConnection: true,
            autoEnableConvar: true
        },
        voting: {
            highlightedEffectColor: "#b14299",
            votingStyle: "proportional",
            alwaysOnTop: true,
            chromaKeyBackground: "#00ff00",
            defaultEffectBar: "#323d41",
            percentageBar: "#33587a",
            effectTextColor: "#fff",
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
                                label: "Default Streaming Service",
                                key: "streamingService",
                                type: "radio",
                                options: [
                                    { label: "Twitch", value: "Twitch" },
                                    { label: "YouTube", value: "YouTube" },
                                ],
                                help: "Which streaming service you want to be selected by default on start",
                            },
                            {
                                label: "Remember Passwords?",
                                key: "savePasswords",
                                type: "radio",
                                options: [
                                    { label: "Yes", value: true },
                                    { label: "No", value: false },
                                ],
                                help: "Note: Selecting no will clear any saved passwords on your next connection.",
                            },
                            {
                                label: "First Time Connection",
                                key: "isFirstTimeConnection",
                                type: "radio",
                                options: [
                                    { label: "true", value: true },
                                    { label: "false", value: false },
                                ],
                                hideFunction: () => true,
                            },
                            {
                                label: "Auto-enable Voting ConVar In-Game",
                                key: "autoEnableConvar",
                                type: "radio",
                                options: [
                                    { label: "Yes", value: true },
                                    { label: "No", value: false },
                                ],
                                help: "Auto-enable 'sm_chaos_voting_enabled' ConVar when connected to the server to enable voting.",
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
                                key: "votingStyle",
                                type: "radio",
                                options: [
                                    { label: "Proportional", value: "proportional" },
                                    { label: "Most Voted", value: "mostvoted" },
                                ],
                                help: "Determines which effect is picked. Most Voted will pick the highest voted effect. Proportional will randomly pick the effect based off each effect's chance, the more votes the higher the chance.",
                            },
                            {
                                label: "Chroma Key Background Color",
                                key: "chromaKeyBackground",
                                type: "color",
                                format: "hex",
                            },
                            {
                                label: "Default Effect Bar Color",
                                key: "defaultEffectBar",
                                type: "color",
                                format: "hex",
                                help: "Background color of the effect row.",
                            },
                            {
                                label: "Percentage Bar Color",
                                key: "percentageBar",
                                type: "color",
                                format: "hex",
                                help: "Background color of the bar that depicts the amount of votes the effect has (as a percentage).",
                            },
                            {
                                label: "Highlighted Effect Color",
                                key: "highlightedEffectColor",
                                type: "color",
                                format: "hex",
                                help: "The highlight color to indicate which effect was selected.",
                            },
                            {
                                label: "Effect Text Color",
                                key: "effectTextColor",
                                type: "color",
                                format: "hex",
                                help: "Text color for the overlay.",
                            },
                            {
                                label: "Keep Voting Window Always On Top",
                                key: "alwaysOnTop",
                                type: "radio",
                                options: [
                                    { label: "Yes", value: true },
                                    { label: "No", value: false },
                                ],
                                help: "Selecting yes will force the voting overlay to always stay on top of other windows.",
                            },
                            {
                                key: "resetVotingDefaults",
                                type: "button",
                                buttonLabel: "Reset Defaults",
                                help: "Note: Re-open the preferences window to update.",
                            },
                        ],
                    },
                ],
            },
        },
    ],
});

_this.preferences.on("click", (key) => {
    if (key === "resetVotingDefaults") {
        for (let obj in _this.preferences.defaults.voting) {
            _this.preferences.value(`voting.${obj}`, _this.preferences.defaults.voting[obj]);
        }
    }
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
    firstTimeConnection: "7",
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
        allowSave: _this.preferences.value("connection.savePasswords"),
    };
    return config;
};

_this.SaveLogin = function (data, savePasswords = true) {
    if (data.username) store.set(configindex["username"], JSON.stringify(safeStorage.encryptString(data.username)));
    if (data.channelname) store.set(configindex["channelname"], JSON.stringify(safeStorage.encryptString(data.channelname)));
    if (data.serverip) store.set(configindex["serverip"], JSON.stringify(safeStorage.encryptString(data.serverip)));
    if (data.port) store.set(configindex["port"], JSON.stringify(safeStorage.encryptString(data.port)));
    if (_this.preferences.value("connection.savePasswords")) {
        if (data.youtubeChannelID) store.set(configindex["youtubeChannelID"], JSON.stringify(safeStorage.encryptString(data.youtubeChannelID)));
        if (data.twitchpassword) store.set(configindex["twitchpassword"], JSON.stringify(safeStorage.encryptString(data.twitchpassword)));
        if (data.serverpassword) store.set(configindex["serverpassword"], JSON.stringify(safeStorage.encryptString(data.serverpassword)));
    } else {
        // clear passwords
        store.set(configindex["twitchpassword"], "");
        store.set(configindex["serverpassword"], "");
    }

    // if(savePasswords){
    //     _this.preferences.value('connection.savePasswords', true);
    // }
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
    try {
        _this.preferences.value(data.key, data.value);
    } catch (e) {
        console.log(e);
    }
});
