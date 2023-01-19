import React from "react";

export default function SavePasswordModal(props) {
    const SavePasswords = () => props.onSelection(true, true);
    const DontSavePasswords = () => props.onSelection(false, true);

    return (
        <div id="modal-background">
            <div id="modal-confirmation">
                <h4>Remember passwords?</h4>
                <p>
                    Would you like to save your RCON and Twitch passwords for next time?
                    <br />
                    <b>Note: </b> Login information is encrypted at on OS-level and stored in the app's installed directory.
                    <br />
                    If you share this computer with anyone else, select 'No'. Selecting 'No' will also clear any previously saved passwords.
                    <br />
                    You can change this in the app's preferences at any time.
                </p>
                <hr></hr>
                <div className="modal-buttons form-group">
                    <button type="submit" className="modal-btn" id="modal-yes" onClick={SavePasswords}>
                        Yes
                    </button>
                    <button type="submit" className="modal-btn" id="modal-no" onClick={DontSavePasswords}>
                        No
                    </button>
                </div>
                {/* <div id="modal-checkbox">
                    <input
                        id="remember-save"
                        name="remember-save"
                        type="checkbox"
                    />
                    <label for="remember-save">Remember My Choice</label>
                </div> */}
            </div>
        </div>
    );
}
