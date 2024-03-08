import { IDM } from '@typings/db';
import dayjs from 'dayjs';

export const separateSection = (chatList: IDM[]) => {
  const sections: { [key: string]: IDM[] } = {};
  chatList.map((chat) => {
    const date = dayjs(chat.createdAt).format('YYYY-MM-DD');
    Array.isArray(sections[date]) ? sections[date].push(chat) : (sections[date] = [chat]);
  });
  return sections;
};
