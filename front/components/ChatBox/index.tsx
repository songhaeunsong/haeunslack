import { IUser } from '@typings/db';
import fetcher from '@utils/fetcher';
import React, { useCallback, useEffect, useRef, VFC } from 'react';
import { useParams } from 'react-router';
import useSWR from 'swr';
import gravatar from 'gravatar';
import autosize from 'autosize';
import { Mention } from 'react-mentions';
import { ChatArea, EachMention, Form, MentionsTextarea, SendButton, Toolbox } from './styles';

interface TProps {
  chat: string;
  onChangeChat: (e: any) => void;
  onSubmitForm: (e: any) => void;
}
const ChatBox: VFC<TProps> = ({ chat, onChangeChat, onSubmitForm }) => {
  const { workspace } = useParams<{ workspace: string }>();
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const { data: memberData } = useSWR<IUser[]>(`http://localhost:3095/api/workspaces/${workspace}/members`, fetcher);
  useEffect(() => {
    if (textareaRef.current) autosize(textareaRef.current);
  }, []);

  const {
    data: userData,
    error,
    mutate,
  } = useSWR<IUser | false>('http://localhost:3095/api/users', fetcher, {
    dedupingInterval: 2000,
  });

  const onKeyDownChat = useCallback(
    (e) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        onSubmitForm(e);
      }
      return;
    },
    [onSubmitForm],
  );

  const renderSuggestion = useCallback(
    (
      suggestion: any,
      search: string,
      highlightedDisplay: React.ReactNode,
      index: number,
      focus: boolean,
    ): React.ReactNode => {
      if (!memberData) return;
      return (
        <EachMention focus={focus}>
          <img
            src={gravatar.url(memberData[index].email, { s: '36px', d: 'retro' })}
            alt={memberData[index].nickname}
          />
          <span>{highlightedDisplay}</span>
        </EachMention>
      );
    },
    [memberData],
  );

  return (
    <ChatArea>
      <Form onSubmit={onSubmitForm}>
        <MentionsTextarea
          id="editor-chat"
          value={chat}
          onChange={onChangeChat}
          onKeyDown={onKeyDownChat}
          inputRef={textareaRef}
          forceSuggestionsAboveCursor
        >
          <Mention
            appendSpaceOnAdd
            trigger="@"
            data={memberData?.map((v) => ({ id: v.id, display: v.nickname })) || []}
            renderSuggestion={renderSuggestion}
          />
        </MentionsTextarea>
        <Toolbox>
          <SendButton
            className={
              'c-button-unstyled c-icon_button c-icon_button--light c-icon_button--size_medium c-texty_input__button c-texty_input__button--send' +
              (chat?.trim() ? '' : ' c-texty_input__button--disabled')
            }
            data-qa="texty_send_button"
            aria-label="Send message"
            data-sk="tooltip_parent"
            type="submit"
            disabled={!chat?.trim()}
          >
            <i className="c-icon c-icon--paperplane-filled" aria-hidden="true" />
          </SendButton>
        </Toolbox>
      </Form>
    </ChatArea>
  );
};

export default ChatBox;
