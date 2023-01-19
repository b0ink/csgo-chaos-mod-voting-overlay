const { app } = require("electron");
const { ipcMain } = require("electron/main");

const _this = module.exports;

const Chat = require("./Chat");
const Preferences = require('./Preferences');

_this.VotingWindowOpen = false;
_this.LastPlayedEffect = "";
_this.VotingEnabled = false;
_this.HideEffectList = false;
_this.NextEffectTime = 0;
_this.Effects = [];
_this.HighlightWinningEffect = false;
_this.ProportionalVoting = true;

const Rcon = require("./Rcon");
const Twitch = require("./Twitch");
const Youtube = require("./Youtube");


let finalCheckTimer = null;
let disableVoteTimer = null;
let delayEffectTimer = null;

setInterval(() => {
    if (!Rcon.IsRconConnected()) {
        ResetVoting();
        return;
    };
    if (!_this.VotingWindowOpen) return;
    GetServerData();
}, 1000);

const ResetVoting = () => {
    _this.HideEffectList = true;
    _this.Effects = [];
    _this.HighlightWinningEffect = false;
    clearTimeout(finalCheckTimer);
    clearTimeout(disableVoteTimer);
    clearTimeout(delayEffectTimer);
}

const GetServerData = async () => {
    await Rcon.GetEffectData(GetWinningEffect())
        .then((data) => {
            data = ParseServerData(data);
            if(!data || !data.lastPlayedEffect){
                ResetVoting();
                return;
            }
            data.LastPlayedEffect = data.lastPlayedEffect;
            if (data.newEffectTime != _this.NextEffectTime) {
                /* New set of effects */

                let effects = data.effects;
                if (!effects || !Array.isArray(effects) || data.newEffectTime <= 0) {
                    ResetVoting();
                    return;
                } else {
                    delayEffectTimer = setTimeout(() => {
                        for (let effect of effects) {
                            effect.votes = 0;
                        }
                        _this.Effects = effects;
                        Chat.VoteTracker = {};
                        Chat.CanVote = true;
                    }, 1000);

                    _this.NextEffectTime = data.newEffectTime;

                    let interval = Math.floor(data.newEffectTime) - Math.floor(Date.now() / 1000);
                    finalCheckTimer = setTimeout(GetServerData, interval * 1000);

                    disableVoteTimer = setTimeout(() => {
                        /* Disable votes 1 second before pulling new effect */
                        Chat.CanVote = false;
                    }, interval * 1000 - 1000);

                    _this.LastPlayedEffect = data.lastPlayedEffect;
                    _this.HighlightWinningEffect = true;
                }
            }

            _this.VotingEnabled = data.twitchEnabled;
            _this.HideEffectList = data.hideEffectList;
        })
        .catch((e) => {
            //TODO: handle failed attempts
            ResetVoting();
            console.log(e)
        });
};

const ParseServerData = (data) => {
    try {
        data = JSON.parse(data);
        return data;
    } catch (e) {
        return null;
    }
};

const GetWinningEffect = () => {
    if (_this.ProportionalVoting) {
        /* Get effect based of proportional votes */
        let sortedEffects = [..._this.Effects];

        /* Order from lowest to highest */
        sortedEffects = sortedEffects.sort(function (a, b) {
            return a.votes - b.votes;
        });

        let totalVotes = 0;
        for (let effect of sortedEffects) {
            totalVotes += effect.votes;
        }

        if (sortedEffects.length < 4) {
            return "Random";
        }

        let check1 = sortedEffects[0].votes;
        let check2 = check1 + sortedEffects[1].votes;
        let check3 = check2 + sortedEffects[2].votes;
        let check4 = check3 + sortedEffects[3].votes;

        /* between 1 and totalVotes (inclusive) */
        let rand = Math.floor(Math.random() * totalVotes) + 1; 
        let fctn = "";
        if (rand <= check1) {
            fctn = sortedEffects[0].function;
        } else if (rand <= check2) {
            fctn = sortedEffects[1].function;
        } else if (rand <= check3) {
            fctn = sortedEffects[2].function;
        } else if (rand <= check4) {
            fctn = sortedEffects[3].function;
        } else {
            fctn = "random";
        }
        return fctn;
    } else {
        /* Get highest voted effect */
        let vote = 0;
        let fctn = "";

        for (let effect of _this.Effects) {
            if (effect.votes >= vote) {
                vote = effect.votes;
                fctn = effect.function;
            }
        }

        return fctn ? fctn : "RANDOM";
    }
};


Preferences.preferences.on('save', (data) => {
    try{
        if(data.voting.votingstyle == "mostvoted"){
            _this.ProportionalVoting = false;
        }else{
            _this.ProportionalVoting = true;
        }
    }catch(e){
        _this.ProportionalVoting = true;
    }
})

/* REMOTES */

ipcMain.handle("Effects_GetEffects", async (event, data) => {
    return _this.Effects;
});

ipcMain.handle("Effects_IsVotingEnabled", async (event, data) => {
    return _this.VotingEnabled;
});

ipcMain.handle("Effects_ShouldHideEffectList", async (event, data) => {
    return _this.HideEffectList;
});

ipcMain.handle("Effects_GetLastPlayedEffect", async (event, data) => {
    if (_this.HighlightWinningEffect) {
        _this.HighlightWinningEffect = false;
        return _this.LastPlayedEffect;
    }
    return false;
});
