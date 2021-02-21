import React from 'react';
import {useTranslation} from 'react-i18next';
import Button from 'components/Button';

import type {TView} from '../types';

type Props = {
    className?: string,
    view: TView,
    disabled?: boolean,
    onApplyClick?: Function,
}

const ApplyView = ({className, view, disabled, onApplyClick}: Props) => {
    const {t} = useTranslation();

    return (
        <Button
            size="small"
            color="primary"
            variant="contained"
            onClick={onApplyClick}
            disabled={disabled || !view.enabled}
            className={className}
        >
            {t('apply')}
        </Button>
    );
};

export default ApplyView;