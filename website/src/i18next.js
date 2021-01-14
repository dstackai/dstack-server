import i18n from 'i18next';
import en from 'locales/en';
import {initReactI18next} from 'react-i18next';

i18n
    .use(initReactI18next)
    .init({
        resources: {en: {translation: en}},
        lng: 'en',
        fallbackLng: 'en',

        interpolation: {escapeValue: false},
    });

export default i18n;
