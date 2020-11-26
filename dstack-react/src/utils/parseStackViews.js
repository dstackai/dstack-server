const typeMap = {
    'TextFieldView': 'text',
    'ComboBoxView': 'select',
    'SliderView': 'slider',
    'ApplyView': 'apply',
};

export default views => {
    const fields = {};

    views.forEach((view, index) => {
        fields[index] = {
            type: typeMap[view.type],
            value: view.data,
            disabled: !view.enabled,
        };

        if (view.type === 'ComboBoxView') {
            fields[index].options = view.titles.map((title, i) => ({
                label: title,
                value: i,
            }));

            fields[index].value = view.selected;
        }

        if (view.type === 'SliderView') {
            fields[index].options = {};
            view.data.forEach(item => fields[index].options[item] = item);

            fields[index].min = Math.min.apply(null, view.data);
            fields[index].max = Math.max.apply(null, view.data);
            fields[index].value = view.data[view.selected];
        }
    });

    return fields;
};
