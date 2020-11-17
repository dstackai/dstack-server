// @flow

import React, {useState} from 'react';
import {useTranslation} from 'react-i18next';
import CodeViewer from '../../CodeViewer';
import Tabs from '../../Tabs';
import Upload from './Upload';
import css from './styles.module.css';
import config from '../../config';
import {reportPlotPythonCode, installRPackageCode, reportPlotRCode} from '../../config';

type Props = {
    user?: string,
    refresh?: Function,
    apiUrl: string,
    withFileUpload?: boolean,
}

const UploadStack = ({
    user,
    refresh,
    apiUrl,
    configurePythonCommand,
    configureRCommand,
    withFileUpload,
}: Props) => {
    const {t} = useTranslation();
    const [activeCodeTab, setActiveCodeTab] = useState(1);
    const [activePlatformTab, setActivePlatformTab] = useState(1);

    const tabs = [
        {
            label: t('python'),
            value: 1,
        },
    ];

    if (withFileUpload)
        tabs.push({
            label: t('upload'),
            value: 3,
        });

    return (
        <div className={css.howto}>
            <Tabs
                className={css.tabs}
                value={activeCodeTab}
                onChange={setActiveCodeTab}
                tabs={tabs}
            />

            {activeCodeTab === 1 && <div>
                <div className={css.description}>{t('installPipPackage')}</div>

                <Tabs
                    className={css.tabs}
                    value={activePlatformTab}
                    onChange={setActivePlatformTab}

                    tabs={[
                        {
                            label: t('pip'),
                            value: 1,
                        },
                    ]}
                />

                {activePlatformTab === 1 && <CodeViewer
                    className={css.code}
                    language="bash"
                >
                    pip install dstack
                </CodeViewer>}

                <div className={css.description}>{t('configureDStack')}</div>

                <CodeViewer
                    className={css.code}
                    language="bash"
                >
                    {configurePythonCommand}
                </CodeViewer>

                <div className={css.description}>{t('reportPlotIntro')}</div>

                <CodeViewer
                    className={css.code}
                    language="python"
                >
                    {reportPlotPythonCode}
                </CodeViewer>
            </div>}

            {activeCodeTab === 3 && <Upload
                user={user}
                refresh={refresh}
                apiUrl={apiUrl}
            />}

            <div
                className={css.footer}
                dangerouslySetInnerHTML={{__html: t('notClearCheckTheDocks', {href: config.DOCS_URL})}}
            />
        </div>
    );
};

export default UploadStack;
