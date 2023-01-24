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
_this.FailedConnections = 0;
_this.TryingConnection = false;

setInterval(() => {
    if (_this.FailedConnections > 10) {
        _this.RconServer = null;
        _this.TryingConnection = false;
        _this.FailedConnections = 0;
    }
}, 1000);

_this.ConnectToRcon = async (details, tryReconnect = false) => {
    return new Promise((resolve, reject) => {
        _this.RconServer = new Rcon(config);
        _this.TryingConnection = true;
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
            _this.TryingConnection = false;
            reject("Authentication timed out");
        }, 5000);

        try {
            /* Try authentication */
            _this.RconServer.authenticate(details ? details.serverpassword : config.serverpassword)
                .then((data) => {
                    if (timeout) {
                        _this.FailedConnections = 0;
                        _this.TryingConnection = false;
                        resolve({
                            server: _this.RconServer,
                            success: true,
                            response: data,
                        });
                    } else {
                        _this.TryingConnection = false;
                        reject("Authentication timed out");
                    }
                })
                .catch((e) => {
                    _this.TryingConnection = false;
                    _this.FailedConnections++;
                    // _this.RconServer = null;
                    console.log(e);
                    reject("Could not authenticate.");
                })
                .finally(() => {
                    _this.TryingConnection = false;
                    clearTimeout(timeout);
                    timeout = null;
                });
        } catch (e) {
            _this.TryingConnection = false;
            console.log(e);
            reject("Unable to connect to rcon.");
        }
    });
};

_this.IsRconConnected = () => {
    return _this.RconServer && _this.RconServer.authenticated && _this.RconServer.connected;
};

let retryConnectionTimer;
_this.GetEffectData = async (votedEffect) => {
    return new Promise((resolve, reject) => {
        try {
            if (!_this.IsRconConnected()) {
                reject("No RCON Connection.");
            }
            _this.RconServer.execute(`chaos_votes ${votedEffect}`)
                .then((data) => {
                    _this.FailedConnections = 0;
                    resolve(data);
                })
                .catch((e) => {
                    // if(!_this.IsRconConnected()){
                    _this.FailedConnections++;
                    if (!_this.TryingConnection) {
                        if (_this.FailedConnections < 10) {
                            _this.RconServer = null;
                            if (retryConnectionTimer) {
                                clearInterval(retryConnectionTimer);
                            }
                            retryConnectionTimer = setInterval(async () => {
                                console.log("Retrying rcon connection");
                                let connection = await _this.ConnectToRcon().catch((e) => {});
                                if (connection) {
                                    clearInterval(retryConnectionTimer);
                                }
                            }, 1000);
                        } else {
                            console.log("Exceeded max failed connections of (10)");
                            if (retryConnectionTimer) {
                                clearInterval(retryConnectionTimer);
                            }
                        }
                    }
                    reject("Error in getting chaos votes connections status: " + _this.IsRconConnected());
                });
        } catch (e) {
            _this.FailedConnections++;
            reject("Failed to execute command.");
        }
    });
};

_this.CloseConnection = () => {
    try {
        _this.RconServer.disconnect();
        _this.RconServer = null;
    } catch (e) {
        console.log(e);
    }
};

/* REMOTES */

ipcMain.handle("Rcon_IsRconConnected", async (event, data) => {
    return _this.IsRconConnected();
});

ipcMain.handle("Rcon_EnableVoting", async (event, data) => {
    try{
        await _this.RconServer.execute("sm_cvar sm_chaos_voting_enabled 1");
    }catch(e){
        console.log(e);
    }
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
            let version = await module.exports.RconServer.execute("chaos_version").catch((e) => {});
            let pluginVersion = version
                .substring(version.indexOf(">>") + 2, version.lastIndexOf("<<"))
                .split(".")
                .join("");
            // console.log(`Server is currently running v${pluginVersion}`);
            return pluginVersion;
        }
    } catch (e) {
        // console.log(e);
        return 0;
    }
    return 0;
});
