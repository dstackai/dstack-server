// @flow
import React, {useEffect} from 'react';
import {useDebounce} from 'react-use';
import CheckboxField from 'components/CheckboxField';

import type {TView} from '../types';

interface TCheckboxView extends TView {
    selected?: boolean,
}

type Props = {
    className?: string,
    view: TCheckboxView,
    disabled?: boolean,
    onChange?: Function,
    debounce?: number,
}

const CheckboxView = ({className, view, disabled, debounce = 300, onChange: onChangeProp}: Props) => {
    const [value, setValue] = useEffect(Boolean(view.selected));

    useEffect(() => setValue(Boolean(view.selected)), [view]);

    const onChangePropDebounce = useDebounce(view => onChangeProp(view), debounce, [debounce, onChangeProp]);

    const onChange = (event: Event<HTMLInputElement>) => {
        setValue(!!event.target?.checked);

        if (onChangeProp)
            onChangePropDebounce({
                ...view,
                selected: !!event.target?.checked,
            });
    };

    return (
        <CheckboxField
            appearance="switcher"
            className={className}
            onChange={onChange}
            label={view.label}
            name={view.id}
            value={value}
            disabled={disabled || !view.enabled}
        />
    );
};

export default CheckboxView;