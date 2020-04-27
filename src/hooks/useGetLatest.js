import { useCallback, useRef } from 'react';

const useGetLatest = obj => {
  const ref = useRef(obj);

  return useCallback(() => ref.current, []);
};

export default useGetLatest;
