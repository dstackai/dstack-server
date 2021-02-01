// @flow
import React, {useEffect, useRef, useState, Fragment} from 'react';
import cn from 'classnames';
import {pick, isEqual} from 'lodash-es';
import axios from 'axios';
import {useTranslation} from 'react-i18next';
import {formatBytes, checkAvailableExtension} from 'utils';
import Button from 'components/Button';
import actions from './actions';
import css from './style.module.css';

type FileListItem = {
    id: string,
    "file_name": string,
    "length": number,
    "created_date": string,
}

type Props = {
    files?: Array<FileListItem>,
    formats?: Array<string>,
    className?: string,
    onChange?: Function,
    size?: 'normal' | 'middle' | 'small',
    label?: string,
    errors?: Array<string>,
    appearance?: 'normal' | 'compact',
    multiple?: Boolean,
}

type UploadedFileListItem = {
    ...FileListItem,
    progress: ?number,
}

type FileItemProps = {
    file: FileListItem | UploadedFileListItem,
    onDelete?: Function,
}

const FileItem = ({file, onDelete}: FileItemProps) => {
    return (
        <div className={css.file}>
            <div className={css.fileTop}>
                <span className="mdi mdi-file" />
                <span className={css.fileName}>{file['file_name']}</span>
                <span className={css.fileSize}>{formatBytes(file.length)}</span>

                {onDelete && (
                    <button className={css.fileRemove} onClick={() => onDelete(file.id)}>
                        <span className="mdi mdi-close" />
                    </button>
                )}
            </div>

            {Boolean(file.progress) && (
                <div className={css.fileBar}>
                    <div className={css.fileProgress} style={{width: `${file.progress}%`}} />
                </div>
            )}
        </div>
    );
};

const FileField = ({
    className,
    files = [],
    onChange,
    size = 'normal',
    label,
    errors = [],
    disabled,
    formats,
    multiple,
    appearance = 'normal',
}: Props) => {
    const {t} = useTranslation();
    const inputRef = useRef(null);
    const [active, setActive] = useState(false);
    const isDidMount = useRef(false);
    const [selectedFiles, setSelectedFiles] = useState([]);
    const [value, setValue] = useState(files);
    const [uploadedFiles, setUploadedFiles] = useState([]);
    const hasErrors = Boolean(errors.length);

    const {upload} = actions();

    useEffect(() => {
        if (!isEqual(value, files) && isDidMount.current)
            setValue(files);
    }, [files]);

    useEffect(() => {
        if (!isEqual(value, files) && onChange && uploadedFiles.length === 0 && isDidMount.current)
            onChange(value);
    }, [value]);

    useEffect(() => {
        if (isDidMount.current) {
            if (selectedFiles) {
                selectedFiles.forEach(submit);
            }
        } else
            isDidMount.current = true;
    }, [selectedFiles]);

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

        const files = Array.from(event.dataTransfer.files);

        if (!multiple)
            files.splice(1, files.length - 1);

        if (files && files.length)
            setSelectedFiles(files.filter(file => checkAvailableExtension(file, formats)));
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
        const files = Array.from(event.target.files);

        if (files && files.length)
            setSelectedFiles(files.filter(file => checkAvailableExtension(file, formats)));
    };

    const removeFile = (id: string) => {
        setValue(prevState => prevState.filter(f => f.id !== id));
    };

    const cancelUploadFile = (id: string) => {
        setUploadedFiles(prevState => prevState.filter(f => {
            if (f.id === id) {
                f.cancelTokenSource.cancel();
                return false;
            }

            return true;
        }));
    };

    const submit = async (file: File) => {
        const cancelTokenSource = axios.CancelToken.source();
        const response = await  upload({file});

        setUploadedFiles(prevState => {
            return [
                ...prevState,
                {
                    ...response,
                    progress: 0,
                    cancelTokenSource,
                },
            ];
        });

        if (response['upload_url']) {
            await axios.put(
                response['upload_url'],
                file,
                {
                    cancelToken: cancelTokenSource.token,
                    headers: {'Content-Type': 'application/octet-stream'},

                    onUploadProgress: progressEvent => {
                        const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);

                        setUploadedFiles(prevState => {
                            const newState = [...prevState];
                            const file = newState.find(i => i.id === response.id);


                            if (file)
                                if (percentCompleted < 100)
                                    file.progress = percentCompleted;
                                else {
                                    setValue(prevValue => {
                                        return prevValue
                                            .concat(pick(file, ['id', 'file_name', 'length', 'created_date']));
                                    });

                                    return prevState.filter(f => f.id !== file.id);
                                }

                            return newState;
                        });
                    },
                }
            );
        } else {
            setUploadedFiles(prevState => {
                const file = prevState.find(i => i.id === response.id);

                setValue(prevValue => {
                    return prevValue
                        .concat(pick(file, ['id', 'file_name', 'length', 'created_date']));
                });

                return prevState.filter(f => f.id !== file.id);
            });
        }
    };

    return (
        <div className={cn(css.field, className, size, `appearance-${appearance}`, {active, disabled})}>
            {label && <div className={css.label}>{label}</div>}

            <div className={css.section}>
                <div
                    className={cn(css.input, {
                        error: hasErrors,
                        disabled: !multiple && (uploadedFiles.length || value.length),
                    })}
                    onDrop={onDrop}
                    onDragEnter={onDragEnter}
                    onDragOver={onDragEnter}
                    onDragLeave={onDragLeave}
                >
                    <input
                        ref={inputRef}
                        onChange={onChangeInput}
                        type="file"
                        multiple={multiple}
                    />

                    {appearance !== 'compact' && (
                        <Fragment>
                            <div className={css.placeholder}>
                                {t('dragHereAFile')}
                                {' '}
                                {t('or')}
                            </div>
                            {' '}
                        </Fragment>
                    )}
                    <Button
                        className={css.button}
                        color="primary"
                        size="small"
                        onClick={onClick}
                    >
                        {t('uploadFile')}
                    </Button>
                </div>

                <div className={css.files}>
                    {value.map(fileItem => (
                        <FileItem key={fileItem.id} file={fileItem} onDelete={removeFile} />
                    ))}

                    {uploadedFiles.map(fileItem => (
                        <FileItem key={fileItem.id} file={fileItem} onDelete={cancelUploadFile} />
                    ))}
                </div>
            </div>

            {hasErrors && <div className={css.error}>{errors.join(', ')}</div>}
        </div>
    );
};

export default FileField;