import classNames from 'classnames';
import { FC } from 'react';
import { INews } from '../../../../../../context/NewsContext';
import { formatDateNews } from '../../../../../../utils';
import './index.scss';

const HighlightedNewsItem: FC<{
  data: INews;
}> = ({ data }) => {
  return (
    <div className={classNames('hl-news-item', { 'card-border': data.cardBorder })}>
      <div className="hl-news-item-inside">
        <img src={'https://launchercontent.mojang.com' + data.playPageImage?.url} alt="" />
        <div className="hl-news-item-cont">
          <div>
            <h3>{data.title}</h3>
            <div className="hlnews-tag-date">
              <span className="hlnews-tag">{data.tag}</span>
              <span className="hlnews-date">{formatDateNews(data.date)}</span>
            </div>
            <p>{data.text}</p>
          </div>
          <div className="wrapper">
            <a className="bordered-btn green" href={data.readMoreLink} target="_blank">
              <div className="inner">Read more</div>
            </a>
            {data.linkButton && (
              <a className="bordered-btn green" href={data.linkButton.url} target="_blank">
                <div className="inner">
                  <span>{data.linkButton.label}</span>
                </div>
              </a>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default HighlightedNewsItem;
