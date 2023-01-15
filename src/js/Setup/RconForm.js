import React from "react";
import Throbber from "../Components/Throbber";
import ToggleVisibility from "../Components/ToggleVisibility";

export default function Rcon(props) {
    let ipInputType = "text";
    if (!props.isIpVisible) {
        ipInputType = "password";
    }

    let serverpasswordInputType = "text";
    if (!props.isRconVisible) {
        serverpasswordInputType = "password";
    }

    return (
        <div>
            <div className="form-container">
                <h4>
                    RCON
                    <Throbber isLoading={props.rconLoading} isConnected={props.rconConnected} isError={props.rconError} />
                </h4>
                <div className="form-group split">
                    <div className="visibility">
                        <ToggleVisibility ToggleCallback={props.ToggleIp} isVisible={props.isIpVisible} />
                        <input
                            id="serverip"
                            type={ipInputType}
                            className="form-control"
                            placeholder="Server IP"
                            name="serverip"
                            value={props.login.serverip}
                            onChange={props.serveripOnChange}
                            disabled={props.rconLoading || props.rconConnected}
                        />
                    </div>

                    <input
                        id="port"
                        type="text"
                        className="form-control"
                        placeholder="Port"
                        name="port"
                        value={props.login.port}
                        onChange={props.portOnChange}
                        disabled={props.rconLoading || props.rconConnected}
                    />
                </div>
                <div className="form-group">
                    <div className="visibility">
                        <ToggleVisibility ToggleCallback={props.ToggleRcon} isVisible={props.isRconVisible} />
                        <input
                            type={serverpasswordInputType}
                            className="form-control"
                            placeholder="Password"
                            name="serverpassword"
                            value={props.login.serverpassword}
                            onChange={props.serverpasswordOnChange}
                            disabled={props.rconLoading || props.rconConnected}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
}
