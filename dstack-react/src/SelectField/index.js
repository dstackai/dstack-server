// @flow

import React from 'react';
import cx from 'classnames';
import Select, {Option, OptGroup} from 'rc-select';
import CheckboxField from '../CheckboxField';
import css from './styles.module.css';
import './test.css';

const allValue = 'all';

type Props = {
    size?: 'normal' | 'middle' | 'small',
    className?: string,
    disabled?: boolean,
    placeholder?: string,
    showSearch?: boolean,
    value: Array<string>,
    mode?: string,
    align: 'left' | 'right' | 'bottom',
    label?: string,

    options: Array<{
        value: string,
        label: string,
    }>,
}

const SelectField = ({
    align = 'left',
    size = 'normal',
    label,
    disabled,
    placeholder,
    value: propValue = [],
    className,
    mode,
    onChange,
    options = [],
    showSearch = true,
    ...props
}: Props) => {
    const onChangeHandle = (value: Array<string>) => {
        if (Array.isArray(value) && value.indexOf(allValue) >= 0)
            if (value.length > options.length)
                value = [];
            else
                value = options.map(o => o.value);

        if (onChange)
            onChange(value);
    };

    const onSelect = () => {};

    const onDeselect = () => {};

    const renderOptions = () => options.map(({value, label}) => (
        <Option key={value} value={value}>
            {mode === 'multiple' && <CheckboxField
                readOnly
                className="select-field-item-option-checkbox"
                value={propValue.indexOf(value) >= 0}
            />}

            <span className="select-field-item-option-label">{label}</span>
        </Option>
    ));

    return (
        <div className={cx(css.field, className, size, align, {disabled})}>
            <Select
                value={propValue}
                // animation={useAnim ? 'slide-up' : null}
                // choiceTransitionName="rc-select-selection__choice-zoom"
                prefixCls="select-field"
                mode={mode}
                showArrow
                showSearch={showSearch}
                onSelect={onSelect}
                onDeselect={onDeselect}
                placeholder={placeholder}
                onChange={onChangeHandle}
                inputIcon={<span className="mdi mdi-chevron-down" />}
                {...props}
            >
                {options.length && mode === 'multiple' && <Option key={allValue} value={allValue}>
                    <CheckboxField
                        readOnly
                        className="select-field-item-option-checkbox"
                        value={propValue.length === options.length}
                    />

                    <span className="select-field-item-option-label">Select all</span>
                </Option>}

                {mode === 'multiple'
                    ? <OptGroup>{renderOptions()}</OptGroup>
                    : renderOptions()
                }
            </Select>

            {label && <label className={css.label}>{label}</label>}
        </div>
    );
};

export default SelectField;
