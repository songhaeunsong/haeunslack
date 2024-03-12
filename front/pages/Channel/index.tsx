import React, { useCallback } from 'react';
import { Container, Header } from './styles';
import ChatBox from '@components/ChatBox';
import useInput from '@hooks/useInput';
import ChatList from '@components/ChatList';
import axios from 'axios';
import { useParams } from 'react-router';

const Channel = () => {
  const { workspace, channel } = useParams<{ workspace: string; channel: string }>();
  const [chat, onChangeChat, setChat] = useInput('');
  const onSubmitForm = useCallback(
    (e) => {
      e.preventDefault();
      if (chat?.trim()) {
        axios
          .post(
            `http://localhost:3095/api/workspaces/${workspace}/channels/${channel}/chats`,
            { content: chat },
            { withCredentials: true },
          )
          .then(() => {
            setChat('');
          })
          .catch((err) => console.dir(err));
      }
    },
    [chat, workspace, channel],
  );
  return (
    <Container>
      <Header>채널</Header>
      {/*<ChatList />*/}
      <ChatBox chat={chat} onChangeChat={onChangeChat} onSubmitForm={onSubmitForm} />
    </Container>
  );
};

export default Channel;
