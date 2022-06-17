import React, { useState, useEffect, useCallback, useMemo } from "react";
import PropTypes from "prop-types";
import { squareState, smiley, INFINITY_CHAR, MINE } from "../constants";

let interval,
    tail = squareState.LIST_END;

function Minesweeper({ difficulty = "easy" }) {
    let [loading, setLoading] = useState(true),
        [width, setWidth] = useState(0),
        [total, setTotal] = useState(0),
        [mines, setMines] = useState(0),
        [difficultyClass, setDifficultyClass] = useState(""),
        [exposed, setExposed] = useState([]),
        [adjacent, setAdjacent] = useState([]),
        [flags, setFlags] = useState(0),
        [remaining, setRemaining] = useState(0),
        [smileyMood, setSmileyMood] = useState(smiley.BORED),
        [timer, setTimer] = useState(false),
        [startTime, setStartTime] = useState(),
        [mineDisplay, setMineDisplay] = useState(0),
        [timerDisplay, setTimerDisplay] = useState(0);

    let generateSquareClass = thisSquare => {
        let exp = exposed[thisSquare],
            className = "";

        exp = typeof exp !== "number" ? squareState.UNEXPOSED : exp;

        if (exp <= squareState.UNEXPOSED) {
            if (exp === squareState.UNEXPOSED) {
                // If just unexposed, do nothing
            } else if (exp === squareState.FLAGGED) {
                className += " icon-flag";
            } else {
                className += " icon-q";
            }
        } else {
            let adj = adjacent[thisSquare];
            className += " panel--exposed";

            if (exp === squareState.EXPLODED) {
                className += " icon-exploded";
            } else if (exp === squareState.INCORRECT) {
                className += " icon-x";
            } else if (adj === MINE) {
                className += " icon-mine";
            } else {
                className += " icon-" + adj;
            }
        }

        return className;
    };

    let applyToNeighbours = (i, f) => {
        var x = i % width;
        if (i >= width) {
            if (x > 0) {
                f(i - width - 1);
            }
            f(i - width);
            if (x + 1 < width) {
                f(i - width + 1);
            }
        }
        if (x > 0) {
            f(i - 1);
        }
        if (x + 1 < width) {
            f(i + 1);
        }
        if (i < total - width) {
            if (x > 0) {
                f(i + width - 1);
            }
            f(i + width);
            if (x + 1 < width) {
                f(i + width + 1);
            }
        }
    };

    let neighbourIsMine = thisSquare => {
        if (adjacent[thisSquare] !== MINE) {
            adjacent[thisSquare]++;
        }
    };

    let layMines = () => {
        let laid = 0;

        while (laid < mines) {
            let target = Math.floor(Math.random() * total);

            if (target < total && adjacent[target] !== MINE) {
                adjacent[target] = MINE;
                applyToNeighbours(target, neighbourIsMine);
                laid++;
            }
        }

        setAdjacent([...adjacent]);
    };

    let clearBoard = () => {
        for (let i = 0; i < total; i++) {
            adjacent[i] = 0;
            if (exposed[i] !== squareState.UNEXPOSED) {
                exposed[i] = squareState.UNEXPOSED;
            }
        }

        setExposed([...exposed]);
    };

    let expose = thisSquare => {
        if (
            exposed[thisSquare] <= squareState.UNEXPOSED &&
            exposed[thisSquare] !== squareState.FLAGGED
        ) {
            remaining = remaining - 1;
            exposed[thisSquare] = squareState.LIST_END;
            exposed[tail] = thisSquare;
            tail = thisSquare;
        }
    };

    let clickSquare = (event, thisSquare) => {
        if (smileyMood !== smiley.BORED) {
            return false;
        }

        if (!timer) {
            setTimer(true);
            setStartTime(new Date());
        }

        if (exposed[thisSquare] > squareState.UNEXPOSED) {
            // If already exposed, do nothing
        } else if (event.button === 2) {
            var exp = exposed[thisSquare];

            if (exp === squareState.UNEXPOSED) {
                exposed[thisSquare] = squareState.FLAGGED;
                flags = flags + 1;
            } else if (exp === squareState.FLAGGED) {
                exposed[thisSquare] = squareState.QUERIED;
                flags = flags - 1;
            } else if (exp === squareState.QUERIED) {
                exposed[thisSquare] = squareState.UNEXPOSED;
            }

            setFlags(flags);
            setExposed([...exposed]);
        } else if (adjacent[thisSquare] === MINE) {
            remaining = remaining - 1;
            exposed[thisSquare] = squareState.EXPLODED;

            for (let i = 0; i < total; i++) {
                if (i === thisSquare) {
                } else if (
                    adjacent[i] === MINE &&
                    exposed[i] !== squareState.FLAGGED
                ) {
                    remaining = remaining - 1;
                    exposed[i] = squareState.LIST_END;
                } else if (
                    adjacent[i] !== MINE &&
                    exposed[i] === squareState.FLAGGED
                ) {
                    remaining = remaining - 1;
                    exposed[i] = squareState.INCORRECT;
                }
            }

            setTimer(false);
            setRemaining(remaining);
            setSmileyMood(smiley.SAD);
            setExposed([...exposed]);
        } else {
            if (exposed[thisSquare] === squareState.FLAGGED) {
                flags = flags - 1;
            }

            remaining = remaining - 1;
            exposed[thisSquare] = squareState.LIST_END;

            tail = thisSquare;
            var pending = thisSquare;

            while (pending !== squareState.LIST_END) {
                if (adjacent[pending] === 0) {
                    applyToNeighbours(pending, expose);
                }

                pending = exposed[pending];
            }

            if (remaining === mines) {
                for (let i = 0; i < total; i++) {
                    if (
                        adjacent[i] === MINE &&
                        exposed[i] <= squareState.UNEXPOSED &&
                        exposed[i] !== squareState.FLAGGED
                    ) {
                        exposed[i] = squareState.FLAGGED;
                        flags = flags + 1;
                    }
                }

                setTimer(false);
                setSmileyMood(smiley.HAPPY);
            }

            setFlags(flags);
            setRemaining(remaining);
            setExposed([...exposed]);
        }
    };

    let erase = useCallback(() => {
        clearBoard();

        setTimerDisplay(0);
        setFlags(0);
        setRemaining(total);
        setTimer(false);
        setSmileyMood(smiley.BORED);

        layMines();
    }, [adjacent, exposed, total]);

    useEffect(() => {
        let count = mines - flags;
        setMineDisplay(count < -99 ? `-${INFINITY_CHAR}` : count);
    }, [flags, mines]);

    useEffect(() => {
        if (timer) {
            interval = setInterval(() => {
                var now = new Date();
                var secs = Math.floor(
                    (now.getTime() - startTime.getTime()) / 1000
                );
                setTimerDisplay(secs > 999 ? INFINITY_CHAR : secs);
            }, 1000);
        } else {
            clearInterval(interval);
        }
    }, [startTime, timer]);

    useEffect(erase, [difficulty, width, total, mines]);

    useEffect(() => {
        if (difficulty === "intermediate") {
            setWidth(16);
            setTotal(256);
            setMines(40);
        } else if (difficulty === "expert") {
            setWidth(30);
            setTotal(480);
            setMines(99);
        } else {
            setWidth(8);
            setTotal(64);
            setMines(10);
        }

        setDifficultyClass("minesweeper--" + difficulty);
        setLoading(false);
    });

    const board = useMemo(
        () =>
            Array(total)
                .fill("")
                .map((_, square) => (
                    <div
                        key={square}
                        onContextMenu={e => e.preventDefault()}
                        onMouseDown={e => clickSquare(e, square)}
                        className={`board__col panel panel--out${generateSquareClass(
                            square
                        )}`}
                    ></div>
                )),
        [exposed]
    );

    if (!loading) {
        return (
            <div className={`minesweeper ${difficultyClass}`}>
                <div className="minesweeper__control panel panel--out">
                    <div className="minesweeper__display minesweeper__display--mines panel panel--in">
                        {mineDisplay}
                    </div>
                    <div className="minesweeper__smiley panel panel--in">
                        <button
                            onClick={erase}
                            onContextMenu={e => e.preventDefault()}
                            className={`minesweeper__smiley-button panel panel--out smiley smiley--${smileyMood}`}
                        ></button>
                    </div>
                    <div className="minesweeper__display minesweeper__display--timer panel panel--in">
                        {timerDisplay}
                    </div>
                </div>
                <div className="minesweeper__board board">{board}</div>
            </div>
        );
    } else {
        return "";
    }
}

Minesweeper.propTypes = {
    difficulty: PropTypes.string,
};

export default Minesweeper;
