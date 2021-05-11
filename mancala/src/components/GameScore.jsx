import "./GameScore.css";
import { api, useSubscribe } from '../lib/store';
import React, { useState } from 'react';

function ScoreBoard({score, playerType, className, isActive}) {
    return (
    <div className={`score_board ${className} ${isActive && "active"}`}>
        {`${playerType}: ${score}`}
    </div>
    );
  }

export function GameScore() {
    const { 
        playersType
    } = api.getState();

    const [playerIdTurn, setPlayerIdTurn] = useState(api.getState().playerIdTurn);
    const [playersScore, setPlayersScore] = useState(api.getState().playersScore);

    useSubscribe(
        ({ playerIdTurn, playersScore }) => {
        setPlayerIdTurn(playerIdTurn);
        setPlayersScore(playersScore);
        },
        ['playerIdTurn', 'playersScore'],
    );

    return (
    <div className="">
        <ScoreBoard score={playersScore[0]} playerType={playersType[0]} className="player1" isActive={playerIdTurn === 1}/>
        <ScoreBoard score={playersScore[1]} playerType={playersType[1]} className="player2" isActive={playerIdTurn === 2}/>
    </div>
    );
  }