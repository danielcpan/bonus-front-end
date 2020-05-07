import { isOnline, isDocumentVisible, Console, isServer } from './utils';
import { defaultConfigRef } from './config';
import { queryCache } from './queryCache';

const visibilityChangeEvent = 'visibilitychange';
const focusEvent = 'focus';

let lastFocusTime = new Date();

const onWindowFocus = () => {
  const { refetchAllOnWindowFocus, refetchAllOnWindowFocusTimeDelay } = defaultConfigRef.current;

  if (isDocumentVisible() && isOnline()) {
    queryCache
      .refetchQueries(query => {
        if (!query.instances.length) return false;

        if (query.config.manual === true) return false;

        if (query.shouldContinueRetryOnFocus) {
          // delete promise, so `fetch` will create new one
          delete query.promise;
          return true;
        }

        if (typeof query.config.refetchOnWindowFocus === 'undefined') {
          const shouldRefetch = new Date() - lastFocusTime > refetchAllOnWindowFocusTimeDelay;
          if (shouldRefetch && refetchAllOnWindowFocus) {
            lastFocusTime = new Date();
            return true;
          }
          return false;
        } else {
          console.log('doing that');
          return query.config.refetchOnWindowFocus;
        }
      })
      .catch(Console.error);
  }
};

let removePreviousHandler;

export function setFocusHandler(callback) {
  // Unsub the old watcher
  if (removePreviousHandler) removePreviousHandler();
  // Sub the new watcher
  removePreviousHandler = callback(onWindowFocus);
}

setFocusHandler(handleFocus => {
  // Listen to visibillitychange and focus
  if (!isServer && window?.addEventListener) {
    window.addEventListener(visibilityChangeEvent, handleFocus, false);
    window.addEventListener(focusEvent, handleFocus, false);

    return () => {
      // Be sure to unsubscribe if a new handler is set
      window.removeEventListener(visibilityChangeEvent, handleFocus);
      window.removeEventListener(focusEvent, handleFocus);
    };
  }
});
