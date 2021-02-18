// @flow
import React, {useEffect, useState} from 'react';
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
}


const InputView = ({className, view, disabled, onChange: onChangeProp}: Props) => {
    const [value, setValue] = useState(view.data);

    const onChange = (event: Event<HTMLInputElement | HTMLTextAreaElement>) => {
        setValue(event.target.value);

        if (onChangeProp)
            onChangeProp({
                ...view,
                data: value,
            });
    };

    if (!view.rowspan || view.rowspan < 2)
        return (
            <TextField
                size="small"
                className={className}
                onChange={onChange}
                label={view.label}
                name={view.id}
                value={value}
                disabled={disabled || !view.enabled}
                // onFocus={event => setTextFieldInFocus(event.target)}
                // onBlur={() => setTextFieldInFocus(null)}
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
                disabled={disabled || !view.enabled}
                // onFocus={event => setTextFieldInFocus(event.target)}
                // onBlur={() => setTextFieldInFocus(null)}
            />
        );
};

export default InputView;