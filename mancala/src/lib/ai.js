import { reduce } from 'lodash';
import { pickHole, endCondition, togglePlayerId, spreadRocks } from './gameControl';
import { api } from './store';

function getRandomInt(max) {
    return Math.floor(Math.random() * max);
  }
function pickRandomHole(board, playerID) {
    const n = reduce(board[playerID - 1], function(sum, h) {
        if(h.k > 0) return sum + 1;
        else return sum;
      }, 0);
    let random =  getRandomInt(n);

    for (let i = 0; i<= random; i++) {
        console.log(board[playerID - 1][i].k, random)
        if (board[playerID - 1][i].k === 0) {
            random++;
        }
    }
    return random;
}

export function moveAI(board, playerId) {
    console.log('moveAI')
    //const holeId = pickRandomHole(board, playerId);
    const [, hole] = minmax(board, null, api.getState().playersScore, playerId, playerId, api.getState().depth)
    if(!hole) {
        return;
    }
    highlightHole(hole);
    console.log(hole)
    pickHole(hole);
    console.log('czy nastepny ruch?', api.getState().playerIdTurn, playerId)
    if(api.getState().playerIdTurn === playerId) {
        console.log('nastepny ruch');
        moveAI(api.getState().board, playerId)
    }
}

function highlightHole(hole) {
    console.log(`hole-${hole.playerId}-${hole.id}`);
    document.getElementById(`hole-${hole.playerId}-${hole.id}`)?.classList.add("active");
    setTimeout(function(){ document.getElementById(`hole-${hole.playerId}-${hole.id}`)?.classList.remove("active") }, 1000);
}

function minmax(board, hole, playersSore, forPlayerId, playerTurnId, depth) {
    if(endCondition(board) || depth === 0){
        return [evaluationDiffScore(board, playersSore, forPlayerId, togglePlayerId(forPlayerId)), hole]
    }

    if(forPlayerId === playerTurnId) { //maxim
        let maxEval = -1000
        let maxH = null
        console.log(board)
        board[playerTurnId - 1].filter(h => h.k > 0).forEach(
            (h) => {
               let currPlayerScore = playersSore[playerTurnId - 1]
               const tmpBoard = spreadRocks(board, (playerTurnId, rocks) => { 
                    currPlayerScore = currPlayerScore + rocks 
                }, h, playerTurnId)
               const [e, tmpH] =  minmax(
                    tmpBoard, 
                    h, 
                    playerTurnId === 1 ? [currPlayerScore, playersSore[1]] : [playersSore[0], currPlayerScore], 
                    forPlayerId, 
                    (h.k + h.id + 8) % 14 === 0 ? playerTurnId : togglePlayerId(playerTurnId),
                    (h.k + h.id + 8) % 14 === 0 ? depth : depth - 1 // policzymy nastepny ruch jako jedna ture
                )
                if (e > maxEval) {
                    maxH = tmpH
                    maxEval = e
                }
                console.log(`player: ${playerTurnId}`, e, maxEval, tmpH, maxH, tmpBoard, currPlayerScore)
            }
        )
        return [maxEval, hole || maxH];
    }
    else { //minim
        let minEval = 1000 
        let minH = null
        board[playerTurnId - 1].filter(h => h.k > 0).forEach(
            (h) => {
               let currPlayerScore = playersSore[playerTurnId - 1]
               const tmpBoard = spreadRocks(board, (playerTurnId, rocks) => { 
                currPlayerScore = currPlayerScore + rocks 
            }, h, playerTurnId)
               const [e, tmpH] =  minmax(
                    tmpBoard, 
                    h, 
                    playerTurnId === 1 ? [currPlayerScore, playersSore[1]] : [playersSore[0], currPlayerScore], 
                    forPlayerId, 
                    (h.k + h.id + 8) % 14 === 0 ? playerTurnId : togglePlayerId(playerTurnId),
                    (h.k + h.id + 8) % 14 === 0 ? depth : depth - 1// policzymy nastepny ruch jako jedna ture
                )
                if (e < minEval) {
                    minH = tmpH
                    minEval = e
                }
                console.log(`player: ${playerTurnId}`, e, minEval, tmpH, minH, tmpBoard, currPlayerScore)
            }
        )
        return [minEval, hole || minH]; 
    }

}

function evaluationDiffScore(board, scores, playersMax, playersMin) {
    return scores[playersMax - 1] - scores[playersMin - 1];
}