import { useCallback, useState } from "react";

export interface UseToggleActions {
  set: (value: boolean) => void;
  setTrue: () => void;
  setFalse: () => void;
  toggle: () => void;
}

export function useToggle<T = boolean>(defaultValue?: T): [boolean, UseToggleActions] {
  const [state, setState] = useState(!!defaultValue);

  const set = useCallback((value: boolean) => {
    setState(value);
  }, []);

  const setTrue = useCallback(() => {
    setState(true);
  }, []);

  const setFalse = useCallback(() => {
    setState(false);
  }, []);

  const toggle = useCallback(() => {
    setState((prev) => !prev);
  }, []);

  return [state, { set, setTrue, setFalse, toggle }];
}
