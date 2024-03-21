import React, { useCallback, useEffect, useRef } from 'react';
import gravatar from 'gravatar';
import useSWR from 'swr';
import useSWRInfinite from 'swr/infinite';
import { Container, Header } from './styles';
import fetcher from '@utils/fetcher';
import { IDM, IUser } from '@typings/db';
import { useParams } from 'react-router';
import ChatBox from '@components/ChatBox';
import useInput from '@hooks/useInput';
import axios from 'axios';
import ChatList from '@components/ChatList';
import { separateSection } from '@utils/separateSection';
import Scrollbars from 'react-custom-scrollbars';
import useSocket from '@hooks/useSocket';

const PERPAGE = 20; // chatData 몇개씩 불러올지 지정

const DirectMessage = () => {
  const { workspace, id } = useParams<{ workspace: string; id: string }>();
  const [chat, onChangeChat, setChat] = useInput('');

  const [socket] = useSocket(workspace);

  const { data: myData } = useSWR(`http://localhost:3095/api/users`, fetcher);
  const { data: userData } = useSWR(`http://localhost:3095/api/workspaces/${workspace}/users/${id}`, fetcher, {
    dedupingInterval: 2000,
  });
  const {
    data: chatData,
    mutate: mutateChat,
    setSize,
  } = useSWRInfinite<IDM[]>(
    (index) => `http://localhost:3095/api/workspaces/${workspace}/dms/${id}/chats?perPage=${PERPAGE}&page=${index + 1}`,
    fetcher,
  );
  const scrollRef = useRef<Scrollbars>(null);

  const onMessage = useCallback((data: IDM) => {
    if (data.SenderId === Number(id) && myData.id !== Number(id)) {
      mutateChat((chatData) => {
        chatData?.[0].unshift(data);
        return chatData;
      }, false).then(() => {
        if (scrollRef.current) {
          if (
            scrollRef.current.getScrollHeight() <
            scrollRef.current.getClientHeight() + scrollRef.current.getScrollTop() + 150
          ) {
            setTimeout(() => {
              scrollRef.current?.scrollToBottom();
            }, 50);
          }
        }
      });
    }
  }, []);

  useEffect(() => {
    socket?.on('dm', onMessage);
    return () => {
      socket?.off('dm', onMessage);
    };
  }, [socket, onMessage]);

  let isEmpty = chatData?.[0]?.length === 0;
  let isReachingEnd = isEmpty || (chatData && chatData[chatData.length - 1]?.length < PERPAGE) || false;

  useEffect(() => {
    if (chatData?.length === 1) {
      scrollRef.current?.scrollToBottom();
    }
  }, [chatData]);

  const onSubmitForm = useCallback(
    (e) => {
      e.preventDefault();
      if (chat?.trim() && chatData) {
        const savedChat = chat;
        mutateChat((prevChatData) => {
          prevChatData?.[0].unshift({
            id: (chatData[0][0].id || 0) + 1,
            SenderId: myData.id,
            Sender: myData,
            ReceiverId: userData.id,
            Receiver: userData,
            content: savedChat,
            createdAt: new Date(),
          });
          return prevChatData;
        }).then(() => {
          setChat('');
          scrollRef.current?.scrollToBottom();
        });

        axios
          .post(
            `http://localhost:3095/api/workspaces/${workspace}/dms/${id}/chats`,
            { content: chat },
            { withCredentials: true },
          )
          .catch((err) => {
            mutateChat();
            console.dir(err);
          });
      }
    },
    [chat, chatData, myData, userData, workspace, id],
  );

  if (!myData || !userData || !chatData) {
    return null;
  }

  const chatSections = separateSection([...chatData].flat().reverse());

  return (
    <Container>
      <Header>
        <img src={gravatar.url(userData.email, { s: '24px', d: 'retro' })} alt={userData.nickname} />
        <span>{userData.nickname}</span>
      </Header>
      <ChatList chatSections={chatSections} ref={scrollRef} setSize={setSize} isReachingEnd={isReachingEnd} />
      <ChatBox chat={chat} onChangeChat={onChangeChat} onSubmitForm={onSubmitForm} />
    </Container>
  );
  return <div>dm page</div>;
};

export default DirectMessage;
