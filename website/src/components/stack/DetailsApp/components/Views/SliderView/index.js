// @flow
import React, {useEffect, useState, useMemo} from 'react';
import {useDebounce} from 'hooks';
import SliderField from 'components/SliderField';

import type {TView} from '../types';

interface TSliderView extends TView {
    data: Array<number>,
    selected: number,
}

type Props = {
    className?: string,
    view: TSliderView,
    disabled?: boolean,
    onChange?: Function,
    debounce?: number,
}

const selectedToValue = (selected: TSliderView.selected, data: TSliderView.data): ?number => {
    if (!Array.isArray(data))
        return null;

    return data[selected];
};

const SliderView = ({className, view, disabled, debounce = 300, onChange: onChangeProp}: Props) => {
    const [value, setValue] = useState(selectedToValue(view.selected, view.data));

    useEffect(() => setValue(selectedToValue(view.selected, view.data)), [view]);

    const onChangePropDebounce = useDebounce(onChangeProp, debounce, [debounce, onChangeProp]);

    const {min, max, options} = useMemo(() => {
        return {
            options: view.data.reduce((result, item) => {
                result[item] = item;
                return result;
            }, {}),

            min: Math.min.apply(null, view.data),
            max: Math.max.apply(null, view.data),
        };
    }, [view.titles]);


    const onChange = (event: {target: {value: number}}) => {
        setValue(event.target.value);

        if (onChangeProp)
            onChangePropDebounce(
                {
                    ...view,
                    selected: view.data.indexOf(event.target.value),
                },

                {
                    source: view.id,
                    type: 'select',
                }
            );
    };

    return (
        <SliderField
            className={className}
            onChange={onChange}
            align="right"
            label={view.label}
            name={view.id}
            value={value}
            step={null}
            min={min}
            max={max}
            marks={options}
            disabled={disabled || !view.enabled}
        />
    );
};

export default SliderView;