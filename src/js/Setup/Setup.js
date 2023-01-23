import React, { useEffect, useMemo } from "react";
import Twitch from "./TwitchForm";
import Youtube from "./YoutubeForm";
import OutOfDatePlugin from "./OutOfDatePlugin";
import Rcon from "./RconForm";
import ConnectButton from "./ConnectButton";
import SavePasswordModal from "./SavePasswordModal";
import PreferenceButton from "./PreferenceButton";

import "../../css/bootstrap.min.css";
import "../../css/setup.css";
import "../../css/spinner.css";

import { useState } from "react";

//TODO: need a preferences page to toggle on/off the save password option
//      -> dark/light mode?
//      -> set which streaming service is started by default?

let rconConnected = false;
let twitchConnected = false;
let youtubeConnected = false;

export default function Setup() {
    let config;

    const [streamingService, setStreamingService] = useState("Twitch");

    const [isTwitchLoading, setTwitchLoading] = useState(false);
    const [isTwitchConnected, setTwitchConnected] = useState(false);
    const [isTwitchError, setTwitchError] = useState(false);

    const [isRconLoading, setRconLoading] = useState(false);
    const [isRconConnected, setRconConnected] = useState(false);
    const [isRconError, setRconError] = useState(false);

    const [isYoutubeLoading, setYoutubeLoading] = useState(false);
    const [isYoutubeConnected, setYoutubeConnected] = useState(false);
    const [isYoutubeError, setYoutubeError] = useState(false);
    const [youtubeChannelID, setYoutubeChannelID] = useState("");

    const [username, setUsername] = useState("");
    const [channelname, setChannelname] = useState("");
    const [twitchpassword, setTwitchPassword] = useState("");
    const [serverip, setServerIP] = useState("");
    const [port, setPort] = useState("");
    const [serverpassword, setServerPassword] = useState("");

    const [isIpVisible, setIpVisible] = useState(false);
    const [isRconVisible, setRconVisible] = useState(false);

    const [isPromptingSavePass, setPromptingSavePass] = useState(false);

    const [shouldPromptSavePass, setShouldPromptSavePass] = useState(false);
    const [alwaysSavePass, setAlwaysSavePass] = useState(false);

    const [appVersion, setAppVersion] = useState("");

    useEffect(() => {
        rconConnected = isRconConnected;
        twitchConnected = isTwitchConnected;
        youtubeConnected = isYoutubeConnected;
    }, [isRconConnected, isYoutubeConnected, isTwitchConnected]);

    useEffect(() => {
        window.electron.PreferencesAPI.GetValue("connection.streamingService").then((service) => {
            if (service !== "Twitch" && service !== "YouTube") {
                service = "Twitch";
            }
            setStreamingService(service);
            window.electron.WindowAPI.SetWindowSize(service);
        });
    }, []);

    useEffect(() => {
        setInterval(() => {
            window.electron.RconAPI.IsConnected().then((data) => {
                if (!data && rconConnected) {
                    setRconConnected(false);
                    setRconError(true);
                    setRconLoading(false);
                } else if (data) {
                    setTimeout(() => {
                        setRconConnected(true);
                        setRconError(false);
                        setRconLoading(false);
                    }, 2000);
                }
            });

            window.electron.TwitchAPI.IsConnected().then((data) => {
                if (!data && twitchConnected) {
                    setTwitchConnected(false);
                    setTwitchError(true);
                    setTwitchLoading(false);
                } else if (data) {
                    setTwitchConnected(true);
                    setTwitchError(false);
                    setTwitchLoading(false);
                }
            });

            window.electron.YoutubeAPI.IsConnected().then((data) => {
                if (!data && youtubeConnected) {
                    setYoutubeConnected(false);
                    setYoutubeError(true);
                    setYoutubeLoading(false);
                } else if (data) {
                    setYoutubeConnected(true);
                    setYoutubeError(false);
                    setYoutubeLoading(false);
                }
            });
        }, 1000);
    }, []);

    const HideModal = () => setPromptingSavePass(false);
    const SaveDetails = (allowSave) => {
        window.electron.PreferencesAPI.SetValue({
            //TODO: semi-redundant save
            key: "connection.savePasswords",
            value: allowSave,
        })
            .then(() => {
                return window.electron.PreferencesAPI.SaveDetails({
                    username,
                    channelname,
                    twitchpassword,

                    serverip,
                    port,
                    serverpassword,

                    youtubeChannelID,
                });
            })
            .then(() => {
                window.electron.PreferencesAPI.SetValue({
                    key: "connection.isFirstTimeConnection",
                    value: false,
                });
            });

        HideModal();
    };

    const ToggleIp = (event) => setIpVisible(!isIpVisible);
    const ToggleRcon = (event) => setRconVisible(!isRconVisible);

    const OpenVoting = (e) => {
        e.preventDefault();
        window.electron.WindowAPI.OpenVotingOverlay();
    };
    const ConnectToTwitch = (data) => {
        window.electron.TwitchAPI.Connect(data).then((value) => {
            if (value && value.success) {
                setTwitchLoading(false);
                setTwitchConnected(true);
            } else {
                setTwitchConnected(false);
                setTwitchLoading(false);
                setTwitchError(true);
            }
        });
    };

    const ConnectToYoutube = (data) => {
        window.electron.YoutubeAPI.Connect(data)
            .then((value) => {
                if (value.success) {
                    setYoutubeLoading(false);
                    setYoutubeConnected(true);
                } else {
                    throw "Rejected Youtube Connection";
                }
            })
            .catch((e) => {
                setYoutubeLoading(false);
                setYoutubeConnected(false);
                setYoutubeError(true);
            });
    };

    const [latestPluginVersion, setLatestPluginVersion] = useState(0);
    const [serversPluginVersion, setServersPluginVersion] = useState(999);

    const ConnectToRcon = (data) => {
        window.electron.RconAPI.Connect(data)
            .then((value) => {
                if (value && value.success) {
                    setTimeout(() => {
                        // Delay because it can either connect or refuse instantly (aesthetic)
                        if (shouldPromptSavePass) {
                            setTimeout(() => {
                                setPromptingSavePass(true);
                            }, 1000);
                        } else {
                            // not the first connection, skip prompt and save details
                            SaveDetails(alwaysSavePass);
                        }

                        window.electron.RconAPI.GetServersChaosVersion().then((data) => {
                            setServersPluginVersion(data);
                        });
                        setRconLoading(false);
                        setRconConnected(true);
                        setRconError(false);
                    }, 2000);
                } else {
                    throw "Error";
                    //TODO: flash error messages
                }
            })
            .catch((e) => {
                console.log("failed rcon", e);
                setTimeout(() => {
                    setRconLoading(false);
                    setRconConnected(false);
                    setRconError(true);
                    setTimeout(() => {
                        // setRconError(false);
                    }, 2000);
                }, 2000);
            });
    };

    useMemo(() => {
        fetch("https://csgochaosmod.com/version.php")
            .then((res) => {
                return res.json();
            })
            .then((data) => {
                if (data.version) {
                    setLatestPluginVersion(data.version.split(".").join(""));
                }
            });

        window.electron.VersionAPI.GetAppVersion().then((data) => {
            setAppVersion(data);
        });

        window.electron.PreferencesAPI.GetDetails()
            .then((data) => {
                setUsername(data.username);
                setChannelname(data.channelname);
                setTwitchPassword(data.twitchpassword);
                setServerIP(data.serverip);
                setPort(data.port);
                setServerPassword(data.serverpassword);
                setYoutubeChannelID(data.youtubeChannelID);
                return window.electron.PreferencesAPI.GetValue("connection.isFirstTimeConnection");
            })
            .then((data) => {
                setShouldPromptSavePass(data);
                return window.electron.PreferencesAPI.GetValue("connection.savePasswords");
            })
            .then((data) => {
                setAlwaysSavePass(data);
            });
    }, []);

    const usernameOnChange = (event) => setUsername(event.target.value);
    const channelnameOnChange = (event) => setChannelname(event.target.value);
    const twitchpasswordOnChange = (event) => setTwitchPassword(event.target.value);
    const serveripOnChange = (event) => setServerIP(event.target.value);
    const portOnChange = (event) => {
        let sanitized = event.target.value.replace(/[^0-9]/g, "");
        setPort(sanitized);
    };
    const serverpasswordOnChange = (event) => setServerPassword(event.target.value);
    const channelIdOnChange = (event) => setYoutubeChannelID(event.target.value);

    const SubmitForm = (e) => {
        e.preventDefault();
        setTwitchLoading(false);
        setYoutubeLoading(false);

        setTwitchConnected(false);
        setTwitchError(false);

        setRconLoading(true);
        setRconConnected(false);
        setRconError(false);

        setYoutubeConnected(false);
        setYoutubeError(false);

        let data = {
            serverip: e.target.serverip.value,
            port: e.target.port.value,
            serverpassword: e.target.serverpassword.value,
        };

        if (streamingService == "YouTube") {
            data.youtubeChannelID = e.target.youtubeChannelID.value;
        } else if (streamingService == "Twitch") {
            data.username = e.target.username.value;
            data.channelname = e.target.channelname.value;
            data.twitchpassword = e.target.twitchpassword.value;
        }

        config = data;
        if (streamingService == "YouTube") {
            setYoutubeLoading(true);
            ConnectToYoutube(data);
        } else {
            setTwitchLoading(true);
            ConnectToTwitch(data);
        }
        ConnectToRcon(data);
    };

    const OpenChaosDownload = (e) => {
        e.preventDefault();
        window.electron.WindowAPI.OpenChaosDownload();
    };

    const OpenTMIoauth = (e) => {
        e.preventDefault();
        window.electron.WindowAPI.OpenTMIoauth();
    };

    const ChangeStreamingService = (service) => {
        window.electron.WindowAPI.SetWindowSize(service);
        setStreamingService(service);
    };

    return (
        <div>
            {isPromptingSavePass && <SavePasswordModal onSelection={SaveDetails} />}
            <OutOfDatePlugin OpenChaosDownload={OpenChaosDownload} showNewVersion={parseInt(latestPluginVersion) > parseInt(serversPluginVersion)} />
            <form action="" method="post" onSubmit={SubmitForm}>
                <div id="connection-tab">
                    <button
                        disabled={isTwitchLoading || isTwitchConnected || isYoutubeLoading || isYoutubeConnected}
                        type="button"
                        name="Twitch"
                        className={streamingService == "Twitch" ? "selected-tab-group" : ""}
                        onClick={() => ChangeStreamingService("Twitch")}
                    >
                        Twitch
                    </button>
                    <button
                        disabled={isTwitchLoading || isTwitchConnected || isYoutubeLoading || isYoutubeConnected}
                        type="button"
                        name="YouTube"
                        className={streamingService == "YouTube" ? "selected-tab-group" : ""}
                        onClick={() => ChangeStreamingService("YouTube")}
                    >
                        Youtube
                    </button>
                </div>
                {streamingService == "Twitch" && (
                    <Twitch
                        twitchLoading={isTwitchLoading}
                        twitchConnected={isTwitchConnected}
                        twitchError={isTwitchError}
                        login={{ username, channelname, twitchpassword }}
                        usernameOnChange={usernameOnChange}
                        channelnameOnChange={channelnameOnChange}
                        twitchpasswordOnChange={twitchpasswordOnChange}
                        OpenTMIoauth={OpenTMIoauth}
                    />
                )}
                {streamingService == "YouTube" && (
                    <Youtube
                        youtubeLoading={isYoutubeLoading}
                        youtubeConnected={isYoutubeConnected}
                        youtubeError={isYoutubeError}
                        login={youtubeChannelID}
                        channelIdOnChange={channelIdOnChange}
                    />
                )}
                <div className="spacer" />
                <Rcon
                    rconLoading={isRconLoading}
                    rconConnected={isRconConnected}
                    rconError={isRconError}
                    login={{ serverip, port, serverpassword }}
                    serveripOnChange={serveripOnChange}
                    portOnChange={portOnChange}
                    serverpasswordOnChange={serverpasswordOnChange}
                    ToggleIp={ToggleIp}
                    isIpVisible={isIpVisible}
                    ToggleRcon={ToggleRcon}
                    isRconVisible={isRconVisible}
                />
                <div className="spacer" />
                <div id="connected-status" className={(isRconConnected && isTwitchConnected) || (isRconConnected && isYoutubeConnected) ? "display" : "hide"}>
                    Connected!
                </div>
                <ConnectButton
                    isRconConnected={isRconConnected}
                    isRconLoading={isRconLoading}
                    isTwitchConnected={isTwitchConnected}
                    isTwitchLoading={isTwitchLoading}
                    isYoutubeConnected={isYoutubeConnected}
                    isYoutubeLoading={isYoutubeLoading}
                    OpenVoting={OpenVoting}
                />
            </form>
            <span id="version">v{appVersion}</span>
            <PreferenceButton />
        </div>
    );
}
