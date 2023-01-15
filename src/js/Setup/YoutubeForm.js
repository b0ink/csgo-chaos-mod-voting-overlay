import React from "react";
import Throbber from "../Components/Throbber";

export default function Youtube(props) {
    return (
        <div>
            <div className="form-container">
                <h4>
                    Youtube
                    <Throbber isLoading={props.youtubeLoading} isConnected={props.youtubeConnected} isError={props.youtubeError} />
                </h4>
                <div className="form-group">
                    <input
                        type="text"
                        className="form-control"
                        placeholder="Channel ID"
                        name="youtubeChannelID"
                        id="youtubeChannelID"
                        required
                        value={props.login}
                        onChange={props.channelIdOnChange}
                        disabled={props.youtubeLoading || props.youtubeConnected}
                    />
                </div>

                <span id="oauth-gen">You can find your channel ID by navigating to the Advanced Settings on your YouTube profile.</span>
            </div>
        </div>
    );
}
