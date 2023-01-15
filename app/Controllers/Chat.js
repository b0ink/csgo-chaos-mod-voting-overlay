const _this = module.exports;

const { app } = require("electron");
const { ipcMain } = require("electron/main");

const EffectsController = require("./Effects");

_this.VoteTracker = {};
_this.CanVote = true;

_this.SaveVote = (message, userIdentifier) => {
    let vote = parseInt(message);
    if (vote > 0 && vote <= 8 && _this.VoteTracker[userIdentifier] !== true) {
        if (!_this.CanVote) return;
        try {
            if ([1, 2, 3, 4].includes(parseInt(EffectsController.Effects[0].index))) {
                if (vote > 4) return;
            } else {
                if (vote < 5) return;
            }
            if (vote > 4) vote = vote - 4;
            EffectsController.Effects[vote - 1].votes += 1;
            if (app.isPackaged) {
                _this.VoteTracker[userIdentifier] = true;
            }
        } catch (e) {
            _this.VoteTracker[userIdentifier] = false;
        }
    }
};

/* REMOTES */

ipcMain.handle("Chat_CanVote", async (event, data) => {
    return _this.CanVote;
});
