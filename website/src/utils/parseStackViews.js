import _invert from 'lodash/invert';

export const fieldTypesMap = {
    'InputView': 'text',
    'TextareaView': 'textarea',
    'SelectView': 'select',
    'SliderView': 'slider',
    'CheckboxView': 'checkbox',
    'ApplyView': 'apply',
    'UploaderView': 'file',
    'OutputView': 'output',
};

export const invertFieldTypesMap = _invert(fieldTypesMap);

export default views => {
    if (!views || !Array.isArray(views))
        return {};

    const fields = {};

    views.forEach((view, index) => {
        fields[index] = {
            label: view.label,
            type: fieldTypesMap[view.type],
            value: view.data,
            disabled: !view.enabled,
        };

        if (view.type === invertFieldTypesMap.text && view.long)
            fields[index].type = invertFieldTypesMap.textarea;

        if (view.type === invertFieldTypesMap.file)
            fields[index].multiple = view.multiple;

        if (view.type === invertFieldTypesMap.checkbox)
            fields[index].value = view.selected;

        if (view.type === invertFieldTypesMap.select) {
            fields[index].options = view.titles.map((title, i) => ({
                label: title,
                value: i,
            }));

            fields[index].value = view.selected;
            fields[index].multiple = view.multiple;
        }

        if (view.type === invertFieldTypesMap.slider) {
            fields[index].options = {};
            view.data.forEach(item => fields[index].options[item] = item);

            fields[index].min = Math.min.apply(null, view.data);
            fields[index].max = Math.max.apply(null, view.data);
            fields[index].value = view.data[view.selected];
        }
    });

    return fields;
};
