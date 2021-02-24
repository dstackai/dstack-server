// @flow
import React, {useState} from 'react';
import {useDebounce} from 'hooks';
import TextField from 'components/TextField';
import TextAreaField from 'components/TextAreaField';

import type {TView} from '../types';

interface TInputView extends TView {
    data?: ?string,
}

type Props = {
    className?: string,
    view: TInputView,
    disabled?: boolean,
    onChange?: Function,
    debounce?: number,
}


const InputView = ({className, view, disabled, debounce = 300, onChange: onChangeProp}: Props) => {
    const [value, setValue] = useState(view.data || '');
    const [isFocus, setIsFocus] = useState(false);

    const onChangePropDebounce = useDebounce(onChangeProp, debounce, [debounce, onChangeProp]);

    const onChange = (event: Event<HTMLInputElement | HTMLTextAreaElement>) => {
        setValue(event.target.value);

        if (onChangeProp)
            onChangePropDebounce({
                ...view,
                data: event.target.value,
            });
    };

    const onFocus = () => setIsFocus(true);
    const onBlur = () => setIsFocus(false);

    if (!view.rowspan || view.rowspan < 2)
        return (
            <TextField
                size="small"
                className={className}
                onChange={onChange}
                label={view.label}
                name={view.id}
                value={value}
                disabled={(disabled && !isFocus) || !view.enabled}
                onFocus={onFocus}
                onBlur={onBlur}
            />
        );
    else
        return (
            <TextAreaField
                size="small"
                className={className}
                onChange={onChange}
                label={view.label}
                name={view.id}
                value={value}
                disabled={(disabled && !isFocus) || !view.enabled}
                onFocus={onFocus}
                onBlur={onBlur}
            />
        );
};

export default InputView;