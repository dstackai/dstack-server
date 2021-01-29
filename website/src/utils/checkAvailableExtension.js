// @flow
export default (file: File, formats?: Array<string>) => {
    const ext = '.' + file.name.split('.').pop();

    let isAvailable;

    if (formats && formats.length)
        isAvailable = formats.some(format => {
            if (format === '.jpg' || format === '.jpeg')
                return ext === '.jpg' || ext === '.jpeg';
            else
                return format === ext;
        });
    else
        isAvailable = true;

    return isAvailable;
};