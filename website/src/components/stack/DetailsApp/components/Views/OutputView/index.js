// @flow
import React from 'react';
import cn from 'classnames';
import StackView from 'components/stack/Attachment/View';
import type {TView} from '../types';

import css from './styles.module.css';

type Props = {
    className?: string,
    view: TView,
    disabled?: boolean,
}

const OutputView = ({className, view}: Props) => {
    return (
        <div className={cn(css.outputView, className)}>
            {view.label && <div className={css.label}>{view.label}</div>}

            {!view?.data && (
                <div className={css.loader} />
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