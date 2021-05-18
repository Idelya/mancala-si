import './App.css';
import { api, useStore, useSubscribe } from './lib/store.js';
import { Modal } from "./components/Modal"
import { PlayView } from "./components/PlayView"
import { startGame, endCondition, endGame } from "./lib/gameControl.js"
import { moveAI } from "./lib/ai.js"
import React, { useEffect, useState } from 'react';

// sleep time expects milliseconds
function sleep (time) {
  return new Promise((resolve) => setTimeout(resolve, time));
}


function App() {

  const gamestate = useStore(state => state.gamestate);

  const [refresh, setRefresh] = useState(0);
  const [mode, setMode] = useState('UservUser');
  const [depth, setDepth] = useState(1);
  const [siTurn, setSiTurn] = useState(false);
  const {
    playersScore
   } = api.getState();
   const [currPlayer, setPlayerIdTurn] = useState(api.getState().playerIdTurn);

   useSubscribe(
    ({ playerIdTurn, gamestate }) => {
     setPlayerIdTurn(playerIdTurn);
    },
    ['playerIdTurn'],
  );

  useEffect(
     () => {
       if (api.getState().playersType[api.getState().playerIdTurn - 1] === 'ai' && api.getState().gamestate==='play' ) {
      sleep(1000).then(() => {
        moveAI(api.getState().board, api.getState().playerIdTurn)
      });
      }
     },
     [currPlayer],
   );

  useSubscribe(
    ({ board, gamestate  }) => {
      if(endCondition(board) && gamestate === 'play') {
        api.setState(() => ({gamestate: "loading"}))
        endGame();
        setRefresh(refresh)
      }
    },
    ['board', 'playersScore', 'gamestate'],
  );

  if(gamestate === "loading") {
    <p>Loading...</p>
  }

  return (
    <div className="App">
      {gamestate === "initial" && <Modal title="Mancala" content={
        <form>
          Pick game mode
          <br />
          <input type="radio" id="UservUser" name="UservUser" value="UservUser" onChange={(e) => setMode(e.target.value)} checked={mode === "UservUser"}/>
          <label for="UservUser">User v User</label>
          <br />
          <input type="radio" id="UservAI" name="UservAI" value="UservAI" onChange={(e) => setMode(e.target.value)} checked={mode === "UservAI"}/>
          <label for="UservAI">User v Ai</label><br /> 
          <input type="radio" id="AIvAI" name="AIvAI" value="AIvAI" onChange={(e) => setMode(e.target.value)} checked={mode === "AIvAI"}/>
          <label for="UservAI">AI v Ai</label><br /> 
          <label for="depth">Depth:</label>
          <input type="number" id="depth" name="depth" min="1" max="10" value={depth} onChange={(e) => setDepth(e.target.value)} />
        </form>} confirmText="Play" confirmFun={() => startGame(mode, depth)}/>}
      {gamestate === "end" && 
        <Modal 
          title="Finished" 
          content={`Player ${playersScore[0] > playersScore[1] ? "1" : "2"} is a winner! Player1: ${playersScore[0]} Player2: ${ playersScore[1]}`}  
          confirmText="Play again" 
          confirmFun={startGame}
          />}
      {gamestate === "play" && <PlayView />}
    </div>
  );
}

export default App;
