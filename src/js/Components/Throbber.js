import React from "react";

export default function Throbber(props) {
    return (
        <span>
            {props.isLoading && (
                <span>
                    <div className="three-quarters-loader">Loading...</div>
                </span>
            )}
            {props.isConnected && (
                <span>
                    <svg xmlns="http://www.w3.org/2000/svg" width="28" height="24" fill="currentColor" className="bi bi-check checkmark" viewBox="0 0 16 16">
                        <path d="M10.97 4.97a.75.75 0 0 1 1.07 1.05l-3.99 4.99a.75.75 0 0 1-1.08.02L4.324 8.384a.75.75 0 1 1 1.06-1.06l2.094 2.093 3.473-4.425a.267.267 0 0 1 .02-.022z" />
                    </svg>
                </span>
            )}
            {props.isError && (
                <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="28"
                    height="24"
                    fill="currentColor"
                    className="bi bi-exclamation-circle errorIcon"
                    viewBox="0 0 16 16"
                >
                    <path d="M8 15A7 7 0 1 1 8 1a7 7 0 0 1 0 14zm0 1A8 8 0 1 0 8 0a8 8 0 0 0 0 16z" />
                    <path d="M7.002 11a1 1 0 1 1 2 0 1 1 0 0 1-2 0zM7.1 4.995a.905.905 0 1 1 1.8 0l-.35 3.507a.552.552 0 0 1-1.1 0L7.1 4.995z" />
                </svg>
            )}
            {!props.isError && (
                <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="28"
                    height="24"
                    fill="currentColor"
                    className="bi bi-exclamation-circle errorIcon hide"
                    viewBox="0 0 16 16"
                >
                    <path d="M8 15A7 7 0 1 1 8 1a7 7 0 0 1 0 14zm0 1A8 8 0 1 0 8 0a8 8 0 0 0 0 16z" />
                    <path d="M7.002 11a1 1 0 1 1 2 0 1 1 0 0 1-2 0zM7.1 4.995a.905.905 0 1 1 1.8 0l-.35 3.507a.552.552 0 0 1-1.1 0L7.1 4.995z" />
                </svg>
            )}
        </span>
    );
}
