export const isImageType = type => /^image/.test(type);

export const base64ToJSON = (base64: string) => {
    let parsedJSON;

    try {
        parsedJSON = JSON.parse(atob(base64));
    } catch (e) {
        console.log(e);
    }

    return parsedJSON;
};
