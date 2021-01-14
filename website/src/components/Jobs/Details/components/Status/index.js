// @flow
import React from 'react';
import {useTranslation} from 'react-i18next';
import moment from 'moment';
import {getFormattedDuration} from 'utils';
import type {Job} from 'components/Jobs/types';
import css from './styles.module.css';

type Props = {
    data: Job,
}

const Status = ({data}: Props) => {
    const {t} = useTranslation();

    if (!data.started)
        return null;

    return (
        <div className={css.status}>
            {t('lastRunning')}
            {' '}
            {moment(data.started).format(`MM-DD-YYYY [${t('at')}] HH:mm`)}

            <span>
                <span className="mdi mdi-clock-outline" />

                {['RUNNING', 'SCHEDULED'].indexOf(data.status) >= 0
                    ? <span>{' '}{t('inProgress')}&#8230;</span>
                    : getFormattedDuration(data.finished - data.started)
                }
            </span>

            {data.status === 'FAILED' && (
                <span className="red-text">
                    <span className="mdi mdi-close-octagon-outline" />
                    {t('failed')}
                </span>
            )}

            {data.status === 'TIMEOUT' && (
                <span className="red-text">
                    <span className="mdi mdi-close-octagon-outline" />
                    {t('failedDueToTimeout')}
                </span>
            )}
        </div>
    );
};

export default Status;
