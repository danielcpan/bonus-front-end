import { useEffect, useReducer } from 'react';
import { USE_ASYNC } from '../store/types';
import useGetLatest from '../hooks/useGetLatest';
import { getInitialState, defaultConfigRef } from '../utils/hook.utils';
import { schema, normalize } from 'normalizr';

const cache = {
  entities: {},
  queries: {}
};

const initialState = getInitialState();

const reducer = (state = initialState, { type, payload }) => {
  switch (type) {
    case 'USE_ASYNC_CACHED':
      return { ...state, data: payload };
    case USE_ASYNC.REQUEST:
      return { ...state, isLoading: true, error: null };
    case USE_ASYNC.SUCCESS:
      return { ...state, isLoading: false, error: null, data: payload };
    case USE_ASYNC.FAILURE:
      return { ...state, isLoading: false, error: payload };
    default:
      throw new Error('Invalid Action');
  }
};

const useAsync = (promiseFn, deps = [], options = {}) => {
  const [cacheState, dispatchCache] = useReducer(reducer, cache);
  const [state, dispatch] = useReducer(reducer, initialState);
  const getConfig = useGetLatest({ ...defaultConfigRef.current, ...options });
  const getAsyncFn = useGetLatest(promiseFn);
  console.log('state:', state);

  useEffect(() => {
    (async function () {
      const { key, queryVariables, onSuccess, onFailure, onFinally } = getConfig();
      console.log('queryVariables:', queryVariables);
      console.log('key:', key);
      const hashedKey = `${key}${queryVariables && JSON.stringify(queryVariables)}`;
      const asyncFn = getAsyncFn();

      const cachedQuery = cache.queries[hashedKey];
      if (cachedQuery) {
        console.log('RETURNING CACHED DATA');
        if (Array.isArray(cachedQuery)) {
          const data = cachedQuery.map(el => cache.entities[el]);
          dispatch({ type: 'USE_ASYNC_CACHED', payload: data });
          return;
        }

        const data = cache.entities[cachedQuery];
        dispatch({ type: 'USE_ASYNC_CACHED', payload: data });
        return;
      }

      try {
        dispatch({ type: USE_ASYNC.REQUEST });

        const data = await asyncFn(...deps);
        const isList = Array.isArray(data);
        // if (Array.isArray(data))
        const schemaType = isList ? [new schema.Entity(key)] : new schema.Entity(key);
        const normalizedData = normalize(data, schemaType);
        // cache.entities = normalizedData.entities[key];
        // cache.queries = { [key]: normalizedData.result };
        // const hashedKey = `${key}${JSON.stringify(queryVariables)}`
        cache.entities[hashedKey] = normalizedData.entities[hashedKey];
        cache.queries[hashedKey] = normalizedData.result;
        console.log('normalizedData:', normalizedData);

        onSuccess(data, deps);
        dispatch({ type: USE_ASYNC.SUCCESS, payload: data });
      } catch (err) {
        console.log(`${asyncFn.name} request failed:`, err);
        onFailure(err, deps);
        dispatch({ type: USE_ASYNC.FAILURE, payload: err });
      } finally {
        onFinally();
      }
    })();
  }, [getConfig, getAsyncFn, ...deps]); // eslint-disable-line react-hooks/exhaustive-deps

  return { ...state, cacheState };
};

export default useAsync;
