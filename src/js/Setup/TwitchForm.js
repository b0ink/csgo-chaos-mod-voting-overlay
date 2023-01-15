import React from "react";
import Throbber from "../Components/Throbber";

export default function Twitch(props) {
    return (
        <div>
            <div className="form-container">
                <h4>
                    Twitch
                    <Throbber isLoading={props.twitchLoading} isConnected={props.twitchConnected} isError={props.twitchError} />
                </h4>
                <div className="form-group">
                    <input
                        type="text"
                        className="form-control"
                        placeholder="Username"
                        name="username"
                        id="username"
                        required
                        value={props.login.username}
                        onChange={props.usernameOnChange}
                        disabled={props.twitchLoading || props.twitchConnected}
                    />
                </div>
                <div className="form-group">
                    <input
                        type="text"
                        className="form-control"
                        placeholder="Channel Name"
                        name="channelname"
                        id="channelname"
                        required
                        value={props.login.channelname}
                        onChange={props.channelnameOnChange}
                        disabled={props.twitchLoading || props.twitchConnected}
                    />
                </div>
                <div className="form-group">
                    <input
                        type="password"
                        className="form-control"
                        placeholder="OAuth Password"
                        name="twitchpassword"
                        id="twitchpassword"
                        required
                        value={props.login.twitchpassword}
                        onChange={props.twitchpasswordOnChange}
                        disabled={props.twitchLoading || props.twitchConnected}
                    />
                </div>

                <span id="oauth-gen">
                    Generate your OAuth Password{" "}
                    <a title="https://twitchapps.com/tmi/" href="https://twitchapps.com/tmi/" onClick={props.OpenTMIoauth} target="_blank">
                        here.
                    </a>
                </span>
            </div>
        </div>
    );
}
