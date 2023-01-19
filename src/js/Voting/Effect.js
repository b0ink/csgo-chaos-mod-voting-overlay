import React from "react";

export default function Effect(props) {
    let effectClass = "effect";

    /* Calculate percentage bar length */
    let percent = 0;
    if (props.effect){
        percent = Math.floor((props.effect.votes / props.totalVotes) * 100);
        if(props.totalVotes == 0){
            percent = 25;
        }
    }

    let style = {
        width: `calc(${percent ? percent : 0}% - 20px)`,
    };

    if (!props.canVote) {
        style["backgroundColor"] = "#474747";
        effectClass += " greyed-out";
    }

    /* If this == selected effect, highlight background */
    if (props.effect && props.highlightLastEffect) {
        if (props.lastEffect == props.effect.function || (props.isRandomEffect && props.index == 4)) {
            style["backgroundColor"] = "var(--winning-effect-color)";
            effectClass += " highlight";
        } else {
            effectClass += " non-highlight";
        }
    }

    let containerClass = 'effect-container';
    if(!props.effect){
        containerClass += ' offside';
    }

    return (
        <div className={containerClass}>
            {!props.effect && (
                <div className="effect">
                    <span></span>
                    <span>Loading...</span>
                    <span></span>
                </div>
            )}
            {props.effect && (
                <div className={effectClass}>
                    <div id="loadingbar" style={style}></div>
                    <span>{props.effect.index}.</span>
                    <span>{props.effect.name}</span>
                    <span>{percent ? percent : "0"}%</span>
                </div>
            )}
        </div>
    );
}
