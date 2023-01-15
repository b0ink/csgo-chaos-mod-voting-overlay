const Rcon = require("rcon-srcds").default;

const { app } = require("electron");
const { ipcMain } = require("electron/main");

const Chat = require("./Chat");

const _this = module.exports;

/* Connection Details */
let config = {
    host: null,
    port: null,
    timeout: 5000,
    encoding: "ascii",
    maximumPacketSize: 4096,
    serverpassword: "",
};

_this.RconServer = new Rcon(config);

_this.ConnectToRcon = async (details) => {
    return new Promise((resolve, reject) => {
        _this.RconServer = new Rcon(config);

        /* Fill in details */
        if (details) {
            config.host = details.serverip;
            config.port = details.port;
            config.serverpassword = details.serverpassword;
            _this.RconServer.host = details.serverip;
            _this.RconServer.port = details.port;
        } else {
            _this.RconServer.host = config.host;
            _this.RconServer.port = config.port;
        }

        /* Manual timeout in case the connection hangs forever */
        let timeout = setTimeout(() => {
            reject("Authentication timed out");
        }, 5000);

        try {
            /* Try authentication */
            _this.RconServer.authenticate(details ? details.serverpassword : config.serverpassword)
                .then((data) => {
                    if (timeout) {
                        resolve({
                            server: _this.RconServer,
                            success: true,
                            response: data,
                        });
                    } else {
                        reject("Authentication timed out");
                    }
                })
                .catch((e) => {
                    reject("Could not authenticate:", e);
                })
                .finally(() => {
                    clearTimeout(timeout);
                    timeout = null;
                });
        } catch (e) {
            console.log(e);
            reject("Unable to connect to rcon.");
        }
    });
};

_this.IsRconConnected = () => {
    return _this.RconServer && _this.RconServer.authenticated && _this.RconServer.connected;
};

_this.GetEffectData = async (votedEffect) => {
    return new Promise((resolve, reject) => {
        try {
            if (!_this.IsRconConnected()) {
                reject("No RCON Connection.");
            }
            _this.RconServer.execute(`chaos_votes ${votedEffect}`)
                .then((data) => {
                    // _this.FailedAttempts = 0;
                    resolve(data);
                })
                .catch((e) => {
                    reject(e);
                });
        } catch (e) {
            reject("Failed to execute command.");
        }
    });
};

/* REMOTES */

ipcMain.handle("Rcon_IsRconConnected", async (event, data) => {
    return _this.IsRconConnected();
});

ipcMain.handle("Rcon_EnableVoting", async (event, data) => {
    await _this.RconServer.execute("sm_cvar sm_chaos_twitch_enabled 1");
});

ipcMain.handle("Rcon_ConnectToRcon", async (event, data) => {
    if (
        _this.IsRconConnected() &&
        _this.RconServer.host == data.serverip &&
        _this.RconServer.port == data.port &&
        _this.RconServer.serverpassword == data.serverpassword
    ) {
        return { success: true, response: "Already connected" };
    }
    try {
        let connection = await _this.ConnectToRcon(data);
        return {
            success: connection.success,
            response: connection.response,
        };
    } catch (e) {
        return {
            success: false,
            response: "Failed to connect",
        };
    }
});

ipcMain.handle("Rcon_GetServersChaosVersion", async (event, data) => {
    try {
        if (_this.RconServer.isConnected() && _this.RconServer.isAuthenticated()) {
            let version = await module.exports.RconServer.execute("csgo_chaos_mod_version").catch(e => {
                
            });
            version = version.replace('"csgo_chaos_mod_version" = "', "");
            version = version.split('"')[0];
            version = version.split(".").join("");
            return version;
        }
    } catch (e) {
        // console.log(e);
        return 0;
    }
    return 0;
});
