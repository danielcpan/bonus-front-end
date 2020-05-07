import React, { useState } from 'react';
import AppContainer from '../components/AppContainer/AppContainer';
import { useQuery, queryCache } from '../react-query';
import { schema, normalize } from 'normalizr';

import axios from 'axios';
import Loading from '../components/core/Loading';
import useRenderCount from '../hooks/useRenderCount';

const employeeSchema = new schema.Entity('employees');
const employeeListSchema = [employeeSchema];

const fetchPost = async (key, id) => {
  const { data } = await axios.get(`https://jsonplaceholder.typicode.com/posts/${id}`);
  return data;
};

const fetchPosts = async () => {
  const { data } = await axios.get('https://jsonplaceholder.typicode.com/posts');
  // console.log('data:', data);
  return data;
};

const Posts = () => {
  const [id, setId] = useState(1);
  console.log('id:', id);
  useRenderCount('App');
  // const employees = useQuery(['employees1', trigger], fetchPosts, {
  //   onSuccess: ({ data }) => {
  //     // console.log("woah!", data)
  //     const normalizedData = normalize(data, employeeListSchema);
  //     console.log('noralizedData:', normalizedData);
  //   }
  // });
  // const employees = useQuery(['employees1', trigger], fetchPosts);

  // const posts = useAsync(fetchPosts, {}, { key: 'posts' });
  // const post = useAsync(fetchPost, { id }, { key: 'posts' });

  // const posts = useAsync('posts', fetchPosts, { key: 'posts' });
  // const post = useAsync(['post', id], fetchPost, { key: 'posts' });

  const posts = useQuery('posts', fetchPosts);
  const post = useQuery(['posts', id], fetchPost);

  // console.log('USE_QUERY', posts);
  // console.log('USE_ASYNC', posts);
  console.log('USE_ASYNC', post);
  // console.log('queryCache:', queryCache);

  return (
    <AppContainer
      render={() => {
        if (posts.isLoading || post.isLoading) return <Loading />;

        if (!posts.data) return <div>No Data!</div>;

        return (
          <>
            {/* <div onClick={() => setTrigger(prevState => !prevState)}>hello!</div> */}
            {/* <div onClick={() => setTrigger(prevState => !prevState)}>hello!</div> */}
            <div>
              Current post:
              {post.data && ` id: ${post.data.id}, post title: ${post.data.title}`}
            </div>
            {posts.data.map(el => (
              <div
                key={el.id}
                onClick={() => setId(el.id)}
              >{`id: ${el.id}, post title: ${el.title}`}</div>
            ))}
          </>
        );
      }}
    />
  );
};

export default Posts;
