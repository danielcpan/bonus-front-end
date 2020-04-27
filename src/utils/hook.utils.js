export const getInitialState = () => ({
  isLoading: false,
  error: null,
  data: null
});

export const defaultConfigRef = {
  current: {
    onSuccess: () => {},
    onFailure: () => {},
    onFinally: () => {}
  }
};

export const getIsLoading = (hooks = []) => {
  return hooks.some(el => el.isLoading);
};

export const getHasError = (hooks = []) => {
  return hooks.some(el => el.error);
};

export const getHasData = (hooks = []) => {
  if (getIsLoading(hooks)) return false;

  return hooks.some(el => !el.data);
};
