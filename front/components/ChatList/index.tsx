import { IDM } from '@typings/db';
import React, { FC, forwardRef, useCallback, useRef } from 'react';
import { ChatZone, Section, StickyHeader } from './styles';
import Chat from '@components/Chat';
import { Scrollbars } from 'react-custom-scrollbars';

interface TProps {
  chatSections: { [key: string]: IDM[] };
  setSize: (f: (size: number) => number) => Promise<IDM[][] | undefined>;
  isReachingEnd: boolean;
}
const ChatList = forwardRef<Scrollbars, TProps>(({ chatSections, setSize, isReachingEnd }, ref) => {
  const onScroll = useCallback((values) => {
    if (values.ScrollTop === 0 && !isReachingEnd) {
      setSize((prevSize) => prevSize + 1).then(() => {
        // 스크롤 위치 유지
      });
    }
  }, []);
  return (
    <ChatZone>
      <Scrollbars autoHide ref={ref} onScrollFrame={onScroll}>
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
});
export default ChatList;
