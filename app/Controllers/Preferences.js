const _this = module.exports;
const { ipcMain, safeStorage } = require("electron");
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
    "username": "1",
    "channelname": "2",
    "twitchpassword": "3",
    "serverip": "4",
    "port": "5",
    "serverpassword": "6",
    "youtubeChannelID": "11",
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

/* REMOTES */

ipcMain.handle("Preferences_SaveDetails", async (event, data) => {
    _this.SaveLogin(data, data.allowSave, data.rememberChoice);
});

ipcMain.handle("Preferences_GetDetails", async (event, data) => {
    return _this.GetSavedLogin();
});
