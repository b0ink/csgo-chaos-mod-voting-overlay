import React from "react";

export default function OutOfDatePlugin(props) {
    const updateAvailable = props.showNewVersion;
    // const updateAvailable = true; //debug

    return (
        <div className="header">
            {updateAvailable && (
                <sub id="old-version">
                    <a onClick={props.OpenChaosDownload} target="_blank" href="https://csgochaosmod.com/">
                        Click here
                    </a>{" "}
                    To download the latest version of the chaos plugin.
                </sub>
            )}
        </div>
    );
}
