import React from 'react';
import CircularProgress from '@material-ui/core/CircularProgress';

const Loading = ({ containerStyles = {}, indicatorProps = {}, indicatorStyles = {} }) => {
  return (
    <div
      style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        ...containerStyles
      }}
    >
      <CircularProgress {...indicatorProps} style={indicatorStyles} />
    </div>
  );
};

export default Loading;
