import React, { useCallback } from 'react';
import gravatar from 'gravatar';
import useSWR from 'swr';
import { Container, Header } from './styles';
import fetcher from '@utils/fetcher';
import { IDM, IUser } from '@typings/db';
import { useParams } from 'react-router';
import ChatBox from '@components/ChatBox';
import useInput from '@hooks/useInput';
import axios from 'axios';
import ChatList from '@components/ChatList';

const DirectMessage = () => {
  const { workspace, id } = useParams<{ workspace: string; id: string }>();
  const { data: myData } = useSWR(`http://localhost:3095/api/users`, fetcher);
  const { data: userData } = useSWR(`http://localhost:3095/api/workspaces/${workspace}/users/${id}`, fetcher, {
    dedupingInterval: 2000,
  });
  const { mutate: mutateChat } = useSWR<IDM[]>(
    `http://localhost:3095/api/workspaces/${workspace}/dms/${id}/chats?perPage=20&page=1`,
    fetcher,
    {
      dedupingInterval: 2000,
    },
  );
  const [chat, onChangeChat, setChat] = useInput('');
  const onSubmitForm = useCallback(
    (e) => {
      e.preventDefault();
      if (chat?.trim()) {
        axios
          .post(`http://localhost:3095/api/workspaces/${workspace}/dms/${id}/chats`, { content: chat })
          .then((res) => {
            mutateChat(res.data, false);
            setChat('');
            console.log('DM submit');
          })
          .catch((err) => console.dir(err));
      }
    },
    [chat, workspace, id],
  );

  if (!myData || !userData) return null;

  return (
    <Container>
      <Header>
        <img src={gravatar.url(userData.email, { s: '24px', d: 'retro' })} alt={userData.nickname} />
        <span>{userData.nickname}</span>
        <ChatList />
        <ChatBox chat={chat} onChangeChat={onChangeChat} onSubmitForm={onSubmitForm} />
      </Header>
    </Container>
  );
  return <div>dm page</div>;
};

export default DirectMessage;
