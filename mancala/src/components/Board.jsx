import hole_img from "../assets/image_holes.png";
import { api, useSubscribe } from '../lib/store';
import "./Board.css";
import { pickHole } from "../lib/gameControl.js"
import React, { useState } from 'react';
function Well({score}){
  return (
    <div className="Well">
      {score}
    </div>
  );
}

function Hole({rocks, rocksAmount}){
  const [playerIdTurn, setPlayerIdTurn] = useState(api.getState().playerIdTurn);

  useSubscribe(
    ({ playerIdTurn }) => {
      setPlayerIdTurn(playerIdTurn);
    },
    ['playerIdTurn'],
  );

  const handlePick = () => {
    if ( api.getState().playersType[api.getState().playerIdTurn - 1] !== 'ai') {
      pickHole(rocks)
    }
  }

  return (
    <div id={`hole-${rocks.playerId}-${rocks.id}`} className={`Hole ${rocks.playerId===playerIdTurn && api.getState().playersType[api.getState().playerIdTurn - 1] !== 'ai' && rocks.k > 0 && "users_hole"}`} 
      onClick={() => handlePick()}>
      {rocksAmount}
      <img src={hole_img} alt=""/>
    </div>
  );
}

export function Board() {
  const [board, setBoard] = useState(api.getState().board);
  const [playersScore, setPlayersScore] = useState(api.getState().playersScore);
  const [refresh, setRefresh] = useState(0);

  useSubscribe(
    ({ board, playersScore }) => {
      setBoard(board);
      setPlayersScore(playersScore);
      setRefresh(refresh + 1);
    },
    ['board', 'playersScore'],
  );

    console.log(board);
    return (
      <div className="Board">
        <Well score={playersScore[0]} />
        <div className="HolesRow">
          {board[0].slice(0).reverse().map((e) => <Hole rocks={e} rocksAmount={e.k} key={e.id}/>)}
          {board[1].map((e) => <Hole rocks={e} rocksAmount={e.k} key={e.id}/>)}
        </div>
        <Well score={playersScore[1]} />
      </div>
    );
  }