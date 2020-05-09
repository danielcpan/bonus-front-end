import React from 'react';
import { Route, BrowserRouter, Switch } from 'react-router-dom';
import { ReactQueryConfigProvider } from './react-query';
import HomeView from './views/Home.view';
import PostsView from './views/Posts.view';
import CommentsView from './views/Comments.view';
import { queryCache } from './react-query';

import { normalize, schema } from 'normalizr';
// const { normalize, schema } = require('normalizr');

const user = new schema.Entity('users');
const users = [user];
const comment = new schema.Entity('comments');
const comments = [comment];
const post = new schema.Entity('post', {
  author: user,
  comments: [comment]
});
const posts = [post];

queryCache.schemas = {
  user,
  users,
  comment,
  comments,
  post,
  posts
};

queryCache.entities = Object.keys(queryCache.schemas).reduce(
  (acc, el) => ({
    ...acc,
    [el]: {}
  }),
  {}
);
// queryCache.entities = {
//   // Object.keys(queryCache.schemas).map(el => )
// }

const queryConfig = {
  // Global
  suspense: false,
  useErrorBoundary: undefined, // Defaults to the value of `suspense` if not defined otherwise
  throwOnError: false,
  refetchAllOnWindowFocusTimeDelay: 1000 * 10,
  refetchAllOnWindowFocus: true,
  // queryKeySerializerFn: queryKey => [queryHash, queryFnArgs],
  onMutate: () => {},
  onSuccess: () => {},
  onError: () => {},
  onSettled: () => {},

  // useQuery
  retry: 3,
  retryDelay: attemptIndex => Math.min(1000 * 2 ** attemptIndex, 30000),
  staleTime: 0,
  cacheTime: 5 * 60 * 1000,
  refetchInterval: false,
  // queryFnParamsFilter: args => filteredArgs,
  refetchOnMount: true
};

const App = () => {
  return (
    <ReactQueryConfigProvider config={queryConfig}>
      <BrowserRouter>
        <Switch>
          <Route path="/" exact component={HomeView} />
          <Route path="/posts" exact component={PostsView} />
          <Route path="/comments" exact component={CommentsView} />
          {/* <Route path="/jwtlogin" exact render={() => <Login jwt />} /> */}
          {/* <Route component={ErrorView} /> */}
        </Switch>
      </BrowserRouter>
    </ReactQueryConfigProvider>
  );
};

export default App;
