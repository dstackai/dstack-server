// @flow
import React, {useEffect, useRef, useState} from 'react';
import cx from 'classnames';
import {useTranslation} from 'react-i18next';
import {getFormattedDuration} from 'utils';
import {calculateJobProgress} from 'utils';
import type {Job} from 'components/Jobs/types';
import css from './styles.module.css';

type Props = {
    data: Job,
    className?: string,
    onlyDuration?: boolean,
}

const Progress = ({data, className, onlyDuration}: Props) => {
    const {t} = useTranslation();
    const progressTimer = useRef(null);
    const [, set] = useState(null);

    useEffect(() => {
        if (data.status === 'RUNNING') {
            clearInterval(progressTimer.current);

            progressTimer.current = setInterval(() => {
                set(Date.now());
            }, 50);
        } else {
            clearInterval(progressTimer.current);
        }

        return () => clearInterval(progressTimer.current);
    }, [data]);

    if (!data.started)
        return null;

    const [progress, leftDuration]  = calculateJobProgress(data);

    return (
        <div className={cx(css.section, className)}>
            {!onlyDuration && <div className={css.progressBar}>
                <div className={css.progress} style={{width: `${progress}%`}} />
            </div>}


            <div className={css.time}>
                {getFormattedDuration(leftDuration)} {t('left')}
            </div>
        </div>
    );
};

export default Progress;
