// @flow
import React, {useEffect, useRef} from 'react';
import {useTranslation} from 'react-i18next';
import cx from 'classnames';
import Editor from 'react-simple-code-editor';
import {highlight, languages} from 'prismjs/components/prism-core';
import 'prismjs/components/prism-python';
import 'prismjs/components/prism-r';
import 'prismjs/themes/prism.css';
import css from './styles.module.css';

type Props = {
    saved: boolean,
    value: string,
    className?: string,
    onChange: Function,
    language: 'python' | 'r',
}

const CodeEditor = ({value = '', onChange, language, className, saved}: Props) => {
    const {t} = useTranslation();
    const successMessageRef = useRef();
    const lines = (value.match(/\n/g) || []).length + 2;
    const lineNos = [...Array(lines).keys()].slice(1).join('\n');
    const isDidMount = useRef(true);

    useEffect(() => {
        if (successMessageRef.current && !isDidMount.current)
            if (saved) {
                successMessageRef.current.classList.add('show');

                setTimeout(() => {
                    if (successMessageRef.current)
                        successMessageRef.current.classList.remove('show');
                }, 4000);
            } else {
                successMessageRef.current.classList.remove('show');
            }

        if (isDidMount.current)
            isDidMount.current = false;
    }, [saved]);

    return (
        <div className={cx(css.editor, className)}>
            <div className={css.success} ref={successMessageRef}>
                {t('changesSaved')}
            </div>

            <div className={css.scroll}>
                <div className={css.content}>
                    <div className={css.lineNumbers} dangerouslySetInnerHTML={{__html: lineNos}} />

                    <Editor
                        value={value}
                        onValueChange={onChange}
                        highlight={code => highlight(code, languages[language])}
                        padding={6}

                        style={{
                            width: '100%',
                            fontFamily: '"Roboto Mono", monospace',
                            fontSize: 12,
                            lineHeight: '150%',
                            outline: 'none',
                        }}
                    />
                </div>
            </div>
        </div>
    );
};

export default CodeEditor;