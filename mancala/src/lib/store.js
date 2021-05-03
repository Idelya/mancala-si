import  "regenerator-runtime";
import create from 'zustand';
import pick from 'lodash/pick';
import { useEffect } from 'react';
import { shallow } from 'zustand/shallow';

export const [useStore, api] = create(() => {
  return {
    gamestate: 'initial',
  };
});

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