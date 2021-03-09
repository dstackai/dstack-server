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

    const props = {
        size: 'small',
        className,
        onChange,
        label: view.label,
        name: view.id,
        value,
        disabled: (disabled && !isFocus) || !view.enabled,
        placeholder: view.placeholder,
        onFocus,
        onBlur,
    };

    if (!view.rowspan || view.rowspan < 2)
        return (
            <TextField
                {...props}
            />
        );
    else
        return (
            <TextAreaField
                {...props}
                style={{height: 'auto'}}
            />
        );
};

export default InputView;