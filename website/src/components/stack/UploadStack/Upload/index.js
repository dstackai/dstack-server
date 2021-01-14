// @flow
import React, {Fragment, useEffect, useRef, useState} from 'react';
import {v4} from 'uuid';
import axios from 'axios';
import cx from 'classnames';
import {useTranslation} from 'react-i18next';
import Button from 'components/Button';
import TextField from 'components/TextField';
import FileDragnDrop from 'components/FileDragnDrop';
import {fileToBaseTo64} from 'utils';
import useForm from 'hooks/useForm';
import useDebounce from 'hooks/useDebounce';
import config from 'config';
import css from './style.module.css';

type Props = {
    stack?: string,
    className?: string,
    refresh?: Function,
    apiUrl: string,
    user: string,
};

const MB = 1048576;

const Upload = ({stack, className, refresh, apiUrl, user}: Props) => {
    const {t} = useTranslation();
    const [uploading, setUploading] = useState(null);
    const [progress, setProgress] = useState(null);
    const [file, setFile] = useState(null);
    const isDidMount = useRef(true);
    const fileFieldRef = useRef(null);

    const {form, onChange, setForm, formErrors, checkValidForm} = useForm(
        {stack: stack || ''},
        {stack: ['required', 'no-spaces-stack', 'stack-name']}
    );

    const runValidation = useDebounce(checkValidForm);

    useEffect(() => {
        if (!isDidMount.current)
            runValidation();
        else
            isDidMount.current = false;
    }, [form.stack]);


    const clearForm = () => {
        setFile(null);
        setForm({stack: ''});

        if (fileFieldRef.current)
            fileFieldRef.current.clear();
    };

    const getErrorsText = fieldName => {
        if (formErrors[fieldName] && formErrors[fieldName].length)
            return [t(`formErrors.${formErrors[fieldName][0]}`)];
    };

    const submit = async () => {
        setProgress(null);
        setUploading(true);

        const params = {
            type: file.type,
            timestamp: Date.now(),
            id: v4(),
            stack: `${user}/${form.stack}`,
            size: file.size,
        };

        if (file.size > MB)
            params.attachments = [{length: file.size}];
        else
            params.attachments = [{data: await fileToBaseTo64(file)}];

        try {
            const token = localStorage.getItem(config.TOKEN_STORAGE_KEY);

            const {data} = await axios({
                method: 'post',
                headers: {Authorization: token ? `Bearer ${token}` : ''},
                baseURL: apiUrl,
                url: config.STACK_PUSH,
                data: params,
            });

            if (data.attachments && data.attachments.length) {
                const [attachment] = data.attachments;

                if (attachment['upload_url']) {
                    await axios.put(attachment['upload_url'], file, {
                        headers: {'Content-Type': 'application/octet-stream'},

                        onUploadProgress: progressEvent => {
                            const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);

                            setProgress(percentCompleted);
                        },
                    });
                }
            }

            setUploading(false);

            if (refresh)
                refresh();

            clearForm();
        } catch (e) {
            console.log(e);
            clearForm();
        }
    };

    return (
        <div className={cx(css.upload, className)}>
            <div className={css.content}>
                {!stack && (
                    <Fragment>
                        <div className={css.subtitle}>{t('stackName')}</div>

                        <TextField
                            size="middle"
                            className={css.field}
                            name="stack"
                            onChange={onChange}
                            value={form.value}
                            maxLength={30}
                            placeholder={`${t('stackName')}, ${t('noSpaces')}, ${t('maxSymbol', {count: 30})}`}
                            errors={getErrorsText('stack')}
                        />
                    </Fragment>
                )}

                {stack && file && (
                    <div className={css.subtitle}>{t('theUploadedFileWouldBeSavedAsANewRevisionOfTheStack')}</div>
                )}

                <FileDragnDrop
                    ref={fileFieldRef}
                    className={css.dragndrop}
                    formats={['.csv', '.png', '.svg', '.jpg']}
                    onChange={setFile}
                    loading={uploading}
                    progressPercent={progress}
                />
            </div>

            {file && (
                <div className={css.buttons}>
                    <Button
                        className={css.button}
                        variant="contained"
                        color="primary"
                        disabled={!file || !form.stack.length || uploading}
                        onClick={submit}
                    >
                        {t('save')}
                    </Button>

                    <Button
                        onClick={clearForm}
                        className={css.button}
                        variant="contained"
                        color="secondary"
                        disabled={uploading}
                    >
                        {t('cancel')}
                    </Button>
                </div>
            )}
        </div>
    );
};

export default Upload;
