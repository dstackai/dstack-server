const unicodeBase64Decode = text => {
    try {
        const decodeData = window.atob(text);

        return decodeURIComponent(Array.prototype.map.call(decodeData, c => {
            return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
        }).join(''));
    } catch (e) {
        return null;
    }
};

export default unicodeBase64Decode;