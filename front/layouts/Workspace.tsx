import React, { FC, useCallback } from 'react';
import useSWR from 'swr';
import fetcher from '@utils/fetcher';
import axios from 'axios';
import { Redirect } from 'react-router';

const Workspace: FC = ({ children }) => {
  const { data, error, mutate } = useSWR('http://localhost:3095/api/users', fetcher);
  const onLogout = useCallback(() => {
    axios.post('http://localhost:3095/api/users/logout', null, { withCredentials: true }).then(() => mutate());
  }, []);

  if (data === undefined) return <div>로딩 중...</div>;

  if (!data) return <Redirect to="/login/" />;

  return (
    <div>
      <button onClick={onLogout}>logout</button>
      {children}
    </div>
  );
};

export default Workspace;
