import { reduce, max, min } from 'lodash';
import { pickHole, endCondition, togglePlayerId, spreadRocks, isFirstMove } from './gameControl';
import { api, measureTime, addLog } from './store';

function getRandomInt(max) {
    return Math.floor(Math.random() * max);
  }
// eslint-disable-next-line no-unused-vars
function pickRandomHole(board, playerID) {
    const n = reduce(board[playerID - 1], function(sum, h) {
        if(h.k > 0) return sum + 1;
        else return sum;
      }, 0);
    let random =  getRandomInt(n);

    for (let i = 0; i<= random; i++) {
        if (board[playerID - 1][i].k === 0) {
            random++;
        }
    }
    return [null, board[playerID - 1][random]];
}

export function moveAI(board, playerId) {
    console.log('moveAI ' + playerId)
    const method = isFirstMove(board) ? () => pickRandomHole(board, playerId) : (
        api.getState().alfabeta ? 
        () => alfabeta(board, null, api.getState().playersScore, playerId, playerId, api.getState().depth, -1000, 1000) :
        () => minmax(board, null, api.getState().playersScore, playerId, playerId, api.getState().depth));
    const [[, hole], time] = measureTime(method)

    if(!hole) {
        return;
    }
    
    addLog(playerId, time,'', hole, isFirstMove(board) ? "pickRandomHole" : (api.getState().alfabeta ? "alfabeta" : "minmax"))
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
                //console.log(`player: ${playerTurnId}`, e, maxEval, tmpH, maxH, tmpBoard, currPlayerScore)
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
                //console.log(`player: ${playerTurnId}`, e, minEval, tmpH, minH, tmpBoard, currPlayerScore)
            }
        )
        return [minEval, hole || minH]; 
    }

}


function alfabeta(board, hole, playersSore, forPlayerId, playerTurnId, depth, alfa, beta) {
    if(endCondition(board) || depth === 0){
        return [evaluationDiffScore(board, playersSore, forPlayerId, togglePlayerId(forPlayerId)), hole]
    }

    let tmpAlfa = alfa
    let tmpBeta = beta

    if(forPlayerId === playerTurnId) { //maxim
        let maxEval = -1000
        let maxH = null

        let filtered =   board[playerTurnId - 1].filter(h => h.k > 0);
        for (let i = 0; i < filtered.length; i++) {
                const h = filtered[i];
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
                    (h.k + h.id + 8) % 14 === 0 ? depth : depth - 1, // policzymy nastepny ruch jako jedna ture
                    tmpAlfa,
                    tmpBeta
                )
                if (e > maxEval) {
                    maxH = tmpH
                    maxEval = e
                }

                tmpAlfa = max([tmpAlfa, maxEval]) 
                
                if(tmpBeta <= tmpAlfa){ 
                    break
                }
                //console.log(`player: ${playerTurnId}`, e, maxEval, tmpH, maxH, tmpBoard, currPlayerScore)
        }
        return [maxEval, hole || maxH];
    }
    else { //minim
        let minEval = 1000 
        let minH = null
        let filtered =   board[playerTurnId - 1].filter(h => h.k > 0);
        for (let i = 0; i < filtered.length; i++) {
                const h = filtered[i];
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
                    (h.k + h.id + 8) % 14 === 0 ? depth : depth - 1,// policzymy nastepny ruch jako jedna ture
                    tmpAlfa,
                    tmpBeta
                )
                if (e < minEval) {
                    minH = tmpH
                    minEval = e
                } 
                tmpBeta = min([tmpBeta, minEval])
                
                if(tmpBeta <= tmpAlfa){ 
                    break
                }

                //console.log(`player: ${playerTurnId}`, e, minEval, tmpH, minH, tmpBoard, currPlayerScore)
            }
        return [minEval, hole || minH]; 
    }

}
function evaluationDiffScore(board, scores, playersMax, playersMin) {
    return scores[playersMax - 1] - scores[playersMin - 1];
}