import { useEffect, useCallback, useRef } from "react";

// Store listeners by event type
const listenersByEvent = new Map<string, Set<(e: Event) => void>>();

// Global handlers by event type
const globalHandlers = new Map<string, (e: Event) => void>();

function getListenerSet(eventName: string): Set<(e: Event) => void> {
  if (!listenersByEvent.has(eventName)) {
    listenersByEvent.set(eventName, new Set());
  }
  return listenersByEvent.get(eventName)!;
}

function getGlobalHandler(eventName: string): (e: Event) => void {
  if (!globalHandlers.has(eventName)) {
    const handler = (e: Event) => {
      const listeners = listenersByEvent.get(eventName);
      listeners?.forEach((listener) => listener(e));
    };
    globalHandlers.set(eventName, handler);
  }
  return globalHandlers.get(eventName)!;
}

export function useEventListener<K extends keyof DocumentEventMap>(
  eventName: K,
  callback: (e: DocumentEventMap[K]) => void,
  options?: { stable?: boolean }
) {
  const callbackRef = useRef(callback);
  
  // Keep ref updated with latest callback
  useEffect(() => {
    callbackRef.current = callback;
  });
  
  // Create stable callback that always calls the latest version
  // Map event type (ie 'mousemove') to the proper Event type (MouseEvent)
  const stableCallback = useCallback((e: DocumentEventMap[K]) => {
    callbackRef.current(e);
  }, []);
  
  // Use stable callback if requested, otherwise use the provided callback
  const effectiveCallback = options?.stable ? stableCallback : callback;
  
  useEffect(() => {
    const listeners = getListenerSet(eventName);
    const handler = getGlobalHandler(eventName);
    
    listeners.add(effectiveCallback as (e: Event) => void);
    
    if (listeners.size === 1) {
      console.log('setup: ', eventName);
      document.addEventListener(eventName, handler);
    }
    
    return () => {
      listeners.delete(effectiveCallback as (e: Event) => void);

      if (listeners.size === 0) {
        document.removeEventListener(eventName, handler);
        listenersByEvent.delete(eventName);
        globalHandlers.delete(eventName);
      }
    };
  }, [eventName, effectiveCallback]);
}

export default useEventListener;