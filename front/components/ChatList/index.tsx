import { IDM } from '@typings/db';
import React, { FC, useCallback, useRef } from 'react';
import { ChatZone, Section, StickyHeader } from './styles';
import Chat from '@components/Chat';
import { Scrollbars } from 'react-custom-scrollbars';

interface TProps {
  chatSections: { [key: string]: IDM[] };
}
const ChatList: FC<TProps> = ({ chatSections }) => {
  const scrollRef = useRef(null);
  const onScroll = useCallback(() => {
    // 위로 올리면 이전 글들도 불러와지는 작업
  }, []);
  return (
    <ChatZone>
      <Scrollbars autoHide ref={scrollRef} onScrollFrame={onScroll}>
        {Object.entries(chatSections).map(([date, chats]) => {
          return (
            <Section key={date} className={`section-${date}`}>
              <StickyHeader>
                <button>{date}</button>
              </StickyHeader>
              {chats.map((chat) => (
                <Chat key={chat.id} data={chat} />
              ))}
            </Section>
          );
        })}
      </Scrollbars>
    </ChatZone>
  );
};
export default ChatList;
