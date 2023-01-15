import React from "react";

export default function ConnectButton(props) {
    let buttonContent = "";
    let buttonClasses = "";
    if (props.isTwitchLoading || props.isYoutubeLoading || props.isRconLoading) {
        buttonContent = "Connecting...";
        buttonClasses = " connecting disabled";
    } else if (props.isRconConnected && (props.isTwitchConnected || props.isYoutubeConnected)) {
        buttonContent = "Connected!";
        buttonClasses = " connected disabled";
    } else {
        buttonContent = "Connect";
    }

    return (
        <div className="form-container buttons">
            <button id="reset">Reset</button>
            <button type="submit" id="connect-btn" onClick={props.onClick} className={buttonClasses} disabled={buttonContent != "Connect"}>
                {buttonContent}
            </button>
            {props.isRconConnected && (props.isTwitchConnected || props.isYoutubeConnected) && (
                <button type="submit" id="open-overlay" onClick={props.OpenVoting}>
                    Open Voting
                </button>
            )}
        </div>
    );
}
