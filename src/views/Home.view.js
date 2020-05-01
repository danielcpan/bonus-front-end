import React from 'react';
import AppContainer from '../components/AppContainer/AppContainer';

const HomeScreen = props => {
  return (
    <AppContainer
      history={props.history}
      withBackground={false}
      render={() => {
        return null;
      }}
    />
  );
};

export default HomeScreen;
