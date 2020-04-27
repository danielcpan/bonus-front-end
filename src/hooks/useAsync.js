import { useEffect, useReducer } from 'react';
import { USE_ASYNC } from '../store/types';

const initialState = {
  isLoading: false,
  error: null,
  data: undefined
};

const reducer = (state = initialState, { type, payload }) => {
  switch (type) {
    case USE_ASYNC.REQUEST:
      // console.log("MAKING A REQUEST");
      return { ...state, isLoading: true, error: null };
    case USE_ASYNC.SUCCESS:
      // console.log("SUCCESS");
      return { ...state, isLoading: false, error: null, data: payload };
    case USE_ASYNC.FAILURE:
      // console.log('USE_ASYNC_FAILURE:', payload);
      return { ...state, isLoading: false, error: payload };
    default:
      throw new Error('Invalid Action');
  }
};

const useAsync = (
  promiseFn,
  deps = [],
  { onSuccess = () => {}, onFailure = () => {}, onFinally = () => {} } = {}
) => {
  const [state, dispatch] = useReducer(reducer, initialState);

  useEffect(() => {
    (async function () {
      try {
        dispatch({ type: USE_ASYNC.REQUEST });

        const data = await promiseFn(...deps);

        onSuccess(data, deps);
        dispatch({ type: USE_ASYNC.SUCCESS, payload: data });
      } catch (err) {
        console.log(`${promiseFn.name} request failed:`, err);
        onFailure(err, deps);
        dispatch({ type: USE_ASYNC.FAILURE, payload: err });
      } finally {
        onFinally();
      }
    })();
  }, [deps, onFailure, onFinally, onSuccess, promiseFn]);

  return state;
};

export default useAsync;
