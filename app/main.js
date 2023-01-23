const APP_VERSION = "1.2.0";

const { win, BrowserWindow, app } = require("electron");
const Preferences = require("./Controllers/Preferences");
const { SaveWindowLocation, GetWindowLocation } = Preferences;

const Effects = require("./Controllers/Effects");

const { shell } = require("electron/common");
const { ipcMain } = require("electron/main");
const path = require("path");

const Rcon = require("./Controllers/Rcon");
const Twitch = require("./Controllers/Twitch");
const YouTube = require("./Controllers/Youtube");

const isDev = !app.isPackaged;

const setupWindowSize = {
    width: 450,
    defaultHeight: 590,
    youtubeHeight: 520,
};

const votingWindowSize = {
    width: 425,
    height: 300,
};

let windowOptions = {
    backgroundColor: "white",
    webPreferences: {
        nodeIntegration: false,
        contextIsolation: true,
        preload: path.join(__dirname, "./preload.js"),
        devTools: isDev,
    },
    icon: path.join(__dirname, "/favicon.ico"),
    resizable: isDev,
};

var setupWindow;
var votingWindow;

/* Open setup connection window */
const createSetupWindow = () => {
    const { x, y } = GetWindowLocation("setupWindow");

    setupWindow = new BrowserWindow({
        width: setupWindowSize.width,
        height: setupWindowSize.defaultHeight,
        x,
        y,
        ...windowOptions,
        title: "CS:GO Chaos Mod Connection Setup",
    });
    setupWindow.loadFile("index.html", {
        query: {
            page: "Setup",
        },
    });
    setupWindow.setMenuBarVisibility(false);
    setupWindow.setMinimumSize(setupWindowSize.width, setupWindowSize.defaultHeight);
    setupWindow.setSize(setupWindowSize.width, setupWindowSize.defaultHeight);

    setupWindow.on("close", () => {
        try {
            SaveWindowLocation("setupWindow", setupWindow.getPosition()[0], setupWindow.getPosition()[1]);
        } catch (e) {}
    });
};

/* Open voting window */
const createVotingWindow = () => {
    const { x, y } = GetWindowLocation("votingWindow");

    votingWindow = new BrowserWindow({
        width: votingWindowSize.width,
        height: votingWindowSize.defaultHeight,
        x,
        y,
        ...windowOptions,
        backgroundThrottling: false,
        offscreen: true,
        title: "CS:GO Chaos Mod Voting",
        alwaysOnTop: Preferences.preferences.value("voting.alwaysOnTop"),
        minimizable: false,
        maximizable: false,
        resizable: false,
    });
    votingWindow.setAlwaysOnTop(true, "screen-saver");
    votingWindow.loadFile("index.html", {
        query: {
            page: "Voting",
        },
    });
    votingWindow.setMenuBarVisibility(false);
    votingWindow.setMinimumSize(votingWindowSize.width, votingWindowSize.height);
    votingWindow.setSize(votingWindowSize.width, votingWindowSize.height);
    Effects.VotingWindowOpen = true;
    votingWindow.on("close", () => {
        Effects.VotingWindowOpen = false;
        try {
            SaveWindowLocation("votingWindow", votingWindow.getPosition()[0], votingWindow.getPosition()[1]);
        } catch (e) {
            console.log(e);
        }
    });
};

setInterval(() => {
    if (Rcon.FailedConnections >= 10) {
        if (votingWindow) {
            console.log("CLOSING ALL CONNECTIONS");
            votingWindow.close();
            votingWindow = false;
            Rcon.CloseConnection();
            Twitch.CloseConnection();
            YouTube.CloseConnection();
            //TODO:
        }
    }
}, 1000);

/* REMOTES */

ipcMain.handle("Window_SetSetupSize", (event, streamingService) => {
    if (streamingService == "YouTube") {
        setupWindow.setMinimumSize(setupWindowSize.width, setupWindowSize.youtubeHeight);
        setupWindow.setSize(setupWindowSize.width, setupWindowSize.youtubeHeight);
    } else {
        setupWindow.setMinimumSize(setupWindowSize.width, setupWindowSize.defaultHeight);
        setupWindow.setSize(setupWindowSize.width, setupWindowSize.defaultHeight);
    }
    return true;
});

ipcMain.handle("Version_GetAppVersion", () => APP_VERSION);

ipcMain.handle("Window_OpenChaosDownload", () => shell.openExternal("https://csgochaosmod.com"));
ipcMain.handle("Window_OpenTmiOauth", () => shell.openExternal("https://twitchapps.com/tmi"));
ipcMain.handle("Window_OpenVotingWindow", () => createVotingWindow());
ipcMain.handle("Window_CloseVotingWindow", () => votingWindow.close());

app.whenReady().then(createSetupWindow);

app.on("window-all-closed", function (e) {
    if (process.platform !== "darwin") {
        app.quit();
    }
});

process.on("warning", (warning) => {
    if (!isDev) return;
    console.warn(warning.name); // Print the warning name
    console.warn(warning.message); // Print the warning message
    console.warn(warning.stack); // Print the stack trace
});
