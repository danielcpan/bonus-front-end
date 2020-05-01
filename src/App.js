import React from 'react';
import { Route, BrowserRouter, Switch } from 'react-router-dom';
import HomeView from './views/Home.view';
import PostsView from './views/Posts.view';
import CommentsView from './views/Comments.view';

const App = () => {
  return (
    <BrowserRouter>
      <Switch>
        <Route path="/" exact component={HomeView} />
        <Route path="/posts" exact component={PostsView} />
        <Route path="/comments" exact component={CommentsView} />
        {/* <Route path="/jwtlogin" exact render={() => <Login jwt />} /> */}
        {/* <Route component={ErrorView} /> */}
      </Switch>
    </BrowserRouter>
  );
};

export default App;
