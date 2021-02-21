// @flow
import React, {useEffect, useMemo, useState} from 'react';
import SelectField from 'components/SelectField';

import type {TView} from '../types';

interface TSelectView extends TView {
    titles: Array<string>,
    selected?: ?number | Array<number>,
}

type Props = {
    className?: string,
    view: TSelectView,
    disabled?: boolean,
    onChange?: Function,
}

const selectedToValue = (selected: TSelectView.selected): Array => {
    return Array.isArray(selected) ? selected : [selected];
};

const SelectView = ({className, disabled, view, onChange: onChangeProp}: Props) => {
    const [value, setValue] = useState(selectedToValue(view.selected));

    useEffect(() => setValue(selectedToValue(view.selected)), [view]);

    const options = useMemo(() => {
        return view.titles.map((title, i) => ({
            label: title,
            value: i,
        }));
    }, [view.titles]);

    const onChange = (value: number | Array<number>) => {
        if (onChangeProp)
            onChangeProp({
                ...view,
                selected: value,
            });
    };

    return (
        <SelectField
            size="small"
            align="bottom"
            className={className}
            onChange={onChange}
            label={view.label}
            name={view.id}
            options={options}
            value={value}
            disabled={disabled || !view.enabled}
            mode={view.multiple ? 'multiple' : null}
        />
    );
};

export default SelectView;