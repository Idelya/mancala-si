import './App.css';
import { api, useStore, useSubscribe } from './lib/store.js';
import { Modal } from "./components/Modal"
import { PlayView } from "./components/PlayView"
import { startGame, endCondition, endGame } from "./lib/gameControl.js"
import { moveAI } from "./lib/ai.js"
import React, { useEffect, useState } from 'react';
function App() {

  const gamestate = useStore(state => state.gamestate);

  const [refresh, setRefresh] = useState(0);
  const [mode, setMode] = useState('UservUser');
  const [depth, setDepth] = useState(1);
  const [siTurn, setSiTurn] = useState(false);
  const {
    playersScore
   } = api.getState();
   const [, setPlayerIdTurn] = useState(api.getState().playerIdTurn);

   useSubscribe(
     ({ playerIdTurn, gamestate }) => {
       if (api.getState().playersType[api.getState().playerIdTurn - 1] === 'ai' && !siTurn && gamestate==='play' ) {
        setSiTurn(true)
      }
      setPlayerIdTurn(playerIdTurn);
     },
     ['playerIdTurn', 'gamestate'],
   );

   useEffect(
     () => {
      if(siTurn) {
        moveAI(api.getState().board, api.getState().playerIdTurn)
        setSiTurn(false)
      }
     }
     ,[siTurn])

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
          <input type="radio" id="UservUser" name="UservUser" value="UservUser" onChange={(e) => setMode(e.target.value)} checked={mode === "UservUser"}/>
          <label for="UservUser">User v User</label>
          <br />
          <input type="radio" id="UservAI" name="UservAI" value="UservAI" onChange={(e) => setMode(e.target.value)} checked={mode === "UservAI"}/>
          <label for="UservAI">User v Ai</label><br /> <br />
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
