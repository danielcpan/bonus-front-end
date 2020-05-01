import React from 'react';
import CircularProgress from '@material-ui/core/CircularProgress';

const Loading = ({ containerStyles = {}, indicatorProps = {}, indicatorStyles = {} }) => {
  return (
    <div
      style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100%',
        ...containerStyles
      }}
    >
      <CircularProgress {...indicatorProps} style={indicatorStyles} />
    </div>
  );
};

export default Loading;
