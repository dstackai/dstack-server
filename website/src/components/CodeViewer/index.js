// @flow

import React from 'react';
import Highlight from 'react-highlight.js';
import {useTranslation} from 'react-i18next';
import Copy from 'components/Copy';
import cx from 'classnames';
import './theme.css';
import css from './styles.module.css';

type Props = {
    className?: string,
    language: string,
    children: string,
    fontSize?: string | number
};

const CodeViewer = ({className, language, children, fontSize}: Props) => {
    const {t} = useTranslation();

    return (
        <div className={cx(css.code, className, fontSize && `font-size-${fontSize}`)}>
            <Highlight language={language}>
                {children}
            </Highlight>

            <Copy
                className={css.copy}
                copyText={children}
                successMessage={t('snippetIsCopied')}
            />
        </div>
    );
};

export default CodeViewer;
