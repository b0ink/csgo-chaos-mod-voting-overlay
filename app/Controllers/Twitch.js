const _this = module.exports;

const tmi = require("tmi.js");

const { app } = require("electron");
const { ipcMain } = require("electron/main");

const Chat = require("./Chat");

const isDev = !app.isPackaged;

_this.TwitchClient = new tmi.Client({
    options: { debug: isDev },
    identity: {
        username: null,
        password: null,
    },
    channels: [],
});

_this.TwitchClient.on("message", (channel, tags, message, self) => {
    if (!this.TwitchClient) return;
    if (self) return; // Ignore echoed messages.
    let username = tags["username"];
    Chat.SaveVote(message, username);
});

_this.ConnectToTwitch = async (event, details) => {
    return new Promise((resolve, reject) => {
        _this.TwitchClient.opts.identity.username = details["username"];
        _this.TwitchClient.opts.identity.password = details["twitchpassword"];
        _this.TwitchClient.opts.channels = [details["username"]];

        let timeout = setTimeout(() => {
            reject("Twitch connection timed out");
        }, 5000);

        _this.TwitchClient.connect()
            .then((data) => {
                console.log(data);
                if (!data) throw "Could not connect to twitch.";
                if (timeout) {
                    resolve({
                        client: _this.TwitchClient,
                        success: true,
                        response: "twitch-success",
                    });
                } else {
                    reject("Authentication timed out");
                }
            })
            .catch((e) => {
                reject(e);
            })
            .finally(() => {
                clearTimeout(timeout);
                timeout = null;
            });
    });
};

_this.IsTwitchConnected = () => {
    return _this.TwitchClient && _this.TwitchClient.readyState() == "OPEN";
};

/* REMOTES */

ipcMain.handle("Twitch_IsTwitchConnected", async (event, data) => {
    return _this.IsTwitchConnected();
});

ipcMain.handle("Twitch_ConnectToTwitch", async (event, data) => {
    //TODO; check if already connected + if same details
    try {
        await _this.TwitchClient.disconnect();
    } catch (e) {
        if (isDev) console.log(e);
    }

    try {
        let connection = await _this.ConnectToTwitch(event, data);

        return {
            success: connection.success,
            response: connection.response,
        };
    } catch (e) {
        return {
            success: false,
            response: "Could not connect",
        };
    }
});
