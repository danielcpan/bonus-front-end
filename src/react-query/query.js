import { functionalUpdate, cancelledError, isDocumentVisible, noop } from './utils';
import { queryCache, notifyGlobalListeners } from './queryCache';

import { STATUS, QUERY } from './types';
import defaultQueryReducer from './defaultQueryReducer';
import { normalize } from 'normalizr';

export function makeQuery(options) {
  const reducer = options.config.queryReducer || defaultQueryReducer;

  const noQueryHash = typeof options.queryHash === 'undefined';

  const initialData =
    typeof options.config.initialData === 'function'
      ? options.config.initialData(options)
      : options.config.initialData;

  const hasInitialData = typeof initialData !== 'undefined';

  const isStale = noQueryHash ? true : !hasInitialData;

  const manual = options.config.manual;

  const initialStatus = noQueryHash || manual || hasInitialData ? STATUS.SUCCESS : STATUS.LOADING;

  const query = {
    ...options,
    instances: [],
    state: reducer(undefined, {
      type: QUERY.INIT,
      initialStatus,
      initialData,
      hasInitialData,
      isStale,
      manual
    })
  };

  const dispatch = action => {
    query.state = reducer(query.state, action);
    query.instances.forEach(d => d.onStateUpdate(query.state));
    notifyGlobalListeners();
  };

  query.scheduleStaleTimeout = () => {
    if (query.config.staleTime === Infinity) return;

    query.staleTimeout = setTimeout(() => {
      if (queryCache.getQuery(query.queryKey)) {
        dispatch({ type: QUERY.STALE });
      }
    }, query.config.staleTime);
  };

  query.scheduleGarbageCollection = () => {
    if (query.config.cacheTime === Infinity) return;

    dispatch({ type: QUERY.EXPIRED });

    query.cacheTimeout = setTimeout(
      () => {
        queryCache.removeQueries(
          d => d.state.markedForGarbageCollection && d.queryHash === query.queryHash
        );
      },
      typeof query.state.data === 'undefined' && query.state.status !== 'error'
        ? 0
        : query.config.cacheTime
    );
  };

  query.heal = () => {
    // Stop the query from being garbage collected
    clearTimeout(query.cacheTimeout);

    // Mark the query as not cancelled
    query.cancelled = null;
  };

  query.subscribe = instance => {
    let found = query.instances.find(d => d.id === instance.id);

    if (found) {
      Object.assign(found, instance);
    } else {
      found = {
        onStateUpdate: noop,
        ...instance
      };
      query.instances.push(instance);
    }

    query.heal();

    // Return the unsubscribe function
    return () => {
      query.instances = query.instances.filter(d => d.id !== instance.id);

      if (!query.instances.length) {
        // Cancel any side-effects
        query.cancelled = cancelledError;

        if (query.cancelQueries) query.cancelQueries();

        // Schedule garbage collection
        query.scheduleGarbageCollection();
      }
    };
  };

  // Set up the fetch function
  const tryFetchData = async (queryFn, ...args) => {
    try {
      // Perform the query
      const promise = queryFn(...query.config.queryFnParamsFilter(args));

      query.cancelQueries = () => promise.cancel?.();

      const data = await promise;

      delete query.cancelQueries;
      if (query.cancelled) throw query.cancelled;

      return data;
    } catch (error) {
      delete query.cancelQueries;
      if (query.cancelled) throw query.cancelled;

      // If we fail, increase the failureCount
      dispatch({ type: QUERY.FAILURE });

      // Do we need to retry the request?
      if (
        query.config.retry === true ||
        query.state.failureCount <= query.config.retry ||
        (typeof query.config.retry === 'function' &&
          query.config.retry(query.state.failureCount, error))
      ) {
        // Only retry if the document is visible
        if (!isDocumentVisible()) {
          // set this flag to continue fetch retries on focus
          query.shouldContinueRetryOnFocus = true;
          return new Promise(noop);
        }

        delete query.shouldContinueRetryOnFocus;

        // Determine the retryDelay
        const delay = functionalUpdate(query.config.retryDelay, query.state.failureCount);

        // Return a new promise with the retry
        return await new Promise((resolve, reject) => {
          // Keep track of the retry timeout
          setTimeout(async () => {
            if (query.cancelled) return reject(query.cancelled);

            try {
              const data = await tryFetchData(queryFn, ...args);
              if (query.cancelled) return reject(query.cancelled);
              resolve(data);
            } catch (error) {
              if (query.cancelled) return reject(query.cancelled);
              reject(error);
            }
          }, delay);
        });
      }

      throw error;
    }
  };

  query.fetch = async ({ force, __queryFn = query.queryFn } = {}) => {
    // Don't refetch fresh queries that don't have a queryHash
    if (!query.queryHash || (!query.state.isStale && !force)) return;

    // Create a new promise for the query cache if necessary
    if (!query.promise) {
      query.promise = (async () => {
        // If there are any retries pending for this query, kill them
        query.cancelled = null;

        try {
          // Set up the query refreshing state
          dispatch({ type: QUERY.FETCH });

          // Try to fetch
          const data = await tryFetchData(__queryFn, ...query.queryKey, ...query.queryVariables);
          // console.log('data:', data);

          const entityKey = query.queryKey[0];
          const schema = queryCache.schemas[entityKey];
          // console.log('entityKey:', entityKey, 'schema:', schema);

          const normalizedData = normalize(data, queryCache.schemas[entityKey]);
          // console.log('normalizedData:', normalizedData);

          // query.setData(data);
          // const data2 = query.state.ids.map(el => queryCache.entities[entityKey][el]);
          // console.log("data:")

          queryCache.entities[entityKey] = {
            ...queryCache.entities[entityKey],
            ...normalizedData.entities[entityKey]
          };

          // const data2 = normalizedData.result.map(el => queryCache.entities[entityKey][el]);
          query.setData2(data, normalizedData.result);

          query.instances.forEach(
            instance => instance.onSuccess && instance.onSuccess(query.state.data)
          );

          query.instances.forEach(
            instance => instance.onSettled && instance.onSettled(query.state.data, null)
          );

          delete query.promise;

          return data;
        } catch (error) {
          dispatch({
            type: QUERY.ERROR,
            cancelled: error === query.cancelled,
            error
          });

          delete query.promise;

          if (error !== query.cancelled) {
            query.instances.forEach(instance => instance.onError && instance.onError(error));

            query.instances.forEach(
              instance => instance.onSettled && instance.onSettled(undefined, error)
            );

            throw error;
          }
        }
      })();
    }

    return query.promise;
  };

  query.setState = updater => dispatch({ type: QUERY.SET_STATE, updater });

  query.setData = updater => {
    // Set data and mark it as cached
    dispatch({ type: QUERY.SUCCESS, updater });

    // Schedule a fresh invalidation!
    clearTimeout(query.staleTimeout);
    query.scheduleStaleTimeout();
  };

  query.setData2 = (updater, ids) => {
    // Set data and mark it as cached
    dispatch({ type: QUERY.SUCCESS, updater, ids });

    // Schedule a fresh invalidation!
    clearTimeout(query.staleTimeout);
    query.scheduleStaleTimeout();
  };

  return query;
}
