// @flow

import React, {useEffect} from 'react';
import {useTranslation} from 'react-i18next';
import Prism from 'prismjs';
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

    useEffect(() => {
        Prism.highlightAll();
    }, []);

    return (
        <div className={cx(css.code, className, fontSize && `font-size-${fontSize}`)}>
            <pre>
                <code className={`language-${language}`}>{children}</code>
            </pre>

            <Copy
                className={css.copy}
                copyText={children}
                successMessage={t('snippetIsCopied')}
            />
        </div>
    );
};

export default CodeViewer;
