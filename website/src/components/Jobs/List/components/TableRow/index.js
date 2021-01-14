// @flow
import React, {useEffect, useState, memo} from 'react';
import useSWR from 'swr';
import cx from 'classnames';
import moment from 'moment';
import {useParams} from 'react-router-dom';
import {useTranslation} from 'react-i18next';
import Dropdown from 'components/Dropdown';
import {useAppStore} from 'AppStore';
import {dataFetcher, getFormattedDuration} from 'utils';
import useActions from 'components/Jobs/actions';
import Progress from 'components/Jobs/Details/components/Progress';
import config from 'config';
import css from './styles.module.css';

type Props = {
    data: {[key: string]: any},
    onClickRow?: Function,
    onEdit?: Function,
    onDelete?: Function,
};

const REFRESH_TIMEOUT = 2000;
const dataFormat = data => data.job;

const TableRow = memo(({
    data,
    onClickRow,
    onEdit,
    onDelete,
}: Props) => {
    const {runJob, stopJob} = useActions();
    const [{currentUser, apiUrl}] = useAppStore();
    const currentUserName = currentUser.data?.user;
    const {t} = useTranslation();
    const {user} = useParams();
    const [refreshInterval, setRefreshInterval] = useState(0);

    const {data: jobData, mutate} = useSWR(
        [
            apiUrl + config.JOB_DETAILS(user, data.id),
            dataFormat,
        ],
        dataFetcher,
        {
            refreshInterval,
            initialData: data,
            revalidateOnFocus: false,
        }
    );

    const rowClick = () => {
        if (onClickRow)
            onClickRow(jobData);
    };

    useEffect(() => {
        if (['RUNNING', 'SCHEDULED'].indexOf(jobData?.status) >= 0) {
            if (!refreshInterval)
                setRefreshInterval(REFRESH_TIMEOUT);
        } else if (refreshInterval) {
            setRefreshInterval(0);
        }
    }, [jobData]);

    const onRun = async () => {
        const {job} = await runJob({user, id: jobData.id});

        if (job)
            mutate({
                ...jobData,
                ...job,
            });
    };

    const onStop = async () => {
        const {job} = await stopJob({user, id: jobData.id});

        if (job)
            mutate({
                ...jobData,
                ...job,
            });
    };

    const getTitle = () => {
        if (jobData.title && jobData.title.length)
            return jobData.title;
        else
            return <span>New job</span>;
    };

    const renderStatus = () => {
        switch (jobData.status) {
            case ('SCHEDULED'):
                return <div className={css.status}>
                    {t('inProgress')}&#8230;
                </div>;

            case ('RUNNING'):
                return <div className={css.status}>
                    {t('inProgress')}&#8230;

                    <Progress
                        className={css.progress}
                        data={jobData}
                    />
                </div>;

            case ('TIMEOUT'):
                return <div className={cx(css.status, 'fail')}>⛔️ {t('failedDueToTimeout')}</div>;

            case ('FAILED'):
                return <div className={cx(css.status, 'fail')}>⛔️ {t('failed')}</div>;

            case ('FINISHED'):
                return <div className={cx(css.status, 'success')}>✅ {t('completed')}</div>;

            case ('CREATED'):
                return <div className={css.status}>{t('neverRun')}</div>;

            default:
                return <div className={css.status}>{t(jobData.status.toLowerCase())}</div>;
        }
    };

    return (
        <div className={cx(css.row, {red: ['TIMEOUT', 'FAILED'].indexOf(jobData.status) > -1})} onClick={rowClick}>
            <div className={css.cell}>{getTitle()}</div>
            <div className={css.cell}>{t(jobData.runtime)}</div>
            <div className={css.cell}>{moment(jobData.started).format('MM-DD-YYYY [at] HH:mm')}</div>
            <div className={css.cell}>{getFormattedDuration(jobData.finished - jobData.started)}</div>

            <div className={css.cell}>
                {renderStatus()}

                {currentUserName === user && (
                    <Dropdown
                        className={css.dropdown}

                        items={[
                            ...(['RUNNING', 'SCHEDULED', 'STOPPING'].indexOf(jobData.status) >= 0
                                ? [{
                                    title: t('stop'),
                                    onClick: onStop,
                                }]

                                : [{
                                    title: t('run'),
                                    onClick: onRun,
                                }]
                            ),

                            {
                                title: t('edit'),
                                onClick: onEdit,
                            },

                            {
                                title: t('delete'),
                                onClick: onDelete,
                            },
                        ]}
                    />
                )}
            </div>
        </div>
    );
});

export default TableRow;
