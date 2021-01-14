// @flow

import React, {useState} from 'react';
import cx from 'classnames';
import copy from 'copy-to-clipboard';
import {useTranslation} from 'react-i18next';
import css from './styles.module.css';

type Props = {
    children?: Function,
    className?: string,
    copyText: string,
    buttonTitle?: ?string,
    successMessage?: string,
};

const Copy = ({children, className, copyText, successMessage, buttonTitle}: Props) => {
    const {t} = useTranslation();
    const [isShowMessage, setIsShowMessage] = useState(false);

    const onCLick = () => {
        copy(copyText);
        setIsShowMessage(true);
        setTimeout(() => setIsShowMessage(false), 3000);
    };

    return <div className={cx(css.copy, className)}>
        {children
            ? children({onClick: onCLick})
            : (
                <div className={css.button} onClick={onCLick}>
                    <span className={cx(css.icon, {[css.margin]: buttonTitle !== null}, 'mdi mdi-content-copy')} />

                    {buttonTitle && buttonTitle}
                    {buttonTitle === undefined && t('copy')}
                </div>
            )
        }

        <div className={cx(css.message, {'is-show': isShowMessage})}>
            {successMessage
                ? successMessage
                : t('copied')
            }
        </div>
    </div>;
};

export default Copy;
