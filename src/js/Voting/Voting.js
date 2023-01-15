import React, { useEffect, useState } from "react";

import Effect from "./Effect";
import "../../css/bootstrap.min.css";
import "../../css/voting.css";
import "../../css/spinner.css";

export default function Voting(props) {
    const [effectList, setEffectList] = useState([]);
    const [highlightLastEffect, setHighlightLastEffect] = useState(false);
    const [lastEffectName, setLastEffectName] = useState("");
    const [votingEnabled, setVotingEnabled] = useState(false);
    const [totalVotes, setTotalVotes] = useState(0);
    const [canVote, setCanVote] = useState(true);
    const [isRandomEffect, setIsRandomEffect] = useState(false);

    useEffect(() => {
        //TODO: test to see if the order of these matter - separated to prevent infinite renders
        setInterval(countTotalVotes, 100);
        setInterval(GetEffectList, 100);
        setInterval(checkIfCanVote, 100);
    }, []);

    const checkIfCanVote = () => {
        window.electron.ChatAPI.CanVote().then((data) => {
            if (data) {
                setCanVote(true);
            } else {
                setCanVote(false);
            }
        });
    };

    const GetEffectList = () => {
        let effects;
        window.electron.EffectsAPI.GetEffects()
            .then((data) => {
                effects = data;
                return window.electron.EffectsAPI.LastPlayedEffect();
            })
            .then((data) => {
                if (data !== false) {
                    let found = false;
                    for (let effect of effects) {
                        if (effect.function === data) {
                            found = true;
                        }
                    }
                    if (found) {
                        setHighlightLastEffect(true);
                        setLastEffectName(data);
                        setIsRandomEffect(false);
                    } else {
                        setHighlightLastEffect(true);
                        setLastEffectName(data);
                        setIsRandomEffect(true);
                        setTimeout(() => {
                            setIsRandomEffect(false);
                        }, 1000);
                    }
                } else {
                    // setIsRandomEffect(false);
                    countTotalVotes(effects);
                    setEffectList(effects);
                }
            });
        window.electron.EffectsAPI.IsVotingEnabled().then((data) => {
            setVotingEnabled(data);
        });
    };

    const countTotalVotes = (effects) => {
        let votes = 0;
        if (!effects || effects.length == 0) return 0;
        for (let effect of effects) votes += effect.votes;
        setTotalVotes(votes);
    };

    const renderEffects = () => {
        let effects = [];
        for (let i = 0; i < 4; i++) {
            effects.push(
                <Effect
                    totalVotes={totalVotes}
                    effect={effectList[i] ? effectList[i] : null}
                    lastEffect={lastEffectName}
                    highlightLastEffect={highlightLastEffect}
                    key={i + 1}
                    index={i + 1}
                    canVote={canVote}
                    isRandomEffect={isRandomEffect}
                />
            );
        }
        return effects;
    };

    const EnableTwitchChaos = () => {
        window.electron.RconAPI.EnableVoting();
    };

    return (
        <div>
            <div id="greenscreen"></div>
            {/* {timeoutWarning && <div id="timeout-warning">This window will close automatically when Chaos is disabled. {`(${60 - timeouts})`}</div>} */}
            {votingEnabled !== true && (
                <div id="twitch-disabled">
                    <p>Voting is currently disabled on the server.</p>
                    <button onClick={EnableTwitchChaos}>Enable Voting</button>
                </div>
            )}
            {votingEnabled === true && (
                <div id="voting-panel">
                    <div id="total-votes">Total Votes: {totalVotes}</div>
                    {renderEffects()}
                </div>
            )}
        </div>
    );
}