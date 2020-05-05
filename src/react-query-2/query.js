import { defaultQueryReducer } from '../react-query/cache';

const QUERY_INIT = 'QUERY_INIT';
const QUERY_REQUEST = 'QUERY_REQUEST';
const QUERY_SUCCESS = 'QUERY_SUCCESS';
const QUERY_FAILURE = 'QUERY_FAILURE';
const QUERY_ERROR = 'QUERY_ERROR';
const QUERY_STALE = 'QUERY_STALE';
const QUERY_EXPIRED = 'QUERY_EXPIRED';

export const reducer = (state, { type, payload }) => {
  switch (type) {
    case QUERY_INIT:
      return {
        status: payload.initialStatus,
        isFetching: payload.isFetching,
        error: null,
        failCount: 0,
        isStale: payload.isStale,
        isExpired: false,
        data: payload.initialData,
        updatedAt: payload.hasInitialData ? Date.now() : 0
      };
    case QUERY_REQUEST:
      return {
        ...state,
        status: payload.status,
        isFetching: true,
        failCount: 0
      };
    case QUERY_SUCCESS:
      return {
        ...state,
        status: statusSuccess,
        isFetching: false,
        error: null,
        failCount: 0,
        isStale: false,
        data: payload.data,
        updatedAt: Date.now()
      };
    case QUERY_FAILURE:
      return {
        ...state,
        failCount: state.failCount + 1
      };
    case QUERY_ERROR:
      return {
        ...state,
        status: statusError,
        error: payload.error,
        isFetching: false,
        isStale: true
      };
    case QUERY_STALE:
      return {
        ...state,
        isStale: true
      };
    case QUERY_EXPIRED: {
      return {
        ...state,
        isExpired: true
      };
    }
    default:
      throw new Error();
  }
};

class Query {
  constructor() {
    const reducer = options.config.queryReducer || defaultQueryReducer;
    const hasInitialData = typeof initialData !== 'undefined'
    const initialStatus = hasInitialData ? statusSuccess : statusLoading;
    const isFetching = initialStatus === 'loading';

    this.instances = [];
    this.state = reducer(undefined, {
      type: QUERY_INIT,
      payload: {
        initialStatus,
        isFetching: ,
        isStale: true,
        isExpired: false,
        data: initialData
      }
    });
  }

  dispatch(action) {}
}
