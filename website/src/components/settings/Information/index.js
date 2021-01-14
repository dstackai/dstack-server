import React, {Fragment, useState} from 'react';
import {useTranslation} from 'react-i18next';
import cx from 'classnames';
import Button from 'components/Button';
import Modal from 'components/Modal';
import css from './style.module.css';

type Props = {
    className?: string,
    renderModalContent?: Function,
}

const SettingsInformation = ({className, renderModalContent}: Props) => {
    const {t} = useTranslation();
    const [isShowModal, setIsShowModal] = useState(false);

    const toggleModal = () => setIsShowModal(value => !value);

    return (
        <Fragment>
            <Button
                className={cx(css.infoButton, className)}
                size="small"
                color="secondary"
                onClick={toggleModal}
            >
                <span className="mdi mdi-information-outline" />
            </Button>

            {renderModalContent && (
                <Modal
                    withCloseButton
                    title={t('howToConnectYourDataWithDStack')}
                    isShow={isShowModal}
                    size="big"
                    onClose={toggleModal}
                >
                    {renderModalContent()}
                </Modal>
            )}
        </Fragment>
    );
};

export default SettingsInformation;
