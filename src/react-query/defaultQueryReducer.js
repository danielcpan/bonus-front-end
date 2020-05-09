import { functionalUpdate } from './utils';
import { STATUS, QUERY } from './types';

const defaultQueryReducer = (state, action) => {
  switch (action.type) {
    case QUERY.INIT:
      return {
        status: action.initialStatus,
        error: null,
        isFetching:
          action.hasInitialData || action.manual ? false : action.initialStatus === 'loading',
        canFetchMore: false,
        failureCount: 0,
        isStale: action.isStale,
        markedForGarbageCollection: false,
        data: action.initialData,
        updatedAt: action.hasInitialData ? Date.now() : 0
      };
    case QUERY.FAILURE:
      return {
        ...state,
        failureCount: state.failureCount + 1
      };
    case QUERY.STALE:
      return {
        ...state,
        isStale: true
      };
    case QUERY.EXPIRED: {
      return {
        ...state,
        markedForGarbageCollection: true
      };
    }
    case QUERY.FETCH:
      return {
        ...state,
        status: state.status === STATUS.ERROR ? STATUS.LOADING : state.status,
        isFetching: true,
        failureCount: 0
      };
    case QUERY.SUCCESS:
      return {
        ...state,
        status: STATUS.SUCCESS,
        data: functionalUpdate(action.updater, state.data),
        ids: action.ids,
        error: null,
        isStale: false,
        isFetching: false,
        canFetchMore: action.canFetchMore,
        updatedAt: Date.now(),
        failureCount: 0
      };
    case QUERY.ERROR:
      return {
        ...state,
        isFetching: false,
        isStale: true,
        ...(!action.cancelled && {
          status: STATUS.ERROR,
          error: action.error
        })
      };
    case QUERY.SET_STATE:
      return functionalUpdate(action.updater, state);
    default:
      throw new Error();
  }
};
export default defaultQueryReducer;
