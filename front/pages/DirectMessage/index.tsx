import React, { useCallback, useEffect } from 'react';
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
import useSocket from '@hooks/useSocket';
import { separateSection } from '@utils/separateSection';

const DirectMessage = () => {
  const { workspace, id } = useParams<{ workspace: string; id: string }>();
  const [chat, onChangeChat, setChat] = useInput('');
  const [socket] = useSocket(workspace);

  const { data: myData } = useSWR(`http://localhost:3095/api/users`, fetcher);
  const { data: userData } = useSWR(`http://localhost:3095/api/workspaces/${workspace}/users/${id}`, fetcher, {
    dedupingInterval: 2000,
  });
  const { data: chatData, mutate: mutateChat } = useSWR<IDM[]>(
    `http://localhost:3095/api/workspaces/${workspace}/dms/${id}/chats?perPage=20&page=1`,
    fetcher,
    {
      dedupingInterval: 2000,
    },
  );

  // console.log('chatData', chatData);

  const onSubmitForm = useCallback(
    (e) => {
      e.preventDefault();
      if (chat?.trim() && chatData) {
        axios
          .post(
            `http://localhost:3095/api/workspaces/${workspace}/dms/${id}/chats`,
            { content: chat },
            { withCredentials: true },
          )
          .then(() => {
            mutateChat();
            setChat('');
          })
          .catch((err) => console.dir(err));
      }
    },
    [chat, chatData, myData, userData, workspace, id],
  );

  if (!myData || !userData || !chatData) {
    return null;
  }

  const chatSections = separateSection([...chatData].reverse());

  return (
    <Container>
      <Header>
        <img src={gravatar.url(userData.email, { s: '24px', d: 'retro' })} alt={userData.nickname} />
        <span>{userData.nickname}</span>
      </Header>
      <ChatList chatSections={chatSections} />
      <ChatBox chat={chat} onChangeChat={onChangeChat} onSubmitForm={onSubmitForm} />
    </Container>
  );
  return <div>dm page</div>;
};

export default DirectMessage;
