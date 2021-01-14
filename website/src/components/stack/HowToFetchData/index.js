// @flow

import React, {useState} from 'react';
import {useTranslation} from 'react-i18next';
import CodeViewer from 'components/CodeViewer';
import {isString} from 'lodash-es';
import config from 'config';
import css from './styles.module.css';

export const pullPythonCode = data => {
    let a = [`\'/${data.stack}\'`];

    let params = Object.keys(data.params);

    if (params.length > 0) {
        let p = [];

        params.forEach(key => {
            if (isString(data.params[key]))
                p.push(`\'${key}\': \'${data.params[key]}\'`);
            else
                p.push(`\'${key}\': ${data.params[key]}`);
        });
        a.push('params={' + p.join(', ') + '}');
    }

    return `import dstack as ds

df = ds.pull(${a.join(', ')})`;
};

export const pullRCode = data => {
    let a = [`\"/${data.stack}\"`];

    let params = Object.keys(data.params);

    if (params.length > 0) {
        params.forEach(key => {
            if (isString(data.params[key]))
                a.push(`\"${key}\" = \"${data.params[key]}\"`);
            else
                a.push(`\"${key}\" = ${data.params[key]}`);
        });
    }

    return `library(dstack)

df <- read.csv(pull(${a.join(', ')}))`;
};

type Props = {
    configurePythonCommand: string,
    modalMode?: boolean,
}

const HowTo = ({modalMode, data, configurePythonCommand}: Props) => {
    const {t} = useTranslation();

    return (
        <div className={css.howto}>
            {!modalMode && (
                <div className={css.title}>{t('howToFetchDataUsingTheAPI')}</div>
            )}

            <div>
                <div className={css.description}>{t('installPipPackage')}</div>

                <CodeViewer
                    className={css.code}
                    language="bash"
                >
                    pip install dstack
                </CodeViewer>

                <div className={css.description}>{t('configureDStack')}</div>

                <CodeViewer
                    className={css.code}
                    language="bash"
                >
                    {configurePythonCommand}
                </CodeViewer>

                <div className={css.description}>{t('pullDatasetIntro')}</div>

                <CodeViewer
                    className={css.code}
                    language="python"
                >
                    {pullPythonCode(data)}
                </CodeViewer>
            </div>

            <div
                className={css.footer}
                dangerouslySetInnerHTML={{__html: t('notClearCheckTheDocks_2', {href: config.DOCS_URL})}}
            />
        </div>
    );
};

export default HowTo;
