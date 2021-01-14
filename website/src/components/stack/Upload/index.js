// @flow
import React, {Fragment, useEffect, useRef, useState} from 'react';
import {v4} from 'uuid';
import axios from 'axios';
import {useTranslation} from 'react-i18next';
import cx from 'classnames';
import Button from 'components/Button';
import Modal from 'components/Modal';
import Tooltip from 'components/Tooltip';
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
    onClose?: Function,
    isShow?: Function,
    apiUrl: string,
    user: string,
};

const MB = 1048576;

const Upload = ({stack, className, isShow, onClose, refresh, withButton, apiUrl, user}: Props) => {
    const {t} = useTranslation();
    const [isShowModal, setIsShowModal] = useState(false);
    const [uploading, setUploading] = useState(null);
    const [progress, setProgress] = useState(null);
    const [file, setFile] = useState(null);
    const isDidMount = useRef(true);

    const {form, onChange, formErrors, checkValidForm} = useForm(
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

    useEffect(() => {
        if (isShow !== undefined)
            setIsShowModal(isShow);
    }, [isShow]);

    const toggleModal = () => setIsShowModal(!isShowModal);

    const closeHandle = () => {
        if (onClose)
            onClose();
        else
            setIsShowModal(false);
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
            closeHandle();

            if (refresh)
                refresh();
        } catch (e) {
            closeHandle();
        }
    };

    return (
        <Fragment>
            {withButton && <Tooltip
                overlayContent={t('uploadTooltip')}
            >
                <Button
                    className={cx(css.upload, className)}
                    size="small"
                    color="secondary"
                    onClick={toggleModal}
                >
                    {t('upload')}
                </Button>
            </Tooltip>}

            <Modal
                title={t('uploadFile')}
                isShow={isShowModal}
                size="small"
            >
                <div className={css.content}>
                    {!stack && (
                        <Fragment>
                            <div className={css.subtitle}>{t('theUploadedFileWouldBeSavedAsANewStack')}</div>

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
                        className={css.dragndrop}
                        formats={['.csv', '.png', '.svg', '.jpg']}
                        onChange={setFile}
                        loading={uploading}
                        progressPercent={progress}
                    />
                </div>

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
                        onClick={closeHandle}
                        className={css.button}
                        variant="contained"
                        color="secondary"
                        disabled={uploading}
                    >
                        {t('cancel')}
                    </Button>
                </div>
            </Modal>
        </Fragment>
    );
};

export default Upload;
