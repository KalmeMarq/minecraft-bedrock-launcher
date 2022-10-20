import { invoke } from '@tauri-apps/api';
import React, { createContext, useEffect, useState } from 'react';
import { generateRandomStr } from '../utils';

export interface INews {
  id: string;
  title: string;
  tag: string;
  category: 'Minecraft: Java Edition' | 'Minecraft Dungeons' | 'Minecraft for Windows' | 'Minecraft Legends';
  date: string;
  readMoreLink: string;
  newsType: ('News page' | 'Java' | 'Dungeons' | 'Bedrock' | 'Legends')[];
  cardBorder?: boolean;
  newsPageImage: {
    url: string;
    title: string;
  };
}

export interface INewsForum {
  id: string;
  title: string;
  date: string;
  readMoreLink: string;
  newsPageImage: {
    url: string;
    title: string;
  };
}

export function parseForumNews(rawDoc: string) {
  const doc = new DOMParser().parseFromString(rawDoc, 'text/xml');
  const channel = doc.getElementsByTagName('channel')[0];

  const news: INewsForum[] = [];

  for (const item of channel.getElementsByTagName('item')) {
    const title = item.getElementsByTagName('title')[0].textContent;
    const date = item.getElementsByTagName('pubDate')[0].textContent;
    const readMoreLink = item.getElementsByTagName('link')[0].textContent;

    const imageUrl = item.getAttribute('image');
    if (title && date && readMoreLink && imageUrl) {
      news.push({
        id: generateRandomStr(22),
        title,
        date,
        readMoreLink,
        newsPageImage: {
          url: imageUrl,
          title
        }
      });
    }
  }

  return news;
}

export function parseTopNews(rawDoc: string) {
  const doc = new DOMParser().parseFromString(rawDoc, 'text/xml');
  const channel = doc.getElementsByTagName('channel')[0];

  const news: INewsForum[] = [];

  for (const item of channel.getElementsByTagName('item')) {
    const title = item.getElementsByTagName('title')[0].textContent;
    const date = item.getElementsByTagName('pubDate')[0].textContent;
    const readMoreLink = item.getElementsByTagName('link')[0].textContent;

    const imageUrl = item.getElementsByTagName('media:content')[0].getAttribute('url');
    if (title && date && readMoreLink && imageUrl) {
      news.push({
        id: generateRandomStr(22),
        title,
        date,
        readMoreLink,
        newsPageImage: {
          url: imageUrl,
          title
        }
      });
    }
  }

  return news;
}

export const NewsContext = createContext<{
  minecraft: INews[];
  minecraftForum: INewsForum[];
  minecraftTop: INewsForum[];
}>({
  minecraft: [],
  minecraftForum: [],
  minecraftTop: []
});

export const NewsProvider: React.FC<React.PropsWithChildren> = ({ children }) => {
  const [minecraftNews, setMinecraftNews] = useState<INews[]>([]);
  const [minecraftForumNews, setMinecraftForumNews] = useState<INewsForum[]>([]);
  const [minecraftTopNews, setMinecraftTopNews] = useState<INewsForum[]>([]);

  useEffect(() => {
    if (minecraftNews.length === 0) {
      invoke('get_news_minecraft').then((data) => {
        setMinecraftNews((data as { entries: INews[] }).entries);
      });
    }

    if (minecraftForumNews.length === 0) {
      invoke('get_news_minecraft_forum').then((rawDoc) => {
        setMinecraftForumNews(parseForumNews(rawDoc as string));
      });
    }

    if (minecraftTopNews.length === 0) {
      invoke('get_news_minecraft_top').then((rawDoc) => {
        setMinecraftTopNews(parseTopNews(rawDoc as string));
      });
    }
  }, []);

  return (
    <NewsContext.Provider
      value={{
        minecraft: minecraftNews,
        minecraftForum: minecraftForumNews,
        minecraftTop: minecraftTopNews
      }}
    >
      {children}
    </NewsContext.Provider>
  );
};
