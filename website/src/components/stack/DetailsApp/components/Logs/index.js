// @flow
import React, {useState} from 'react';
import {useTranslation} from 'react-i18next';
import moment from 'moment';
import cx from 'classnames';
import Button from 'components/Button';
import css from './styles.module.css';

type Props = {
    className: string,
    date: string,
    logs: string,
}

const Logs = ({date, logs, className}: Props) => {
    const {t} = useTranslation();
    const [logsExpand, setExpandLogs] = useState(false);

    const toggle = () => setExpandLogs(value => !value);

    return (
        <div className={cx(css.logs, className)}>
            <Button
                className={css.logsButton}
                color="primary"
                onClick={toggle}
                size="small"
            >
                {t('logs')}
                <span className={`mdi mdi-arrow-${logsExpand ? 'collapse' : 'expand'}`} />
            </Button>

            <div className={cx(css.logsExpand, {open: logsExpand})}>
                <div className={css.fromAgo}>{t('updated')} {moment(date).fromNow()}</div>

                <div className={css.log}>
                    {logs}
                </div>
            </div>
        </div>
    );
};

export default Logs;