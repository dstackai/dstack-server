import React, {useEffect, useState, useRef} from 'react';
import {useTranslation, Trans} from 'react-i18next';
import get from 'lodash/get';
import ReactMarkdown from 'react-markdown';
import cn from 'classnames';
import Button from 'components/Button';
import TextAreaField from 'components/TextAreaField';
import {useAppStore} from 'AppStore';
import getStackCategory from 'utils/getStackCategory';
import css from './styles.module.css';

const EmptyMessage = ({onAdd}) => {
    return (
        <Trans i18nKey="readmeEmptyMessage">
            Sure your ML model is easy to understand without README? If no, please, <a
                href="#"
                onClick={onAdd}
            >add some helpful information</a> about how to use the model.
        </Trans>
    );
};

const Readme = ({className, data, onUpdate}) => {
    const [{currentUser}] = useAppStore();
    const currentUserName = currentUser.data?.user;

    const category = getStackCategory({
        application: get(data, 'head.attachments[0].application'),
        contentType: get(data, 'head.attachments[0].content_type'),
    });

    const {t} = useTranslation();
    const textareaRef = useRef(null);
    const [value, setValue] = useState(data.readme);
    const [isEdit, setIsEdit] = useState(false);

    useEffect(() => {
        if (isEdit && textareaRef?.current) {
            textareaRef.current.focus();

            if (textareaRef.current.setSelectionRange)
                textareaRef.current.setSelectionRange(
                    textareaRef.current.value.length,
                    textareaRef.current.value.length
                );

            textareaRef.current.scrollTop = textareaRef.current.scrollHeight;
        }
    }, [isEdit]);

    const edit = () => setIsEdit(true);

    const cancel = () => {
        setIsEdit(false);
        setValue(data.readme);
    };

    const save = () => {
        onUpdate(value);
        setIsEdit(false);
    };

    const onAddReadme = event => {
        event.preventDefault();
        edit();
    };

    const onChange = event => {
        setValue(event.target.value);
    };

    if ((!data?.readme && data.user !== currentUserName) || category !== 'mlModel')
        return null;

    return (
        <div>
            <div className={cn(css.readme, className)}>
                <div className={css.container}>
                    <div className={css.header}>
                        <div className={css.title}>
                            {t('readme')}
                        </div>

                        {data.user === currentUserName && !isEdit && (
                            <Button
                                color={'secondary'}
                                className={css.edit}
                                onClick={edit}
                            >
                                <span className={'mdi mdi-pencil'} />
                            </Button>
                        )}
                    </div>

                    <div className={css.content}>
                        {!isEdit && !data.readme && <div className={css.emptyMessage}>
                            <EmptyMessage
                                onAdd={onAddReadme}
                            />
                        </div>}

                        {isEdit && (
                            <TextAreaField
                                ref={textareaRef}
                                onChange={onChange}
                                className={css.field}
                                value={value}
                            />
                        )}

                        {!isEdit && data.readme && (
                            <div
                                className={css.preview}
                            >
                                <ReactMarkdown>
                                    {data.readme}
                                </ReactMarkdown>
                            </div>
                        )}
                    </div>
                </div>

                {isEdit && <div className={css.help}>{' **Strong** # Title `code` - List'}</div>}

                {isEdit && (
                    <div className={css.buttons}>
                        <Button
                            size="small"
                            variant="contained"
                            color="secondary"
                            onClick={cancel}
                            className={css.button}
                        >{t('cancel')}</Button>

                        <Button
                            size="small"
                            color="primary"
                            variant="contained"
                            onClick={save}
                            className={css.button}
                        >{t('save')}</Button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Readme;
