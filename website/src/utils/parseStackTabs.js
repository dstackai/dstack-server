export default attachments => {
    const tabs = [];

    if (!attachments || !attachments.length)
        return [];

    attachments.forEach(i => {
        Object.keys(i.params).forEach(key => {
            if (i.params[key] instanceof Object
                && i.params[key].type === 'tab'
            ) {
                const tab = i.params[key].title || key;

                if (!tabs.find(i => i.value === tab))
                    tabs.push({
                        label: tab,
                        value: tab,
                        key,
                    });
            }
        });
    });

    return tabs;
};
