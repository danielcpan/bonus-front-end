import React, { useState } from 'react';
import AppContainer from '../components/AppContainer/AppContainer';
import { useQuery, queryCache } from '../react-query';
// import { useQuery, queryCache } from '../react-query-copy';
// import { useQuery, queryCache } from 'react-query';
// import useAsync from '../react-query-2/useQuery';
import axios from 'axios';
import Loading from '../components/core/Loading';
import useRenderCount from '../hooks/useRenderCount';
import { getIsLoading } from '../utils/hook.utils';
// import { useQuery } from '../react-query-2/useQuery';
// import { useQuery, queryCache } from '../../../../react-query';
// import { cache } from '../react-query-2/cache';
// data = {
//   userId: 1,
//   id: 1,
//   title: 'sunt aut facere repellat provident occaecati excepturi optio reprehenderit',
//   body:
//     'quia et suscipit\nsuscipit recusandae consequuntur expedita et cum\nreprehenderit molestiae ut ut quas totam\nnostrum rerum est autem sunt rem eveniet architecto'
// };
// const normalizedData = normalize(data, post);

const fetchComment = async (key, id) => {
  const { data } = await axios.get(`https://jsonplaceholder.typicode.com/comments/${id}`);
  return data;
};

const fetchComments = async () => {
  const { data } = await axios.get('https://jsonplaceholder.typicode.com/comments');
  return data;
};

const fetchPost = async (key, id) => {
  const { data } = await axios.get(`https://jsonplaceholder.typicode.com/posts/${id}`);
  return data;
};

const fetchPosts = async () => {
  const { data } = await axios.get('https://jsonplaceholder.typicode.com/posts');
  // console.log('data:', data);
  return data;
};

const fetchUser = async (key, id) => {
  const { data } = await axios.get(`https://jsonplaceholder.typicode.com/users/${id}`);
  return data;
};

function roughSizeOfObject(object) {
  var objectList = [];
  var stack = [object];
  var bytes = 0;

  while (stack.length) {
    var value = stack.pop();

    if (typeof value === 'boolean') {
      bytes += 4;
    } else if (typeof value === 'string') {
      bytes += value.length * 2;
    } else if (typeof value === 'number') {
      bytes += 8;
    } else if (typeof value === 'object' && objectList.indexOf(value) === -1) {
      objectList.push(value);

      for (var i in value) {
        stack.push(value[i]);
      }
    }
  }
  return bytes;
}

const Comments = () => {
  const [id, setId] = useState(1);
  // useRenderCount('App');

  // x[JSON.parse("comments".replace('[', '["').replace(']', '"]'))]

  // const comments = useAsync(fetchComments, {}, { key: 'comments' });
  // const comment = useAsync(fetchComment, { id }, { key: 'comments' });
  // const comments = useAsync('comments', fetchComments, { key: 'comments' });
  // const comment = useAsync(['comment', id], fetchComment, { key: 'comments' });
  // const comments = useQuery('comments', fetchComments, { entity: 'comments', staleTime: 5000 });
  // const comment = useQuery(['comment', id], fetchComment, { entity: 'comments', staleTime: 50000 });

  // const test = useQuery({ key: ['comments'], fn: fetchComments, config: { staleTime: 10000 } });
  // const test = useQuery(['comments'], fetchComments, { staleTime: 10000, skip: });
  // const

  const comments = useQuery('comments', fetchComments, {
    staleTime: 5000,
    onSuccess: data => {
      // queryCache.entities;
    },
    initialData: ({ queryKey }) => {
      // console.log('hhh:', data);
      // console.log('queryCache.getQuery(queryKey):', queryCache.getQuery(queryKey));
      // const entityKey = query.queryKey[0];
      // if (!query.state.ids || Object.keys(queryCache.entities[entityKey]).length === 0) return;
      // const data = query.state.ids.map(el => queryCache.entities[entityKey][el]);
      // return data;
    }
  });
  const comment = useQuery(['comments', id], fetchComment, {
    initialData: ({ queryKey, queryHash }) => {
      console.log('queryKey:', queryKey, 'queryHash:', queryHash);
      console.log('queryCache:', queryCache);
      console.log('queryCache.getQuery(queryKey):', queryCache.getQuery(queryKey));
      // console.log('init:', data);
      return queryCache.entities['comments'][id];
    }
  });
  // const post = useQuery(() => ['posts', comment.data.postId], fetchPost);
  // const user = useQuery(() => ['users', post.data.userId], fetchUser);
  // console.log('comments:', comments);
  // console.log('cache:', queryCache, 'size:', roughSizeOfObject(queryCache));
  // const comment = useQuery(['comments', id], fetchComment, {
  //   // initialData: () => {
  //   //   console.log('queryCache:', queryCache, 'size:', roughSizeOfObject(queryCache));
  //   //   const cachedCommnet = queryCache.entities['comments'][id];
  //   //   console.log('cachedComment:', cachedCommnet);
  //   //   return cachedCommnet;
  //   // },
  //   staleTime: 10000
  // });
  // const comment = { status: 'success', error: null, data: {} };

  // console.log('USE_QUERY', comments);
  // console.log('USE_ASYNC', comments);
  // console.log('USE_ASYNC', comments);
  // console.log('queryCache:', queryCache, 'size:', roughSizeOfObject(queryCache));

  return (
    <AppContainer
      render={() => {
        // if (comments.isLoading || comment.isLoading) return <Loading />;
        // const queries = [comments, comment, post, user];
        const queries = [comments, comment];

        if (getIsLoading(queries)) return <Loading />;

        if (!comments.data) return <div>No Data!</div>;

        return (
          <>
            {/* <div onClick={() => setTrigger(prevState => !prevState)}>hello!</div> */}
            {/* <div onClick={() => setTrigger(prevState => !prevState)}>hello!</div> */}
            {/* <div>
              Current user:
              {user.data && ` id: ${user.data.id}, user name: ${user.data.name}`}
            </div>
            <div>
              Current post:
              {post.data && ` id: ${post.data.id}, post title: ${post.data.title}`}
            </div> */}
            <div>
              Current comment:
              {comment.data && ` id: ${comment.data.id}, comment name: ${comment.data.name}`}
            </div>
            {comments.data.map(el => (
              <div
                key={el.id}
                onClick={() => setId(el.id)}
              >{`id: ${el.id}, comment name: ${el.name}`}</div>
            ))}
          </>
        );
      }}
    />
  );
};

export default Comments;
