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
    // TODO исправить имя стека

    return (
        <div className={cn(css.outputView, className)}>
            {view.label && <div className={css.label}>{view.label}</div>}

            <StackView
                className={css.view}
                frameId={''}
                attachment={view}
                stack={''}
            />
        </div>
    );
};

export default OutputView;