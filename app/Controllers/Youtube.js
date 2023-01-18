const _this = module.exports;

const { app } = require("electron");
const { ipcMain } = require("electron/main");

const { LiveChat } = require("youtube-chat");
const Chat = require("./Chat");

_this.liveChat = null;
_this.liveChatListener = null;

_this.ConnectToYoutube = async function (event, details) {
    return new Promise((resolve, reject) => {
        try {
            _this.liveChat.stop();
            _this.liveChatListener = null;
        } catch (e) {
        } finally {
            _this.liveChat = null;
            _this.liveChat = new LiveChat({
                channelId: details.youtubeChannelID,
            });

            this.liveChat
                .start()
                .then((ok) => {
                    _this.liveChatListener = _this.liveChat.on("chat", (chatItem) => {
                        let msg;
                        let author;
                        try {
                            msg = chatItem.message[0].text;
                            author = chatItem.author.channelId;
                        } catch (e) {
                            console.log(e);
                        } finally {
                            Chat.SaveVote(msg, author);
                        }
                    });
                    resolve({
                        success: true,
                    });
                })
                .catch((e) => {
                    reject("Could not connect to youtube " + e);
                });
        }
    });
};

_this.CloseConnection = () => {
    try{
        _this.liveChat.stop();
        _this.liveChatListener = null;
        _this.liveChat = null;
    }catch(e){
        console.log(e);
    }
}

/* REMOTES */

ipcMain.handle("Youtube_ConnectToYoutube", async (event, data) => {
    let ytConnection = await _this.ConnectToYoutube(event, data);
    return {
        success: ytConnection.success,
    };
});
