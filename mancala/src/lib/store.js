import  "regenerator-runtime";
import create from 'zustand';
import pick from 'lodash/pick';
import { useEffect } from 'react';
import { shallow } from 'zustand/shallow';

export const [useStore, api] = create(() => {
  return {
    gamestate: 'initial',
    playersType: ['user','user'],
    playersScore: [0, 0],
    playerIdTurn: null,
    depth: 1,
    board: initBoard(4, 6),
    gameMode: "UservUser",
    refresh: 0
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
