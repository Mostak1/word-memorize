import React, { createContext, useContext, useEffect, useState } from 'react';
import { router } from '@inertiajs/react';
import { translations } from '@/Utils/translations';

const LanguageContext = createContext();

export const LanguageProvider = ({ children, initialLocale = 'en' }) => {
    const [locale, setLocale] = useState(initialLocale);

    useEffect(() => {
        // Listen for Inertia success events to update locale when props change
        const unbind = router.on('success', (event) => {
            const userSettings = event.detail.page.props.userSettings;
            if (userSettings?.ui_language && userSettings.ui_language !== locale) {
                setLocale(userSettings.ui_language);
            }
        });

        return () => unbind();
    }, [locale]);

    const t = (path, replacements = {}) => {
        const values =
            typeof replacements === 'string'
                ? { defaultValue: replacements }
                : replacements;
        const keys = path.split('.');
        let result = translations[locale];

        for (const key of keys) {
            if (result && result[key] !== undefined) {
                result = result[key];
            } else {
                // Fallback to English if key missing in current locale
                let fallback = translations['en'];
                for (const fKey of keys) {
                    if (fallback && fallback[fKey] !== undefined) {
                        fallback = fallback[fKey];
                    } else {
                        return values.defaultValue ?? path; // Return provided fallback or key if not found at all
                    }
                }
                result = fallback;
                break;
            }
        }

        if (typeof result === 'string') {
            Object.keys(values).forEach((placeholder) => {
                if (placeholder !== 'defaultValue') {
                    result = result.replace(`{${placeholder}}`, values[placeholder]);
                }
            });
            return result;
        }

        return values.defaultValue ?? path;
    };

    return (
        <LanguageContext.Provider value={{ locale, t }}>
            {children}
        </LanguageContext.Provider>
    );
};

export const useTranslation = () => {
    const context = useContext(LanguageContext);
    if (!context) {
        throw new Error('useTranslation must be used within a LanguageProvider');
    }
    return context;
};
