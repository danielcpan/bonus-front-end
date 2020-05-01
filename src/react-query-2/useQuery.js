import { useEffect, useReducer } from 'react';
import { USE_ASYNC } from '../store/types';
import useGetLatest from '../hooks/useGetLatest';
import { getInitialState, defaultConfigRef } from '../utils/hook.utils';
import { schema, normalize } from 'normalizr';
import { defaultQueryKeySerializerFn } from './config';

import { getQueryArgs, stableStringify } from './utils';

const cache = {
  entities: {},
  queries: {}
};

const initialState = getInitialState();

const reducer = (state = initialState, { type, payload }) => {
  switch (type) {
    case 'USE_ASYNC_CACHED':
      console.log('RETURNING CACHED DATA SINGLE:', payload);
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

// const useAsync = (promiseFn, deps = [], options = {}) => {
const useAsync = ({ queryKey, queryVariables, queryFn, config = {} }) => {
  console.log('queryKey:', queryKey, 'queryVariables:', queryVariables);
  const [cacheState, dispatchCache] = useReducer(reducer, cache);
  const [state, dispatch] = useReducer(reducer, initialState);
  const getConfig = useGetLatest({ ...defaultConfigRef.current, ...config });
  const getAsyncFn = useGetLatest(queryFn);
  // console.log('state:', state);

  useEffect(() => {
    (async function () {
      const { key, onSuccess, onFailure, onFinally } = getConfig();
      const queryVariables = queryKey;
      console.log('queryVariables:', queryVariables);
      console.log('key:', key);
      // const hashedKey = `${key}${queryVariables && JSON.stringify(queryVariables)}`;
      const [queryHash, serializedQueryKey] = defaultQueryKeySerializerFn(queryKey);
      console.log('queryHash:', queryHash, 'serializedQueryKey:', serializedQueryKey);
      const asyncFn = getAsyncFn();

      const cachedQuery = cache.queries[queryHash];
      console.log('cachedQuery:', cachedQuery);
      if (cachedQuery) {
        if (Array.isArray(cachedQuery)) {
          const data = cachedQuery.map(el => cache.entities[key][el]);
          dispatch({ type: 'USE_ASYNC_CACHED', payload: data });
          return;
        }
        const data = cache.entities[key][cachedQuery];
        dispatch({ type: 'USE_ASYNC_CACHED', payload: data });
        return;
      }

      try {
        dispatch({ type: USE_ASYNC.REQUEST });

        // const data = await asyncFn(...deps);
        const data = await asyncFn(...Object.values(queryVariables));
        const isList = Array.isArray(data);
        const schemaType = isList ? [new schema.Entity(key)] : new schema.Entity(key);
        const normalizedData = normalize(data, schemaType);

        cache.entities = {
          ...cache.entities,
          [key]: {
            ...cache.entities[key],
            ...normalizedData.entities[key]
          }
        };

        cache.queries = {
          ...cache.queries,
          [queryHash]: normalizedData.result
        };

        console.log('normalizedData:', normalizedData);

        onSuccess(data, queryVariables);
        dispatch({ type: USE_ASYNC.SUCCESS, payload: data });
      } catch (err) {
        console.log(`${asyncFn.name} request failed:`, err);
        onFailure(err, queryVariables);
        dispatch({ type: USE_ASYNC.FAILURE, payload: err });
      } finally {
        onFinally();
      }
    })();
  }, [getConfig, getAsyncFn, ...queryKey]); // eslint-disable-line react-hooks/exhaustive-deps

  return { ...state, cacheState };
};

const useQueryContainer = (...args) => {
  const query = useAsync(getQueryArgs(args));

  // handleSuspense(query);

  return query;
};

export default useQueryContainer;
