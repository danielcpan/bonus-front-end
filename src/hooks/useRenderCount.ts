import { useRef } from 'react';

const useRenderCount = name => {
  const renderCount = useRef(0);
  console.log(`${name} Render Count: ${renderCount.current++}`);
};

export default useRenderCount;
