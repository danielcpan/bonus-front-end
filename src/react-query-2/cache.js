import { schema, normalize } from 'normalizr';
import {
  isServer,
  functionalUpdate,
  cancelledError,
  isDocumentVisible,
  statusLoading,
  statusSuccess,
  statusError,
  getQueryArgs,
  deepIncludes,
  noop
} from './utils';
import { defaultConfigRef } from './config';
import Query from './query';

class Cache {
  static listeners = [];

  constructor() {
    this.schema = {};
    this.entities = {};
    this.queries = {};
    this.isFetching = 0;
  }

  subscribe(listener) {
    Cache.listeners.push(listener);
    return () => {
      Cache.listeners.splice(Cache.listeners.indexOf(listener), 1);
    };
  }

  clearEntities() {
    this.entities = Object.keys(this.entities).reduce(
      (acc, el) => ({
        ...acc,
        [el]: {}
      }),
      this.entities
    );
  }

  clearQueries() {
    this.queries = {};
  }

  clear() {
    this.clearEntities();
    this.clearQueries();
  }

  getQuery(queryKey) {
    const options = { exact: true };

    return this._findQueries(queryKey, options)[0];
  }

  getQueries(queryKey, options = {}) {
    return this._findQueries(queryKey, options);
  }

  _findQueries(predicate, options = {}) {
    const { exact } = options;

    if (typeof predicate !== 'function') {
      const [queryHash, queryKey] = defaultConfigRef.current.queryKeySerializerFn(predicate);
      predicate = d => (exact ? d.queryHash === queryHash : deepIncludes(d.queryKey, queryKey));
    }

    return Object.values(this.queries).filter(predicate);
  }

  _buildQuery(key, queryVariables, queryFn, config) {
    const [queryHash, queryKey] = config.queryKeySerializerFn(key);

    const cachedQuery = this.queries[queryHash];

    // If query exists, return with updated properties
    if (cachedQuery) {
      return { ...cachedQuery, queryVariables, queryFn, config };
    }

    const query = new Query();

    if (query.queryHash) {
      this.queries[queryHash] = query;
    }
  }
}
