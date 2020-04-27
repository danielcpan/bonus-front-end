import { useReducer, useCallback } from 'react';
import { USE_MUTATION } from '../store/types';
import useGetLatest from './useGetLatest';
import { getInitialState, defaultConfigRef } from '../utils/hook.utils';

const initialState = getInitialState();

const reducer = (state = initialState, { type, payload }) => {
  switch (type) {
    case 'RESET':
      return initialState;
    case USE_MUTATION.REQUEST:
      return { ...state, isLoading: true, error: null };
    case USE_MUTATION.SUCCESS:
      return { ...state, isLoading: false, error: null, data: payload };
    case USE_MUTATION.FAILURE:
      return { ...state, isLoading: false, error: payload };
    default:
      throw new Error('Invalid Action');
  }
};

const useMutation = (promiseFn, options = {}) => {
  const [state, dispatch] = useReducer(reducer, initialState);

  const getConfig = useGetLatest({ ...defaultConfigRef.current, ...options });
  const getMutationFn = useGetLatest(promiseFn);

  const mutate = useCallback(
    async (...args) => {
      let [data, error] = [undefined, null];

      const { onSuccess, onFailure, onFinally } = getConfig();

      try {
        dispatch({ type: USE_MUTATION.REQUEST });

        data = await getMutationFn()(...args);

        onSuccess(data);
        dispatch({ type: USE_MUTATION.SUCCESS, payload: data });
      } catch (err) {
        console.log(`${getMutationFn().name} request failed:`, err);
        error = err;

        onFailure(err);
        dispatch({ type: USE_MUTATION.FAILURE, payload: err });
      } finally {
        onFinally(data, error, args);
      }
    },
    [getConfig, getMutationFn]
  );

  const reset = useCallback(() => {
    dispatch({ type: 'RESET' });
  }, []);

  return [mutate, { ...state, reset }];
};

export default useMutation;
