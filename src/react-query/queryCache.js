import { isServer, getQueryArgs, deepIncludes, noop } from './utils';
import { defaultConfigRef } from './config';
import { makeQuery } from './query';

const listeners = [];

export const notifyGlobalListeners = () => {
  queryCache.isFetching = Object.values(queryCache.queries).reduce(
    (acc, query) => (query.state.isFetching ? acc + 1 : acc),
    0
  );
  listeners.forEach(d => d(queryCache));
};

export const makeQueryCache = () => {
  const cache = {
    queries: {},
    isFetching: 0
  };

  cache.subscribe = cb => {
    listeners.push(cb);
    return () => {
      listeners.splice(listeners.indexOf(cb), 1);
    };
  };

  cache.clear = () => {
    cache.queries = {};
    notifyGlobalListeners();
  };

  const findQueries = (predicate, { exact } = {}) => {
    if (typeof predicate !== 'function') {
      const [queryHash, queryKey] = defaultConfigRef.current.queryKeySerializerFn(predicate);
      predicate = d => (exact ? d.queryHash === queryHash : deepIncludes(d.queryKey, queryKey));
    }

    return Object.values(cache.queries).filter(predicate);
  };

  cache.getQueries = findQueries;

  cache.getQuery = queryKey => findQueries(queryKey, { exact: true })[0];

  cache.getQueryData = queryKey => cache.getQuery(queryKey)?.state.data;

  cache.removeQueries = (predicate, { exact } = {}) => {
    const foundQueries = findQueries(predicate, { exact });

    foundQueries.forEach(query => {
      clearTimeout(query.staleTimeout);
      delete cache.queries[query.queryHash];
    });

    if (foundQueries.length) {
      notifyGlobalListeners();
    }
  };

  cache.refetchQueries = async (predicate, { exact, throwOnError, force } = {}) => {
    const foundQueries =
      predicate === true ? Object.values(cache.queries) : findQueries(predicate, { exact });

    try {
      return await Promise.all(foundQueries.map(query => query.fetch({ force })));
    } catch (err) {
      if (throwOnError) {
        throw err;
      }
    }
  };

  cache._buildQuery = (userQueryKey, queryVariables, queryFn, config) => {
    let [queryHash, queryKey] = config.queryKeySerializerFn(userQueryKey);

    let query = cache.queries[queryHash];

    if (query) {
      // console.log('exists!!!!');
      Object.assign(query, { queryVariables, queryFn });
      Object.assign(query.config, config);
    } else {
      query = makeQuery({
        queryKey,
        queryHash,
        queryVariables,
        queryFn,
        config
      });

      // If the query started with data, schedule
      // a stale timeout
      if (!isServer && query.state.data) {
        query.scheduleStaleTimeout();

        // Simulate a query healing process
        query.heal();
        // Schedule for garbage collection in case
        // nothing subscribes to this query
        query.scheduleGarbageCollection();
      }

      if (query.queryHash) {
        if (!isServer) {
          cache.queries[queryHash] = query;
          // Here, we setTimeout so as to not trigger
          // any setState's in parent components in the
          // middle of the render phase.
          setTimeout(() => {
            notifyGlobalListeners();
          });
        }
      }
    }

    // console.log('query:', query.queryFn.name);

    return query;
  };

  cache.prefetchQuery = async (...args) => {
    let [queryKey, queryVariables, queryFn, { force, ...config }] = getQueryArgs(args);

    config = {
      ...defaultConfigRef.current,
      ...config
    };

    const query = cache._buildQuery(queryKey, queryVariables, queryFn, config);

    // Don't prefetch queries that are fresh, unless force is passed
    if (query.state.isStale || force) {
      // Trigger a fetch and return the promise
      try {
        const res = await query.fetch({ force });
        query.wasPrefetched = true;
        return res;
      } catch (err) {
        if (config.throwOnError) {
          throw err;
        }
      }
    }

    return query.state.data;
  };

  cache.setQueryData = (queryKey, updater, { exact, ...config } = {}) => {
    let queries = findQueries(queryKey, { exact });

    if (!queries.length && typeof queryKey !== 'function') {
      queries = [
        cache._buildQuery(queryKey, undefined, () => new Promise(noop), {
          ...defaultConfigRef.current,
          ...config
        })
      ];
    }

    queries.forEach(d => d.setData(updater));
  };

  return cache;
};

export const queryCache = makeQueryCache();
