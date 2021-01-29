// @flow
import React, {useEffect, useRef, useState, forwardRef, useImperativeHandle} from 'react';
import cx from 'classnames';
import {useTranslation} from 'react-i18next';
import {formatBytes, checkAvailableExtension} from 'utils';
import Button from 'components/Button';
import css from './style.module.css';

type Props = {
    formats?: Array<string>,
    className?: string,
    loading?: boolean,
    progressPercent?: ?number,
    onChange?: Function,
}

const FileDragnDrop = ({
    formats,
    className,
    loading,
    progressPercent = null,
    onChange,
}: Props, ref) => {
    const {t} = useTranslation();
    const inputRef = useRef(null);
    const [active, setActive] = useState(false);
    const [selectedFile, setSelectedFile] = useState();
    const isDidMount = useRef(true);

    useImperativeHandle(ref, () => ({clear: () => removeFile()}));

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

        if (file && checkAvailableExtension(file, formats))
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

        if (file && checkAvailableExtension(file, formats))
            setSelectedFile(file);
    };

    const removeFile = () => {
        setSelectedFile(null);
    };

    if (loading)
        return (
            <div className={cx(css.dnd, className, {active})}>
                <div className={css.loading}>
                    {t('Uploading')}&hellip;
                    {typeof progressPercent === 'number' && `${progressPercent}%`}
                </div>

                {typeof progressPercent === 'number' &&  (
                    <div className={css.progressBar}>
                        <div className={css.progress} style={{width: `${progressPercent}%`}} />
                    </div>
                )}
            </div>
        );

    if (selectedFile)
        return (
            <div className={cx(css.fileWrapper, className)}>
                <div className={css.file}>
                    <div className={css.fileExtend}>
                        {selectedFile.name.split('.').pop()}
                    </div>

                    <div className={css.fileSection}>
                        <div className={css.fileName}>{selectedFile.name}</div>
                        <div className={css.fileSize}>{formatBytes(selectedFile.size)}</div>
                    </div>

                    <div onClick={removeFile} className={cx(css.fileRemove, 'mdi mdi-close')} />
                </div>
            </div>
        );


    return (
        <div
            className={cx(css.dnd, className, {active})}
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
                {''}
                {Boolean(formats) && `(${formats.join(', ')})`}
                {' '}
                {t('or')}
                {' '}
            </div>

            <Button
                className={css.button}
                variant="contained"
                color="primary"
                size="small"
                onClick={onClick}
            >
                {t('chooseAFile')}
            </Button>
        </div>
    );
};

export default forwardRef(FileDragnDrop);
