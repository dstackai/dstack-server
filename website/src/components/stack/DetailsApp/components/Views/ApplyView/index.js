import React from 'react';
import {useTranslation} from 'react-i18next';
import Button from 'components/Button';

import type {TView} from '../types';

type Props = {
    className?: string,
    view: TView,
    disabled?: boolean,
    onApply?: Function,
}

const ApplyView = ({className, view, disabled, onApply}: Props) => {
    const {t} = useTranslation();

    return (
        <Button
            size="small"
            color="primary"
            variant="contained"
            onClick={onApply}
            disabled={disabled || !view.enabled}
            className={className}
        >
            {t('apply')}
        </Button>
    );
};

export default ApplyView;