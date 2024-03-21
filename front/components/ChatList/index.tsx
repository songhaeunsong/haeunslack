import { IChat, IDM } from '@typings/db';
import React, { MutableRefObject, forwardRef, useCallback } from 'react';
import { ChatZone, Section, StickyHeader } from './styles';
import Chat from '@components/Chat';
import { Scrollbars } from 'react-custom-scrollbars';

interface TProps {
  chatSections: { [key: string]: (IDM | IChat)[] };
  setSize: (f: (size: number) => number) => Promise<(IDM | IChat)[][] | undefined>;
  isReachingEnd: boolean;
}
const ChatList = forwardRef<Scrollbars, TProps>(({ chatSections, setSize, isReachingEnd }, scrollRef) => {
  const onScroll = useCallback(
    (values) => {
      if (values.scrollTop === 0 && !isReachingEnd) {
        setSize((prevSize) => prevSize + 1).then(() => {
          setTimeout(() => {
            const current = (scrollRef as MutableRefObject<Scrollbars>).current;
            current?.scrollTop(current.getScrollHeight() - values.scrollHeight);
          }, 50);
        });
      }
    },
    [scrollRef, isReachingEnd, setSize],
  );
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
});
export default ChatList;
