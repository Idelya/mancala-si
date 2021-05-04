import './App.css';
import { api, useStore, useSubscribe } from './lib/store.js';
import { Modal } from "./components/Modal"
import { PlayView } from "./components/PlayView"
import { startGame, endCondition, endGame } from "./lib/gameControl.js"
import React, { useState } from 'react';
function App() {

  const gamestate = useStore(state => state.gamestate);

  const [refresh, setRefresh] = useState(0);
  const {
    playersScore,
    palyer1,
    player2
   } = api.getState();

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
      {gamestate === "initial" && <Modal title="Mancala" content="click play to start" confirmText="Play" confirmFun={startGame}/>}
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
