
import { api, clearStore } from './store';
import { cloneDeep, every, sumBy } from "lodash";
export function startGame(mode, depth, alfabeta) {
    clearStore();

    api.setState(() => ({
        gamestate: "play",
        playerIdTurn: 2,
        gameMode: mode,
        alfabeta: alfabeta,
        depth: depth,
        playersType: mode === "UservUser" ? ['user','user'] : ( mode === "UservAI" ? ['ai','user'] : ['ai', 'ai']),
    }))
}

export function pickHole(hole) {
    if(hole.playerId !== api.getState().playerIdTurn) {
        return;
    }
    api.setState(({board, playerIdTurn, refresh}) => {
        return({
            refresh: 1 + refresh,
            board: spreadRocks(board, giveRocks, hole, playerIdTurn),
            //nastepna tura
            playerIdTurn: (hole.k + hole.id + 8) % 14 === 0 ? playerIdTurn : togglePlayerId(playerIdTurn)
        })
    });
}

export function spreadRocks(board, usersPointsFun, hole, playerId) {
    let playerHoleId = hole.playerId;
    let tmpBoard = cloneDeep(board);
    tmpBoard[playerHoleId - 1][hole.id].k = 0;
    let stopCondition = hole.k;
    for (let i = 1; i <= stopCondition; i++) {
        if((hole.id + i + 1) % 7 === 0) {
            if(playerHoleId === playerId) {
                usersPointsFun(playerHoleId, 1);
            }
            else {
                stopCondition++;
            }
            playerHoleId = togglePlayerId(playerHoleId);
        }
        else {
            tmpBoard[playerHoleId - 1][((hole.id + 1 + i) % 7) - 1].k++;
        }
        if(stopCondition === i && playerHoleId === playerId && (hole.id + i + 1)%7 !== 0 && tmpBoard[playerHoleId - 1][((hole.id + i + 1) % 7) - 1].k === 1 && tmpBoard[togglePlayerId(playerHoleId) - 1][7 - ((hole.id + i + 1) % 7) - 1].k > 0) {
            usersPointsFun(playerId, tmpBoard[togglePlayerId(playerHoleId) - 1][7 - ((hole.id + i + 1) % 7) - 1].k + tmpBoard[playerHoleId - 1][((hole.id + i + 1) % 7) - 1].k)
            tmpBoard[togglePlayerId(playerHoleId) - 1][7 - ((hole.id + i + 1) % 7) - 1].k = 0;
            tmpBoard[playerHoleId - 1][((hole.id + i + 1) % 7) - 1].k = 0;
        }
    }

    return tmpBoard;
}
export function togglePlayerId(currentId) {
    return currentId === 1 ? 2 : 1;
}

export function giveRocks(playerId, rocks) {
        api.setState(({playersScore}) => {
            const playersTmpScore = cloneDeep(playersScore);
            playersTmpScore[playerId - 1] = playersScore[playerId - 1] + rocks;
            return ({
                playersScore: playersTmpScore
            });
    });
}

export function endCondition(board) {
    return every(board[0], ['k', 0]) || every(board[1], ['k', 0])
}

export function sumRockInRow(board, palyerId) {
    return sumBy(board[palyerId - 1], "k")
}

export function endGame(){

    api.setState(({board}) => {
        giveRocks(1, sumRockInRow(board, 1))
        giveRocks(2, sumRockInRow(board, 2))
        
        return({
            gamestate: "end",
        })
    });
}

export function isFirstMove(board) {
    return every(board[0], ['k', 4]) && every(board[1], ['k', 4])
}