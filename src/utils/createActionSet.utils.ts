export default actionName => ({
  REQUEST: `${actionName}_REQUEST`,
  SUCCESS: `${actionName}_SUCCESS`,
  FAILURE: `${actionName}_FAILURE`,
  actionName
});
