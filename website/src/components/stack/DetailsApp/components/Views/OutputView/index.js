// @flow
import React from 'react';
import StackView from 'components/stack/Attachment/View';
import type {TView} from '../types';

type Props = {
    className?: string,
    view: TView,
    disabled?: boolean,
}

const OutputView = ({className, view}: Props) => {
    // TODO исправить имя стека

    return (
        <StackView
            className={className}
            frameId={''}
            attachment={view}
            stack={''}
        />
    );
};

export default OutputView;