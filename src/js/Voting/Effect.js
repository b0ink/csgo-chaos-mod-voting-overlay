import React from "react";

export default function Effect(props) {
    let effectClassName = ["effect"];
    let containerClassName = ["effect-container"];

    let containerStyle = {};

    /* Calculate percentage bar length */
    let percent = 0;

    if (props.effect) {
        percent = Math.floor((props.effect.votes / props.totalVotes) * 100);
        if (props.totalVotes == 0) {
            percent = 25;
        }
    }

    let style = {
        width: `${percent ? percent : 0}%`,
    };

    /* Disabled 1 second before pulling vote */
    if (!props.canVote) {
        style["backgroundColor"] = "#474747";
        effectClassName.push("greyed-out");
    }

    /* If this == selected effect, highlight background */
    if (props.effect && props.highlightLastEffect) {
        if (props.lastEffect == props.effect.function || (props.isRandomEffect && props.index == 4)) {
            style["backgroundColor"] = "var(--winning-effect-color)";
            effectClassName.push("highlight");
        } else {
            effectClassName.push("non-highlight");
        }
    }

    /* Push effect off the screen while no active effects */
    if (!props.effect) {
        containerStyle["transitionDelay"] = `${props.index * 0.1}s`;
        containerClassName.push("offside");
    }

    return (
        <div className={containerClassName.join(" ")} style={containerStyle}>
            {!props.effect && (
                <div className="effect">
                    <span></span>
                    <span>Loading...</span>
                    <span></span>
                </div>
            )}
            {props.effect && (
                <div className={effectClassName.join(" ")}>
                    <div id="loadingbar" style={style}></div>
                    <span>{props.effect.index}.</span>
                    <span>{props.effect.name}</span>

                    {props.IsProportionalVoting ? (
                        <span>{percent ? percent : "0"}%</span>
                    ) : (
                        <span>{props.effect && props.effect.votes ? props.effect.votes : "0"}</span>
                    )}
                </div>
            )}
        </div>
    );
}
