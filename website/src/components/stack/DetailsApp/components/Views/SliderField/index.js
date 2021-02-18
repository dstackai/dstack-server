// @flow
import React, {useEffect, useMemo} from 'react';
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
}

const SliderView = ({className, view, disabled, onChange: onChangeProp}: Props) => {
    const [value, setValue] = useEffect(view.selected);

    useEffect(() => setValue(view.selected), [view]);

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

    const onChange = value => {
        setValue(value);

        if (onChangeProp)
            onChangeProp({
                ...view,
                selected: value,
            });
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
            disabled={disabled || !view.disabled}
        />
    );
};

export default SliderView;