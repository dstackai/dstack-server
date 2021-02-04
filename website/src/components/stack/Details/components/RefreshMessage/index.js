// @flow
import React from 'react';
import cn from 'classnames';
import {useTranslation} from 'react-i18next';
import Button from 'components/Button';
import css from './styles.module.css';

type Props = {
    className?: string,
    refresh: Function,
    close: Function,
}

const RefreshMessage = ({className, refresh, close}: Props) => {
    const {t} = useTranslation();

    return (
        <div className={cn(css.refreshMessage, className)}>
            {t('youAreWorkingWithAnOldVersionOfTheApplication')}
            {' '}
            <Button
                className={css.refreshMessageButton}
                size="small"
                color="primary"
                onClick={refresh}
            >{t('refresh')}</Button>
            {' '}
            {t('toSeeTheLatestVersion')}

            <Button
                className={cn(css.refreshMessageButton, css.close)}
                size="small"
                onClick={close}
            >
                <span className="mdi mdi-close" />
            </Button>
        </div>
    );
};

export default RefreshMessage;