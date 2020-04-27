import { normalize } from 'normalizr';

const callApiMiddleware = ({ dispatch, getState }) => next => async action => {
  const { 
    types, 
    callAPI, 
    shouldCallAPI = () => true, 
    schema,
    payload = {}
  } = action;

  // Normal action: pass it on
  if (!types) return next(action);

  if (
    !Array.isArray(types) ||
    types.length !== 3 ||
    !types.every(type => typeof type === 'string')
  ) {
    throw new Error('Expected an array of three string types.');
  }
  
  if (typeof callAPI !== 'function') {
    throw new Error('Expected callAPI to be a function.');
  }

  if (!schema) {
    throw new Error('Expected schema to be present');
  }

  if (!shouldCallAPI(getState())) return;

  const [requestType, successType, failureType] = types;

  dispatch({ type: requestType, ...payload })
  
  try {
    const response = await callAPI();
    const normalizedData = normalize(response.data, schema);
    const key = getEntityKey(schema);
    const { entities, result } = normalizedData;

    dispatch({ type: successType, entities: entities[key], ids: result, ...payload })
  } catch (err) {
    if (process.env.NODE_ENV === 'development') console.log(err);

    dispatch({ type: failureType, error: getErrorMsg(err), ...payload })
  }
}

const getEntityKey = (schema) => {
  return (Array.isArray(schema)) ? schema[0]._key : schema._key
}

// Handles both API and Generic errors
const getErrorMsg = (err) => {
  return err.response ? err.response.data.message : err.message
}

export default callApiMiddleware;