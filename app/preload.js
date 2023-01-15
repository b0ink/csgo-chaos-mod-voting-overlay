const { ipcRenderer, contextBridge } = require("electron");

contextBridge.exposeInMainWorld("electron", {
    EffectsAPI: {
        GetEffects: () => ipcRenderer.invoke("Effects_GetEffects"),
        IsVotingEnabled: () => ipcRenderer.invoke("Effects_IsVotingEnabled"),
        ShouldHideEffectList: () => ipcRenderer.invoke("Effects_ShouldHideEffectList"),
        LastPlayedEffect: () => ipcRenderer.invoke("Effects_GetLastPlayedEffect"),
    },
    ChatAPI: {
        CanVote: () => ipcRenderer.invoke("Chat_CanVote"),
    },
    RconAPI: {
        Connect: (data) => ipcRenderer.invoke("Rcon_ConnectToRcon", data),
        IsConnected: () => ipcRenderer.invoke("Rcon_IsRconConnected"),
        EnableVoting: () => ipcRenderer.invoke("Rcon_EnableVoting"),
        GetServersChaosVersion: () => ipcRenderer.invoke("Rcon_GetServersChaosVersion"),
    },
    YoutubeAPI: {
        Connect: (data) => ipcRenderer.invoke("Youtube_ConnectToYoutube", data),
        IsConnected: () => ipcRenderer.invoke("Youtube_IsYoutubeConnected"),
    },
    TwitchAPI: {
        Connect: (data) => ipcRenderer.invoke("Twitch_ConnectToTwitch", data),
        IsConnected: () => ipcRenderer.invoke("Twitch_IsTwitchConnected"),
    },
    PreferencesAPI: {
        GetDetails: () => ipcRenderer.invoke("Preferences_GetDetails"),
        SaveDetails: (data) => ipcRenderer.invoke("Preferences_SaveDetails", data),
    },
    WindowAPI: {
        OpenChaosDownload: () => ipcRenderer.invoke("Window_OpenChaosDownload"),
        OpenVotingOverlay: () => ipcRenderer.invoke("Window_OpenVotingWindow"),
        CloseVotingOverlay: () => ipcRenderer.invoke("Window_CloseVotingWindow"),
        OpenTMIoauth: () => ipcRenderer.invoke("Window_OpenTmiOauth"),
        SetWindowSize: (data) => ipcRenderer.invoke("Window_SetSetupSize", data),
    },
    VersionAPI: {
        GetAppVersion: () => ipcRenderer.invoke("Version_GetAppVersion"),
    },
});
