import { IDM } from '@typings/db';
import React, { FC, useCallback, useRef } from 'react';
import { ChatZone } from './styles';
import Chat from '@components/Chat';
import { Scrollbars } from 'react-custom-scrollbars';

interface TProps {
  chatData: IDM[];
}
const ChatList: FC<TProps> = ({ chatData }) => {
  const scrollRef = useRef(null);
  const onScroll = useCallback(() => {
    // 위로 올리면 이전 글들도 불러와지는 작업
  }, []);
  return (
    <ChatZone>
      <Scrollbars autoHide ref={scrollRef} onScrollFrame={onScroll}>
        {chatData.map((chat) => (
          <Chat key={chat.id} data={chat} />
        ))}
      </Scrollbars>
    </ChatZone>
  );
};
export default ChatList;
