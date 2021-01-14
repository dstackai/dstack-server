// @flow
import React, {useState} from 'react';
import moment from 'moment';
import {useTranslation} from 'react-i18next';
import cx from 'classnames';
import Button from 'components/Button';
import css from './styles.module.css';

import type {Job} from 'components/Jobs/types';

type Props = {
    data: Job,
    className?: string,
}

const Logs = ({data, className}: Props) => {
    if (!data.logs)
        return null;

    const {t} = useTranslation();
    const [isShown, setIsShown] = useState(true);
    const [updated] = useState(data.finished || data.started);

    const toggleShow = () => setIsShown(!isShown);

    return (
        <div className={cx(css.logs, className)}>
            <Button
                className={css.button}
                onClick={toggleShow}
                color="primary"
                size="small"
            >
                {t('logs')}
            </Button>

            <div className={cx(css.text, {open: isShown})}>
                <pre>{data.logs}</pre>

                {updated && <div className={css.label}>
                    {t('updated')} {moment(updated).fromNow()}
                </div>}
            </div>
        </div>
    );
};

export default Logs;
