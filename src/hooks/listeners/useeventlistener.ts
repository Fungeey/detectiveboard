import { useEffect } from "react";

// Store listeners by event type
const listenersByEvent = new Map<string, Set<(e: Event) => void>>();

// Global handlers by event type
const globalHandlers = new Map<string, (e: Event) => void>();

function getOrCreateListenerSet(eventName: string): Set<(e: Event) => void> {
  if (!listenersByEvent.has(eventName)) {
    listenersByEvent.set(eventName, new Set());
  }
  return listenersByEvent.get(eventName)!;
}

function getOrCreateGlobalHandler(eventName: string): (e: Event) => void {
  if (!globalHandlers.has(eventName)) {
    const handler = (e: Event) => {
      const listeners = listenersByEvent.get(eventName);
      listeners?.forEach((listener) => listener(e));
    };
    globalHandlers.set(eventName, handler);
  }
  return globalHandlers.get(eventName)!;
}

export function useOnDocumentEvent<K extends keyof DocumentEventMap>(
  eventName: K,
  callback: (e: DocumentEventMap[K]) => void
) {
  useEffect(() => {
    const listeners = getOrCreateListenerSet(eventName);
    const handler = getOrCreateGlobalHandler(eventName);
    
    // Type assertion needed since we're using generic Event storage
    listeners.add(callback as (e: Event) => void);
    
    if (listeners.size === 1) {
      document.addEventListener(eventName, handler);
    }
    
    return () => {
      listeners.delete(callback as (e: Event) => void);

      if (listeners.size === 0) {
        document.removeEventListener(eventName, handler);
        listenersByEvent.delete(eventName);
        globalHandlers.delete(eventName);
      }
    };
  }, [eventName, callback]);
}

export default useOnDocumentEvent;