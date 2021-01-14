// @flow
import React, {useState, useRef} from 'react';
import cx from 'classnames';
import {useTranslation} from 'react-i18next';
import moment from 'moment';
import useOnClickOutside from 'hooks/useOnClickOutside';
import Button from 'components/Button';
import Modal from 'components/Modal';
import Tooltip from 'components/Tooltip';
import css from './styles.module.css';

type Props = {
    revision: string;
    className?: string,
    frame: string,
    frames: Array<{}>,
    headId: ?string,
    onChange?: Function,
    onMarkAsHead?: Function,
};

const getFrameName = frame => moment(frame.timestamp).format('D MMM YYYY h:mm a');

const Frames = ({frame, frames, headId, onChange, onMarkAsHead, className}: Props) => {
    const {t} = useTranslation();
    const [isShowDropdown, setIsShowDropdown] = useState(false);
    const toggleDropdown = () => setIsShowDropdown(!isShowDropdown);
    const [frameForMarkingAsHead, setFrameForMarkingAsHead] = useState(null);
    const dropdownRef = useRef(null);

    useOnClickOutside(dropdownRef, () => isShowDropdown && toggleDropdown());

    if (!frames.length)
        return null;

    const activeFrame = frames.find(f => f.id === frame);

    const onClickItem = frameId => () => {
        toggleDropdown();

        if (frame !== frameId && onChange)
            onChange(frameId);
    };

    const onClickMarkAsHead = frameId => event => {
        event.stopPropagation();
        setFrameForMarkingAsHead(frameId);
        toggleDropdown();
    };

    const hideConfirmation = () => setFrameForMarkingAsHead(null);

    const confirmMarkFrameAsHead = () => {
        if (onMarkAsHead)
            onMarkAsHead(frameForMarkingAsHead.id);

        setFrameForMarkingAsHead(null);
    };

    if (!activeFrame) {
        return null;
    }

    return (
        <div className={cx(css.frames, className)} ref={dropdownRef}>
            <div
                className={cx(css['frames-dropdown'])}
                ref={dropdownRef}
            >
                <div className={css.button} onClick={toggleDropdown}>
                    <span className={css.name}>
                        {getFrameName(activeFrame)}
                    </span>

                    {headId === activeFrame.id && <span className={css.label}>{t('head')}</span>}
                    <span className="mdi mdi-chevron-down" />
                </div>

                <div className={cx(css.dropdown, {show: isShowDropdown})}>
                    {frames.map(f => (
                        <Tooltip
                            key={f.id}
                            placement="rightTop"
                            trigger={Boolean(f.description) ? ['hover'] : []}
                            align={{offset: [-20, -20]}}
                            onClick={onClickItem(f.id)}
                            overlayContent={f.description}
                        >
                            <div
                                className={css.item}
                            >
                                <span className={css.name}>
                                    {getFrameName(f)}
                                </span>

                                {headId === f.id && <span className={css.label}>{t('head')}</span>}

                                {headId !== f.id && <div
                                    className={css.mark}
                                    onClick={onClickMarkAsHead(f)}
                                >{t('markAsHead')}</div>}
                            </div>
                        </Tooltip>
                    ))}
                </div>
            </div>

            {activeFrame && activeFrame.description && (
                <Tooltip overlayContent={activeFrame.description}>
                    <div className={cx(css.info)}>
                        <span className="mdi mdi-information-variant" />
                    </div>
                </Tooltip>
            )}

            <Modal
                isShow={Boolean(frameForMarkingAsHead)}
                onClose={hideConfirmation}
                size="confirmation"
                title={t('changeHeadRevision')}
                className={css.modal}
            >
                <div className={css.description}>
                    {t(
                        'areYouSureYouWantToChangeTheCurrentHeadRevisionToByName',
                        {frame: frameForMarkingAsHead && getFrameName(frameForMarkingAsHead)},
                    )}
                </div>

                <div className={css.buttons}>
                    <Button
                        variant="contained"
                        color="primary"
                        onClick={confirmMarkFrameAsHead}
                        className={css.button}
                    >{t('yesChangeHead')}</Button>

                    <Button
                        color="secondary"
                        variant="contained"
                        onClick={hideConfirmation}
                        className={css.button}
                    >{t('cancel')}</Button>
                </div>
            </Modal>
        </div>
    );
};

export default Frames;
