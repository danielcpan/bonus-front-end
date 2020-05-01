import React, { useState } from 'react';
import AppContainer from '../components/AppContainer/AppContainer';
import { useQuery, queryCache } from '../react-query';
import useAsync from '../react-query-2/useQuery';
import axios from 'axios';
import Loading from '../components/core/Loading';
import useRenderCount from '../hooks/useRenderCount';

const fetchComment = async (key, id) => {
  const { data } = await axios.get(`https://jsonplaceholder.typicode.com/comments/${id}`);
  return data;
};

const fetchComments = async () => {
  const { data } = await axios.get('https://jsonplaceholder.typicode.com/comments');
  return data;
};

const Comments = () => {
  const [id, setId] = useState(1);
  useRenderCount('App');

  // const comments = useAsync(fetchComments, {}, { key: 'comments' });
  // const comment = useAsync(fetchComment, { id }, { key: 'comments' });
  const comments = useAsync('comments', fetchComments, { key: 'comments' });
  const comment = useAsync(['comment', id], fetchComment, { key: 'comments' });
  // const comment = useAsync(fetchComment, { id }, { key: 'comments' });

  // console.log('USE_QUERY', comments);
  // console.log('USE_ASYNC', comments);
  console.log('USE_ASYNC', comments);
  // console.log('queryCache:', queryCache);

  return (
    <AppContainer
      render={() => {
        if (comments.isLoading || comment.isLoading) return <Loading />;

        if (!comments.data) return <div>No Data!</div>;

        return (
          <>
            {/* <div onClick={() => setTrigger(prevState => !prevState)}>hello!</div> */}
            {/* <div onClick={() => setTrigger(prevState => !prevState)}>hello!</div> */}
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
