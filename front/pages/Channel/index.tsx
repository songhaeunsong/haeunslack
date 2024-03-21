import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Container, Header } from './styles';
import ChatBox from '@components/ChatBox';
import useInput from '@hooks/useInput';
import ChatList from '@components/ChatList';
import axios from 'axios';
import { useParams } from 'react-router';
import useSocket from '@hooks/useSocket';
import useSWR from 'swr';
import useSWRInfinite from 'swr/infinite';
import fetcher from '@utils/fetcher';
import Scrollbars from 'react-custom-scrollbars';
import { IChannel, IChat } from '@typings/db';
import { separateSection } from '@utils/separateSection';
import InviteChannelModal from '@components/InviteChannelModal';

const PERPAGE = 20; // chatData 몇개씩 불러올지 지정

const Channel = () => {
  const { workspace, channel } = useParams<{ workspace: string; channel: string }>();
  const [showInviteChannelModal, setShowInviteChannelModal] = useState(false);
  const [chat, onChangeChat, setChat] = useInput('');

  const [socket] = useSocket(workspace);

  const { data: myData } = useSWR(`http://localhost:3095/api/users`, fetcher);

  const { data: channelData } = useSWR<IChannel>(
    `http://localhost:3095/api/workspaces/${workspace}/channels/${channel}`,
    fetcher,
  );
  const { data: channelMembersData } = useSWR(
    myData ? `http://localhost:3095/api/workspaces/${workspace}/channels/${channel}/members` : null,
    fetcher,
  );

  const {
    data: chatData,
    mutate: mutateChat,
    setSize,
  } = useSWRInfinite<IChat[]>(
    (index) =>
      `http://localhost:3095/api/workspaces/${workspace}/channels/${channel}/chats?perPage=${PERPAGE}&page=${index + 1}`,
    fetcher,
  );
  const scrollRef = useRef<Scrollbars>(null);

  const onMessage = useCallback(
    (data: IChat) => {
      if (data.Channel.name === channel && data.UserId !== myData.id) {
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
    },
    [channel, myData],
  );
  useEffect(() => {
    socket?.on('message', onMessage);
    return () => {
      socket?.off('message', onMessage);
    };
  }, [socket, onMessage]);

  let isEmpty = chatData?.[0]?.length === 0;
  let isReachingEnd = isEmpty || (chatData && chatData[chatData.length - 1]?.length < PERPAGE) || false;

  useEffect(() => {
    if (chatData?.length === 1) {
      scrollRef.current?.scrollToBottom();
    }
  }, [chatData]);

  const onClickInviteChannel = useCallback(() => {
    setShowInviteChannelModal(true);
  }, []);

  const onCloseModal = useCallback(() => {
    setShowInviteChannelModal((prev) => !prev);
  }, []);
  const onSubmitForm = useCallback(
    (e) => {
      e.preventDefault();
      if (chat?.trim() && chatData && channelData) {
        const savedChat = chat;
        mutateChat((prevChatData) => {
          prevChatData?.[0].unshift({
            id: (chatData[0][0]?.id || 0) + 1,
            UserId: myData.id,
            User: myData,
            content: savedChat,
            createdAt: new Date(),
            ChannelId: channelData.id,
            Channel: channelData,
          });
          return prevChatData;
        }).then(() => {
          setChat('');
          scrollRef.current?.scrollToBottom();
        });

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
    [chat, workspace, channel, myData, chatData, channelData],
  );

  if (!myData || !chatData) {
    return null;
  }

  const chatSections = separateSection([...chatData].flat().reverse());

  return (
    <Container>
      <Header>
        <span>#{channel}</span>
        <div className="header-right">
          <span>{channelMembersData?.length}</span>
          <button
            onClick={onClickInviteChannel}
            className="c-button-unstyled p-ia__view_header__button"
            aria-label="Add people to #react-native"
            data-sk="tooltip_parent"
            type="button"
          >
            <i className="c-icon p-ia__view_header__button_icon c-icon--add-user" aria-hidden="true" />
          </button>
        </div>
      </Header>
      <ChatList chatSections={chatSections} ref={scrollRef} setSize={setSize} isReachingEnd={isReachingEnd} />
      <ChatBox chat={chat} onChangeChat={onChangeChat} onSubmitForm={onSubmitForm} />
      <InviteChannelModal
        show={showInviteChannelModal}
        setShowInviteChannelModal={setShowInviteChannelModal}
        onCloseModal={onCloseModal}
      ></InviteChannelModal>
    </Container>
  );
};

export default Channel;
