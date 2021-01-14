import React from 'react';
import cn from 'classnames';
import {useTranslation} from 'react-i18next';
import Modal from 'components/Modal';
import TextField from 'components/TextField';
import Copy from 'components/Copy';
import css from './styles.module.css';

const LinkModal = ({isShow, link, refresh, onClose}) => {
    const {t} = useTranslation();
    
    return (
        <Modal
            title={t('copyTheLinkAndSendItToTheUser')}
            size="small"
            isShow={isShow}
            onClose={onClose}
            withCloseButton
            dialogClassName={css.dialog}
            titleClassName={css.title}
        >
            <div className={css.fieldWrap}>
                <TextField
                    size="middle"
                    className={css.field}
                    readOnly
                    value={link}
                />

                {refresh && (
                    <div
                        className={css.refresh}
                        onClick={refresh}
                    >
                        <span className={cn(css.icon, 'mdi mdi-refresh')} />
                    </div>
                )}

                <Copy
                    className={css.copy}
                    buttonTitle={null}
                    copyText={link}
                />
            </div>
        </Modal>
    );
};

export default LinkModal;