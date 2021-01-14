// @flow
import React from 'react';
import {useTranslation} from 'react-i18next';
import config from 'config';
import {ReactComponent as NotFoundIcon} from './404.svg';
import css from './style.module.css';

const NotFound = ({children}) => {
    const {t} = useTranslation();

    return (
        <div className={css['not-found']}>
            <NotFoundIcon width="224" height="77" />

            {children && (
                <div className={css.message}>
                    {children}
                </div>
            )}

            <div className={css.help}>
                {t('needHelpWWriteToUsOn')}
                {' '}
                <a target="_blank" href={config.TWITTER_URL}><span className="mdi mdi-twitter" /> Twitter</a>
                {', '}
                <a target="_blank" href={config.GITHUB_URL}><span className="mdi mdi-github-circle" />GitHub</a>
                {' '}
                {t('or')}
                {' '}
                <a target="_blank" href={config.DISCORD_URL}><span className="mdi mdi-discord" />Discord</a>
            </div>
        </div>
    );
};

export default NotFound;
