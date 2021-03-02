// @flow
import React from 'react';
import cn from 'classnames';
import {useTranslation} from 'react-i18next';
import StackView from 'components/stack/Attachment/View';
import {ReactComponent as GraphIcon} from './assets/graph.svg';
import type {TView} from '../types';

import css from './styles.module.css';

type Props = {
    className?: string,
    view: TView,
    disabled?: boolean,
}

const OutputView = ({className, view, disabled}: Props) => {
    const {t} = useTranslation();

    return (
        <div className={cn(css.outputView, className)}>
            {view.label && <div className={css.label}>{view.label}</div>}

            {!view?.data && disabled && (
                <div className={css.loader} />
            )}

            {!view?.data && !disabled && (
                <div className={css.empty}>
                    <GraphIcon />
                    <div className={css.emptyLabel}>{t('noDataYet')}</div>
                </div>
            )}

            {view?.data && (
                <StackView
                    className={css.view}
                    id={view.id}
                    attachment={view}
                />
            )}
        </div>
    );
};

export default OutputView;