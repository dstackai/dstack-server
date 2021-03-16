// @flow

import React from 'react';
import cx from 'classnames';
import {useTranslation} from 'react-i18next';
import Select, {Option, OptGroup} from 'rc-select';
import CheckboxField from 'components/CheckboxField';
import css from './styles.module.css';

const allValue = 'all';

type Props = {
    size?: 'normal' | 'middle' | 'small',
    appearance: 'default' | 'autocomplete',
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
    appearance = 'default',
    label,
    disabled,
    placeholder,
    value: propValue = [],
    className,
    mode,
    onChange,
    options = [],
    errors = [],
    showSearch = true,
    ...props
}: Props) => {
    const hasErrors = Boolean(errors.length);
    const {t} = useTranslation();
    
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

    const filterOption = (searchValue, option) => {
        if (!option.value)
            return false;

        const normalizeSearchValue = searchValue.toLowerCase().trim();
        const value = option.value.toString().toLowerCase().trim();
        const label = option.label ? option.label.toString().toLowerCase().trim() : '';

        return (
            value.indexOf(normalizeSearchValue) >= 0
            || label.indexOf(normalizeSearchValue) >= 0
        );
    };

    const renderOptions = () => options.map(({value, label}) => (
        <Option key={value} value={value} label={label}>
            {mode === 'multiple' && appearance === 'default' && (
                <CheckboxField
                    readOnly
                    className="select-field-item-option-checkbox"
                    value={propValue.indexOf(value) >= 0}
                />
            )}

            <span className="select-field-item-option-label">{label}</span>
        </Option>
    ));

    return (
        <div
            className={cx(
                css.field,
                className,
                `size-${size}`,
                `align-${align}`,
                `appearance-${appearance}`,
                {disabled}
            )}
        >
            <Select
                value={propValue}
                // animation={useAnim ? 'slide-up' : null}
                // choiceTransitionName="rc-select-selection__choice-zoom"
                filterOption={filterOption}
                prefixCls="select-field"
                mode={mode}
                showArrow
                showSearch={showSearch}
                onSelect={onSelect}
                onDeselect={onDeselect}
                placeholder={placeholder}
                onChange={onChangeHandle}
                inputIcon={<span className="mdi mdi-chevron-down" />}
                dropdownClassName={disabled ? css.dropdownDisabled : ''}
                {...props}
            >
                {options.length && mode === 'multiple' && appearance === 'default' && (
                    <Option key={allValue} value={allValue} label={t('selectAll')}>
                        <CheckboxField
                            readOnly
                            className="select-field-item-option-checkbox"
                            value={propValue.length === options.length}
                        />

                        <span className="select-field-item-option-label">{t('selectAll')}</span>
                    </Option>
                )}

                {mode === 'multiple' && appearance === 'default'
                    ? <OptGroup>{renderOptions()}</OptGroup>
                    : renderOptions()
                }
            </Select>

            {label && <label className={css.label}>{label}</label>}
            {hasErrors && <div className={css.error}>{errors.join(', ')}</div>}
        </div>
    );
};

export default SelectField;
