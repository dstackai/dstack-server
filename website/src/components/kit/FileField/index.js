// @flow
import React, {useEffect, useRef, useState, forwardRef} from 'react';
import cn from 'classnames';
import {useTranslation} from 'react-i18next';
// import {formatBytes} from 'utils';
import Button from 'components/Button';
import css from './style.module.css';

type Props = {
    formats?: Array<string>,
    className?: string,
    loading?: boolean,
    progressPercent?: ?number,
    onChange?: Function,
    size?: 'normal' | 'middle' | 'small',
    label?: string,
    errors?: Array<string>,
}

const FileField = ({
    // formats,
    className,
    // loading,
    // progressPercent = null,
    onChange,
    size = 'normal',
    label,
    errors = [],
    disabled,
}: Props,
    // ref,
) => {
    const {t} = useTranslation();
    const inputRef = useRef(null);
    const [active, setActive] = useState(false);
    const [selectedFile, setSelectedFile] = useState();
    const isDidMount = useRef(true);
    const hasErrors = Boolean(errors.length);

    // useImperativeHandle(ref, () => ({clear: () => removeFile()}));

    useEffect(() => {
        if (!isDidMount.current) {
            if (onChange)
                onChange(selectedFile);
        } else
            isDidMount.current = false;
    }, [selectedFile]);

    const onClick = event => {
        event.preventDefault();

        if (inputRef.current)
            inputRef.current.click();
    };

    const preventStop = event => {
        event.preventDefault();
        event.stopPropagation();
    };

    const onDrop = event => {
        preventStop(event);
        setActive(false);

        const [file] = event.dataTransfer.files;

        // if (file && checkAvailableExtension(file))
        //     setSelectedFile(file);

        setSelectedFile(file);
    };

    const onDragEnter = event => {
        preventStop(event);
        setActive(true);

    };

    const onDragLeave = event => {
        preventStop(event);
        setActive(false);
    };

    const onChangeInput = event => {
        const [file] = event.target.files;

        // if (file && checkAvailableExtension(file))
        //     setSelectedFile(file);

        setSelectedFile(file);
    };

    // const removeFile = () => {
    //     setSelectedFile(null);
    // };

    // const checkAvailableExtension = file => {
    //     const ext = '.' + file.name.split('.').pop();
    //
    //     let isAvailable;
    //
    //     if (formats && formats.length)
    //         isAvailable = formats.some(format => {
    //             if (format === '.jpg' || format === '.jpeg')
    //                 return ext === '.jpg' || ext === '.jpeg';
    //             else
    //                 return format === ext;
    //         });
    //     else
    //         isAvailable = true;
    //
    //     return isAvailable;
    // };

    // const submit = async () => {
    //     setProgress(null);
    //     setUploading(true);
    //
    //     const params = {
    //         type: file.type,
    //         timestamp: Date.now(),
    //         id: v4(),
    //         stack: `${user}/${form.stack}`,
    //         size: file.size,
    //     };
    //
    //     if (file.size > MB)
    //         params.attachments = [{length: file.size}];
    //     else
    //         params.attachments = [{data: await fileToBaseTo64(file)}];
    //
    //     try {
    //         const token = localStorage.getItem(config.TOKEN_STORAGE_KEY);
    //
    //         const {data} = await axios({
    //             method: 'post',
    //             headers: {Authorization: token ? `Bearer ${token}` : ''},
    //             baseURL: apiUrl,
    //             url: config.STACK_PUSH,
    //             data: params,
    //         });
    //
    //         if (data.attachments && data.attachments.length) {
    //             const [attachment] = data.attachments;
    //
    //             if (attachment['upload_url']) {
    //                 await axios.put(attachment['upload_url'], file, {
    //                     headers: {'Content-Type': 'application/octet-stream'},
    //
    //                     onUploadProgress: progressEvent => {
    //                         const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
    //
    //                         setProgress(percentCompleted);
    //                     },
    //                 });
    //             }
    //         }
    //
    //         setUploading(false);
    //         closeHandle();
    //
    //         if (refresh)
    //             refresh();
    //     } catch (e) {
    //         closeHandle();
    //     }
    // };

    return (
        <div className={cn(css.field, className, size, {active, disabled})}>
            {label && <div className={css.label}>{label}</div>}

            <div
                className={cn(css.input, {error: hasErrors})}
                onDrop={onDrop}
                onDragEnter={onDragEnter}
                onDragOver={onDragEnter}
                onDragLeave={onDragLeave}
            >
                <input
                    ref={inputRef}
                    onChange={onChangeInput}
                    type="file"
                />

                <div className={css.placeholder}>
                    {t('dragHereAFile')}
                    {' '}
                    {t('or')}
                </div>
                {' '}
                <Button
                    className={css.button}
                    color="primary"
                    size="small"
                    onClick={onClick}
                >
                    {t('uploadFile')}
                </Button>
            </div>

            {hasErrors && <div className={css.error}>{errors.join(', ')}</div>}
        </div>
    );
};

export default FileField;

export const FileFieldWithRef = forwardRef(FileField);