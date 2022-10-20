import { invoke } from '@tauri-apps/api';
import classNames from 'classnames';
import { useState, useEffect, useContext } from 'react';
import SearchBox from '../../../../components/SearchBox';
import { NewsContext } from '../../../../context/NewsContext';
import { T } from '../../../../context/TranslationContext';
import { useTranslation } from '../../../../hooks/useTranslation';
import { formatDateNews, generateRandomStr } from '../../../../utils';

const Forum: React.FC = () => {
  const { t } = useTranslation();

  const { minecraftForum: news } = useContext(NewsContext);

  const [results, setResults] = useState(0);
  const [filterText, setFilterText] = useState('');
  const handleFilterTextChange = (value: string) => {
    setFilterText(value);
    if (value === '') setResults(0);
    if (value !== '') setResults(news.filter((v) => v.title.toLowerCase().includes(value.toLowerCase())).length);
  };

  return (
    <div className="mc-news forum">
      <div className="news-filters">
        <div className="news-filters-inside">
          <div className="search-filter">
            <p className="filter-name">
              <T>Search</T>
            </p>
            <SearchBox results={results} value={filterText} placeholder={t('News title')} handleFilter={handleFilterTextChange} />
          </div>
        </div>
      </div>
      <div style={{ width: '100%', background: 'var(--divider)', height: '1px' }}></div>
      <div className="news-list">
        <div className="news-list-inside">
          {news.map((n) => {
            return (
              <a className={classNames('news-item')} href={n.readMoreLink} target="_blank" key={n.id} style={{ display: 'block' }}>
                <div className="news-item-img news-item-img-forum">
                  <img src={n.newsPageImage.url} alt={n.newsPageImage.title} />
                </div>
                <div className="news-item-cont">
                  <h3>{n.title}</h3>
                  <div className="wrapper">
                    <span className="cat">Minecraft</span>
                    <span className="date">{formatDateNews(n.date)}</span>
                  </div>
                </div>
              </a>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default Forum;
