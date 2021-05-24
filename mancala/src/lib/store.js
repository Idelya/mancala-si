import  "regenerator-runtime";
import create from 'zustand';
import pick from 'lodash/pick';
import { useEffect } from 'react';
import { shallow } from 'zustand/shallow';
import { sumBy } from "lodash";

export const [useStore, api] = create(() => {
  return {
    gamestate: 'initial',
    playersType: ['user','user'],
    playersScore: [0, 0],
    playerIdTurn: null,
    depth: 1,
    board: initBoard(4, 6),
    gameMode: "UservUser",
    alfabeta: true,
    logs: [[],[]],
    refresh: 0,
    rounds: 0,
  };
});

export function clearStore() {
  api.setState(() => {
    return({
      gamestate: 'initial',
      playersType: ['user','user'],
      playersScore: [0, 0],
      playerIdTurn: null,
      board: initBoard(4, 6),
      logs: [[],[]],
      refresh: 0
    })
});
}

export function useSubscribe(
  fun,
  watch,
) {
  useEffect(
    () =>
      api.subscribe(
        () => {
          fun(api.getState());
        },
        store => pick(store, watch),
        shallow,
      ),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  );
}

function initRow(playerId, k, n) {
  return( new Array(n).fill().map((e,i) => {
    return {
      playerId: playerId,
      id: i,
      k: k
    }
  }));
}

function initBoard(k, n) {
  return([ initRow(1, k, n ), initRow(2, k, n)]);
}

export function measureTime(callback) {
  const t0 = performance.now();
  const ret = callback();
  const t1 = performance.now();
  return [ret, t1 - t0];
}

export function addLog(palyerId, time, heuristic, hole, method) {
  console.log(method);
  api.setState(({logs}) => {
    const copylogs = logs;
    copylogs[palyerId-1].push({
      time: time,
      heuristic: heuristic,
      method: method,
      hole: hole,
    })
    return({
      logs: copylogs
    })
  });
}

export function resultsOfGame() {
  const logs = api.getState().logs;
console.log('resultsOfGame');
  return {
    player1Time: sumBy(logs[0], 'time')/logs[0].length,
    player1Count: logs[0].length,
    player2Time: sumBy(logs[1], 'time')/logs[1].length,
    player2Count: logs[1].length,
  }
}