// @flow
import {useState} from 'react';
import {isRequired, isEmail, noSpaces, isValidStackName} from 'utils/validations';

const validationMap = {
    required: isRequired,
    email: isEmail,
    'no-spaces-stack': noSpaces,
    'stack-name': isValidStackName,
};

const getValidationFunction = (validator: Function | string): Function => {
    if (typeof validator === 'string' && validationMap[validator])
        return validationMap[validator];

    if (typeof validator === 'function')
        return validator;

    return () => true;
};

export default (
    initialFormState: {[key: string]: any},
    fieldsValidators: {[key: string]: Array<Function> | Function} = {}
): {} => {
    const [form, setForm] = useState(initialFormState);
    const [formErrors, setFormErrors] = useState({});

    const onChange = (eventOrName, value) => {
        let name;

        let fieldValue;

        if (eventOrName.target) {
            const event = eventOrName;

            fieldValue = event.target.type === 'checkbox'
                ? event.target.checked
                : event.target.value;

            name = event.target.name;
        } else {
            name = eventOrName;
            fieldValue = value;
        }

        setForm({
            ...form,
            [name]: fieldValue,
        });

        setFormErrors({
            ...formErrors,
            [name]: [],
        });
    };

    const resetForm = () => {
        setForm(initialFormState);
        setFormErrors({});
    };

    const getFieldErrors = fieldName => {
        const errors = [];

        if (Array.isArray(fieldsValidators[fieldName]))
            fieldsValidators[fieldName].forEach(validator => {
                const isValid = getValidationFunction(validator);

                if (!isValid(form[fieldName]))
                    errors.push(validator);
            });

        if (typeof fieldsValidators[fieldName] === 'string') {
            const isValid = getValidationFunction(fieldsValidators[fieldName]);

            if (!isValid(form[fieldName]))
                errors.push(fieldsValidators[fieldName]);
        }

        return errors;
    };

    const checkValidForm = () => {
        let isValid = true;
        const newFormErrors = {};

        Object.keys(fieldsValidators)
            .forEach(fieldName => {
                const errors = getFieldErrors(fieldName);

                newFormErrors[fieldName] = errors;
                isValid = isValid && !errors.length;
            });

        setFormErrors(newFormErrors);
        return isValid;
    };

    return {
        form,
        setForm,
        formErrors,
        setFormErrors,
        resetForm,
        onChange,
        checkValidForm,
    };
};
