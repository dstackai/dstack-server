// @flow
import React, {useMemo} from 'react';
import cx from 'classnames';
import {useTranslation} from 'react-i18next';
import SelectField from 'components/SelectField';
import CheckboxField from 'components/CheckboxField';
import SliderField from 'components/SliderField';
import TextField from 'components/TextField';
import {FileField} from 'components/kit';
import TextAreaField from 'components/TextAreaField';
import Button from 'components/Button';
import css from './styles.module.css';

type Props = {
    fields: {},
    form: {},
    onChange: Function,
    onApply?: Function,
    onReset?: Function,
    className?: string,
}

const StackFilters = ({className, fields, form, onChange, onApply, onReset, isSidebar, disabled}: Props) => {
    const {t} = useTranslation();

    const hasApply = useMemo(() => {
        if (!Object.keys(fields).length)
            return false;

        return Boolean(Object.keys(fields).find(key => fields[key].type === 'apply'));
    }, [fields]);

    if (!Object.keys(fields).length)
        return null;

    return (
        <div className={cx(css.filters, {[css.sidebar]: isSidebar}, className)}>
            {Object.keys(fields).map(key => {
                switch (fields[key].type) {
                    case 'text':
                        return <TextField
                            size="small"
                            key={`text-${key}`}
                            className={cx(css.field, css.text)}
                            onChange={event => onChange(key, event.target.value)}
                            label={fields[key].label}
                            name={key}
                            value={form[key]}
                            disabled={disabled || fields[key].disabled}
                        />;

                    case 'file':
                        return <FileField
                            size="small"
                            key={`file-${key}`}
                            className={cx(css.field, css.file)}
                            onChange={files => onChange(key, files)}
                            label={fields[key].label}
                            name={key}
                            files={form[key]}
                            disabled={disabled || fields[key].disabled}
                        />;

                    case 'textarea':
                        return <TextAreaField
                            size="small"
                            key={`text-${key}`}
                            className={cx(css.field, css.text)}
                            onChange={event => onChange(key, event.target.value)}
                            label={fields[key].label}
                            name={key}
                            value={form[key]}
                            disabled={disabled || fields[key].disabled}
                        />;

                    case 'select':
                        return <SelectField
                            size="small"
                            key={`select-${key}`}
                            align="bottom"
                            className={cx(css.field, css.select)}
                            onChange={value => onChange(key, value)}
                            label={fields[key].label}
                            name={key}
                            options={fields[key].options}
                            value={Array.isArray(form[key]) ? form[key] : [form[key]]}
                            disabled={disabled || fields[key].disabled}
                            mode={fields[key].multiple ? 'multiple' : null}
                        />;

                    case 'checkbox':
                        return <CheckboxField
                            appearance="switcher"
                            key={`checkbox-${key}`}
                            className={cx(css.field, css.switcher)}
                            onChange={onChange}
                            label={fields[key].label}
                            name={key}
                            value={form[key]}
                            disabled={disabled || fields[key].disabled}
                        />;

                    case 'slider':
                        return <SliderField
                            key={`slider-${key}`}
                            className={cx(css.field, css.slider)}
                            onChange={onChange}
                            align="right"
                            label={fields[key].label}
                            name={key}
                            value={form[key]}
                            step={null}
                            min={fields[key].min}
                            max={fields[key].max}
                            marks={fields[key].options}
                            disabled={disabled || fields[key].disabled}
                        />;

                    case 'apply':
                        return <div
                            key={`apply-${key}`}
                            className={cx(css.field, css.buttons)}
                        >
                            {onApply && (
                                <Button
                                    size="small"
                                    color="primary"
                                    variant="contained"
                                    onClick={onApply}
                                    disabled={disabled || fields[key].disabled}
                                    className={css.button}
                                >
                                    {t('apply')}
                                </Button>
                            )}

                            {onReset && (
                                <Button
                                    size="small"
                                    color="primary"
                                    variant="outlined"
                                    onClick={onReset}
                                    disabled={disabled}
                                    className={css.button}
                                >
                                    {t('reset')}
                                </Button>
                            )}
                        </div>;

                    default:
                        return null;
                }
            })}

            {!hasApply && onReset && (
                <div
                    className={cx(css.field, css.buttons)}
                >
                    <Button
                        size="small"
                        color="primary"
                        variant="outlined"
                        onClick={onReset}
                        disabled={disabled}
                        className={css.button}
                    >
                        {t('reset')}
                    </Button>
                </div>
            )}
        </div>
    );
};

export default StackFilters;
