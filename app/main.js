const APP_VERSION = "1.1.0";

const { win, BrowserWindow, app } = require("electron");
const { SaveWindowLocation, GetWindowLocation } = require("./Controllers/Preferences");

const Effects = require("./Controllers/Effects");

const { shell } = require("electron/common");
const { ipcMain } = require("electron/main");
const path = require("path");

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

// Open setup window
const createSetupWindow = () => {
    const { x, y } = GetWindowLocation("setupWindow");

    setupWindow = new BrowserWindow({
        width: setupWindowSize.width,
        height: setupWindowSize.defaultHeight,
        x,
        y,
        ...windowOptions,
        title: "CS:GO Chaos Mod Setup",
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

// Open voting window
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
        backgroundThrottling: false,
    });
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
        } catch (e) {}
    });
};

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
ipcMain.handle("Window_OpenVotingWindow", async (event, data) => createVotingWindow());
ipcMain.handle("Window_CloseVotingWindow", async (event, data) => votingWindow.close());

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
