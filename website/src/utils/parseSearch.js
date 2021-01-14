const parseSearch = searchString => {
    const search = searchString.substring(1);

    let params = {};

    if (!search.length)
        return params;

    try {
        params = JSON.parse(
            '{"'
            + decodeURIComponent(search).replace(/"/g, '\\"')
                .replace(/&/g, '","')
                .replace(/=/g, '":"')
            + '"}');
    } catch (e) {
        params = {};
    }

    return params;
};

export default parseSearch;