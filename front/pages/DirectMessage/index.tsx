import React from 'react';
import gravatar from 'gravatar';
import useSWR from 'swr';
import { Container, Header } from './styles';
import fetcher from '@utils/fetcher';
import { IUser } from '@typings/db';
import { useParams } from 'react-router';
import ChatBox from '@components/ChatBox';

const DirectMessage = () => {
  const { workspace, id } = useParams<{ workspace: string; id: string }>();
  const { data: myData } = useSWR(`http://localhost:3095/api/users`, fetcher);
  const { data: userData } = useSWR(`http://localhost:3095/api/workspaces/${workspace}/users/${id}`, fetcher, {
    dedupingInterval: 2000,
  });

  if (!myData || !userData) return null;

  return (
    <Container>
      <Header>
        <img src={gravatar.url(userData.email, { s: '24px', d: 'retro' })} alt={userData.nickname} />
        <span>{userData.nickname}</span>
        {/*<ChatList/>*/}
        <ChatBox chat="" />
      </Header>
    </Container>
  );
  return <div>dm page</div>;
};

export default DirectMessage;
