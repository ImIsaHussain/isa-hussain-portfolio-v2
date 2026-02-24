"use client";

import { createContext, useContext, useRef, useCallback, useMemo, type RefObject } from 'react';

type Subscriber = () => void;

interface TransitionContextValue {
  /** Subscribe to the "home transition done" signal. Returns an unsubscribe function. */
  onHomeReady: (cb: Subscriber) => () => void;
  /** Ref to the bottom navbar container for querying nav links. */
  bottomNavRef: RefObject<HTMLElement | null>;
}

const TransitionContext = createContext<TransitionContextValue>({
  onHomeReady: () => () => {},
  bottomNavRef: { current: null },
});

export function useTransitionContext() {
  return useContext(TransitionContext);
}

export function useTransitionProvider() {
  const subscribersRef = useRef<Set<Subscriber>>(new Set());
  const bottomNavRef = useRef<HTMLElement>(null);

  const onHomeReady = useCallback((cb: Subscriber) => {
    subscribersRef.current.add(cb);
    return () => { subscribersRef.current.delete(cb); };
  }, []);

  const emitHomeReady = useCallback(() => {
    subscribersRef.current.forEach((cb) => cb());
  }, []);

  const contextValue = useMemo<TransitionContextValue>(
    () => ({ onHomeReady, bottomNavRef }),
    [onHomeReady]
  );

  return { contextValue, emitHomeReady, bottomNavRef };
}

export { TransitionContext };
