// @flow
import React, {Fragment, useEffect, useRef, useState} from 'react';
import {Link, useHistory, useParams} from 'react-router-dom';
import {useTranslation} from 'react-i18next';
import useSWR from 'swr';
import AccessForbidden from 'components/AccessForbidden';
import NotFound from 'components/NotFound';
import StretchTitleField from 'components/StretchTitleField';
import Dropdown from 'components/Dropdown';
import Button from 'components/Button';
import BackButton from 'components/BackButton';
import Yield from 'components/Yield';
import {useAppStore} from 'AppStore';
import {dataFetcher, isSignedIn} from 'utils';
import usePrevious from 'hooks/usePrevious';
import useDebounce from 'hooks/useDebounce';
import useAppProgress from 'hooks/useAppProgress';
import ScheduleSettings from './components/ScheduleSettings';
import CodeEditor from './components/CodeEditor';
import Status from './components/Status';
import Logs from './components/Logs';
import Progress from './components/Progress';
import Loader from './components/Loader';
import routes from 'routes';
import config from 'config';
import useActions from '../actions';
import {calculateJobProgress} from 'utils';
import css from './styles.module.css';

type Props = {}

const REFRESH_TIMEOUT = 3000;

const dataFormat = data => data.job;

const Details = ({}: Props) => {
    const {
        runJob,
        stopJob,
        updateJob,
        removeJob,
    } = useActions();

    const {setAppProgress, resetAppProgress} = useAppProgress();
    const {user, id} = useParams();
    const [refreshInterval, setRefreshInterval] = useState(0);
    const [{currentUser, apiUrl}] = useAppStore();
    const currentUserName = currentUser.data?.user;

    const {data: jobData, error, mutate} = useSWR(
        [
            apiUrl + config.JOB_DETAILS(user, id),
            dataFormat,
        ],
        dataFetcher,
        {refreshInterval}
    );

    const {push} = useHistory();
    const {t} = useTranslation();
    const [titleValue, setTitleValue] = useState('');
    const [code, setCode] = useState('');
    const [running, setRunning] = useState(false);
    const [stopping, setStopping] = useState(false);
    const [codeSaved, setCodeSaved] = useState(true);
    const progressTimer = useRef(null);

    const update = async params => {
        const data = await updateJob(params);

        mutate({
            ...jobData,
            ...data.job,
        });
    };

    const updateDebounce = useDebounce(update, 1000, []);
    const updateLongDebounce = useDebounce(update, 2000, []);


    const prevData = usePrevious(jobData);

    useEffect(() => {
        window.addEventListener('keydown', detectEnterPress);
        return () => window.removeEventListener('keydown', detectEnterPress);
    }, [jobData, code]);

    useEffect(() => {
        if (jobData) {
            setTitleValue(jobData.title);
            setCode(jobData.code);
        }
    }, []);

    const detectEnterPress = event => {
        if (event.code === 'Enter' && (event.shiftKey || event.ctrlKey)) {
            event.preventDefault();

            if (!running && !stopping)
                onClickRun();
        }
    };

    useEffect(() => {
        if (['RUNNING', 'SCHEDULED', 'STOPPING'].indexOf(jobData?.status) >= 0) {
            clearInterval(progressTimer.current);

            progressTimer.current = setInterval(() => {
                const [progress] = calculateJobProgress(jobData);

                setAppProgress(progress);
            }, 50);
        } else {
            clearInterval(progressTimer.current);
        }

        return () => clearInterval(progressTimer.current);
    }, [refreshInterval, jobData]);

    useEffect(() => {
        if (prevData?.id !== jobData?.id) {
            setTitleValue(jobData.title);
            setCode(jobData.code);
        }

        if (['RUNNING', 'SCHEDULED'].indexOf(jobData?.status) >= 0) {
            if (!refreshInterval)
                setRefreshInterval(REFRESH_TIMEOUT);
        } else if (refreshInterval) {
            setRefreshInterval(0);
            resetAppProgress();
        }

        return () => {
            resetAppProgress();
        };
    }, [jobData]);

    const onChangeTitle = value => {
        setTitleValue(value);

        updateDebounce({
            user: user,
            id: jobData?.id,
            title: value,
        });
    };

    const onChangeCode = value => {
        setCode(value);
        setCodeSaved(false);

        updateLongDebounce(
            {
                user: user,
                id: jobData?.id,
                code: value,
            },

            () => setCodeSaved(true),
        );
    };

    const onChangeRuntime = runtime => {
        update({
            user: user,
            id: jobData?.id,
            runtime: runtime,
        });
    };

    const onChangeSchedule = schedule => {
        update({
            user: user,
            id: jobData?.id,
            schedule: schedule,
        });
    };

    const onClickRun = async () => {
        setRunning(true);

        try {
            const data = await runJob({
                user: user,
                id: jobData?.id,
                code,
            });

            mutate({
                ...jobData,
                ...data,
            });

            setRefreshInterval(REFRESH_TIMEOUT);
        } catch (e) {
            console.log(e);
        }

        setRunning(false);
    };

    const onClickStop = async () => {
        setStopping(true);

        try {
            const data = await stopJob({
                user: user,
                id: jobData?.id,
            });

            mutate({
                ...jobData,
                ...data,
            });
        } catch (e) {
            console.log(e);
        }

        setStopping(false);
    };

    const onClickDelete = async () => {
        await removeJob({
            user: user,
            id: jobData?.id,
        });

        push(routes.jobs(user));
    };

    if (!jobData && !error)
        return <Loader />;

    if (error?.status === 403)
        return <AccessForbidden>
            {t('youDontHaveAnAccessToThisJob')}.

            {isSignedIn() && (
                <Fragment>
                    <br />

                    <Link to={routes.dashboards(currentUserName)}>
                        {t('goToMyJobs')}
                    </Link>
                </Fragment>
            )}
        </AccessForbidden>;

    if (error?.status === 404)
        return <NotFound>
            {t('theJobYouAreRookingForCouldNotBeFound')}
            {' '}
            {isSignedIn() && (
                <Fragment>
                    <Link to={routes.dashboards(currentUserName)}>
                        {t('goToMyJobs')}
                    </Link>.
                </Fragment>
            )}
        </NotFound>;

    if (!jobData)
        return null;

    return (
        <div className={css.details}>
            <Yield name="header-yield">
                <BackButton
                    Component={Link}
                    to={routes.jobs(user)}
                >
                    {(currentUserName === user)
                        ? t('backToJobs')
                        : t('backToJobsOf', {name: user})
                    }
                </BackButton>
            </Yield>

            <div className={css.header}>
                <div className={css.title}>
                    <StretchTitleField
                        className={css.edit}
                        value={titleValue}
                        onChange={onChangeTitle}
                        readOnly={currentUserName !== user}
                        placeholder={t('newJob')}
                    />
                </div>

                <div className={css.side}>
                    {jobData.status === 'RUNNING' && (
                        <Progress onlyDuration className={css.progress} data={jobData} />
                    )}

                    {jobData.status === 'FAILED' && (
                        <div className="red-text">{t('sorryButYourCodeDoesntLookLikePythonJob')}</div>
                    )}

                    {['RUNNING', 'SCHEDULED', 'STOPPING'].indexOf(jobData.status) >= 0
                        ? <Button
                            className={css.button}
                            color="fail"
                            size="small"
                            variant="contained"
                            disabled={stopping}
                            onClick={onClickStop}
                        >
                            <span className="mdi mdi-pause" />
                            {t('stop')}
                        </Button>

                        : <Button
                            className={css.button}
                            color="success"
                            size="small"
                            variant="contained"
                            disabled={running}
                            onClick={onClickRun}
                        >
                            <span className="mdi mdi-play" />
                            {t('run')}
                        </Button>
                    }
                </div>

                {currentUserName === user && <Dropdown
                    className={css.dropdown}

                    items={[
                        {
                            title: t('delete'),
                            onClick: onClickDelete,
                        },
                    ]}
                >
                    <Button
                        className={css.dropdownButton}
                        color="secondary"
                    >
                        <span className="mdi mdi-dots-horizontal" />
                    </Button>
                </Dropdown>}
            </div>

            <Status data={jobData} />

            <ScheduleSettings
                className={css.schedule}
                data={jobData}
                onChange={onChangeSchedule}
                onChangeRuntime={onChangeRuntime}
            />

            <CodeEditor
                className={css.codeEditor}
                value={code}
                onChange={onChangeCode}
                language={jobData.runtime}
                saved={codeSaved}
            />

            <Logs
                className={css.logs}
                data={jobData}
            />
        </div>
    );
};

export default Details;
