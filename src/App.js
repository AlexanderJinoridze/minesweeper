import React, { useState } from "react";
import Minesweeper from "./components/Minesweeper"

function App() {
    const [difficulty, setDifficultry] = useState("easy");

    return (
        <div className="minesweeper-app">
            <h1 className="minesweeper-title">Minesweeper</h1>
            <h2 className="minesweeper-subtitle">Just like in good old days of XP</h2>
            <div className="difficulty-menu">
                <span className="difficulty-menu__title">Select difficulty level</span>
                <button className={`difficulty-menu__button${difficulty === "easy" ? " difficulty-menu__button--active" : ""}`} onClick={() => setDifficultry("easy")}>Easy</button>
                <button className={`difficulty-menu__button${difficulty === "intermediate" ? " difficulty-menu__button--active" : ""}`} onClick={() => setDifficultry("intermediate")}>Intermediate</button>
                <button className={`difficulty-menu__button${difficulty === "expert" ? " difficulty-menu__button--active" : ""}`} onClick={() => setDifficultry("expert")}>Expert</button>
            </div>
            <Minesweeper difficulty={difficulty} />
        </div>
    );
}

export default App;