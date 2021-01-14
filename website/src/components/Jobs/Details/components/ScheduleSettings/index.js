import React, {Fragment, useEffect, useRef, useState} from 'react';
import {useTranslation} from 'react-i18next';
import cx from 'classnames';
import moment from 'moment';
import Button from 'components/Button';
import Dropdown from 'components/Dropdown';
import {getFormattedDuration} from 'utils';
import type {Job} from 'components/Jobs/types';
import css from './styles.module.css';

type Props = {
    data: Job,
    className?: string,
    onChange: Function,
}

let timeout = null;

const ScheduleSettings = ({data, className, onChange, onChangeRuntime}: Props) => {
    const {t} = useTranslation();
    const messageRef = useRef();
    const [scheduleType, setScheduleType] = useState(data ? data.schedule.split('/')[0] : '');
    const [scheduleTime, setScheduleTime] = useState(data ? data.schedule.split('/')[1] : null);
    const [nextRunDelay, setNextRunDelay] = useState(0);
    const isDidMount = useRef(true);

    const runtimeChange = runtime => () => {
        onChangeRuntime(runtime);
        localStorage.setItem('lastRuntime', runtime);
    };

    const scheduleTypeChange = type => () => {
        setScheduleType(type);

        if (!scheduleTime)
            setScheduleTime('12:00');

        if (type === 'daily')
            type += `/${scheduleTime ? scheduleTime : '12:00'}`;

        onChange(type);
    };

    const scheduleTimeChange = time => () => {
        setScheduleTime(time);
        onChange(`${scheduleType}/${time}`);

        const runTime = moment(time, 'HH:mm');

        if (new Date().getHours() > runTime.get('hours'))
            runTime.add(1, 'day');

        setNextRunDelay(runTime.toDate().getTime() - Date.now());
    };

    useEffect(() => {
        if (nextRunDelay && !isDidMount.current && messageRef.current) {
            messageRef.current.classList.add('show');

            if (timeout)
                clearTimeout(timeout);

            timeout = setTimeout(() => {
                messageRef.current.classList.remove('show');
            }, 3000);
        }

        if (isDidMount.current)
            isDidMount.current = false;
    }, [nextRunDelay]);

    return (
        <div className={cx(css.schedule, className)}>
            {t('runtime')}:

            <Dropdown
                className={cx(css.dropdown, css.runtime)}

                items={[
                    {
                        title: t('python'),
                        onClick: runtimeChange('python'),
                    },

                    {
                        title: t('r'),
                        onClick: runtimeChange('r'),
                    },
                ]}
            >
                <Button
                    className={css.dropdownButton}
                    color="primary"
                >
                    {t(data.runtime)}
                    <span className="mdi mdi-chevron-down" />
                </Button>
            </Dropdown>

            {t('jobIs')} {scheduleType !== 'unscheduled' && t('scheduled')}

            <Dropdown
                className={css.dropdown}

                items={[
                    {
                        title: t('unscheduled'),
                        onClick: scheduleTypeChange('unscheduled'),
                    },

                    {
                        title: t('daily'),
                        onClick: scheduleTypeChange('daily'),
                    },

                    // {
                    //     title: t('hourly'),
                    //     onClick: scheduleTypeChange('hourly'),
                    // },
                ]}
            >
                <Button
                    className={css.dropdownButton}
                    color="primary"
                >
                    {t(scheduleType)}
                    <span className="mdi mdi-chevron-down" />
                </Button>
            </Dropdown>

            {scheduleType === 'daily' && (
                <Fragment>
                    {t('at')}

                    <Dropdown
                        className={css.dropdown}

                        items={new Array(24).fill(0).map((i, index) => {
                            const time = `${index < 10 ? '0' + index : index}:00`;

                            return {
                                title: time,
                                onClick: scheduleTimeChange(time),
                            };
                        })}
                    >
                        <Button
                            className={css.dropdownButton}
                            color="primary"
                        >
                            {scheduleTime} UTC
                            <span className="mdi mdi-chevron-down" />
                        </Button>
                    </Dropdown>

                    <div ref={messageRef} className={cx(css.message, 'green-text')}>
                        The next run starts in {getFormattedDuration(nextRunDelay)}
                    </div>
                </Fragment>
            )}
        </div>
    );
};

export default ScheduleSettings;
