// @flow
import React, {useEffect, useRef, useState, Fragment} from 'react';
import cn from 'classnames';
import pick from 'lodash/pick';
import isEqual from 'lodash/isEqual';
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
    className?: string,
    file: FileListItem | UploadedFileListItem,
    onDelete?: Function,
}

const FileItem = ({file, onDelete, disabled, className}: FileItemProps) => {
    return (
        <div className={cn(css.file, className)}>
            <div className={css.fileTop}>
                <span className="mdi mdi-file" />
                <span className={css.fileName}>{file['file_name']}</span>
                <span className={css.fileSize}>{formatBytes(file.length)}</span>

                {onDelete && (
                    <button
                        disabled={disabled}
                        className={css.fileRemove}
                        onClick={() => onDelete(file.id)}
                    >
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
        // if (!isEqual(value, files)
        //     && onChange
        //     && uploadedFiles.length === 0
        //     && isDidMount.current
        // )
        //     onChange(value);
    }, [value]);

    useEffect(() => {
        if (isDidMount.current) {
            if (selectedFiles?.length) {
                Promise.all(selectedFiles.map(submit))
                    .then(() => {
                        setValue(value => {
                            onChange(value);
                            return value;
                        });
                    });

                setSelectedFiles([]);
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
        setValue(prevState => {
            const state = prevState.filter(f => f.id !== id);

            if (onChange)
                onChange(state);

            return state;
        });
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
        return new Promise(async resolve => {
            try {
                const cancelTokenSource = axios.CancelToken.source();
                const response = await upload({file});

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
                    try {
                        await axios.put(
                            response['upload_url'],
                            file,
                            {
                                cancelToken: cancelTokenSource.token,
                                headers: {'Content-Type': 'application/octet-stream'},

                                onUploadProgress: progressEvent => {
                                    const percentCompleted = Math.round(
                                        (progressEvent.loaded * 100) / progressEvent.total
                                    );

                                    setUploadedFiles(prevUploadedFiles => {
                                        const newState = [...prevUploadedFiles];
                                        const index = newState.findIndex(i => i.id === response.id);
                                        const file = newState[index];


                                        if (file)
                                            if (percentCompleted < 100)
                                                file.progress = percentCompleted;
                                            else {
                                                setValue(prevValue => {
                                                    const newState = prevValue
                                                        .concat(pick(
                                                            file,
                                                            ['id', 'file_name', 'length', 'created_date'],
                                                        ));

                                                    resolve(newState);
                                                    return newState;
                                                });

                                                prevUploadedFiles.splice(index, 1);
                                                return prevUploadedFiles;
                                            }

                                        return newState;
                                    });
                                },
                            }
                        );
                    } catch {
                        resolve();
                    }
                } else {
                    setUploadedFiles(prevState => {
                        const file = prevState.find(i => i.id === response.id);

                        setValue(prevValue => {
                            const newState = prevValue
                                .concat(pick(file, ['id', 'file_name', 'length', 'created_date']));

                            resolve(newState);
                            return newState;
                        });

                        return prevState.filter(f => f.id !== file.id);
                    });
                }
            } catch {
                resolve();
            }
        });
    };

    const renderItem = ({onDelete, ...fileItem}) => (
        <FileItem
            disabled={disabled}
            key={fileItem.id}
            file={fileItem}
            onDelete={onDelete}
        />
    );

    const allFiles = [
        ...value.map(i => {
            i.onDelete = removeFile;

            return i;
        }),
        ...uploadedFiles.map(i => {
            i.onDelete = cancelUploadFile;
            return i;
        }),
    ];

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

                {Boolean(allFiles.length) && (
                    <Fragment className={css.files}>
                        {allFiles.map(renderItem)}
                    </Fragment>
                )}
            </div>

            {hasErrors && <div className={css.error}>{errors.join(', ')}</div>}
        </div>
    );
};

export default FileField;