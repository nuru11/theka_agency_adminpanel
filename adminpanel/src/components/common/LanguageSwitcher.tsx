import { useTranslation } from 'react-i18next';
import { useLanguage } from '../../context/LanguageContext';

export default function LanguageSwitcher() {
  const { language, setLanguage } = useLanguage();
  const { t } = useTranslation();

  return (
    <div
      className="relative flex items-center rounded-full border border-gray-200 bg-white p-0.5 dark:border-gray-800 dark:bg-gray-900"
      role="group"
      aria-label={t('language.switchTo')}
    >
      <button
        type="button"
        onClick={() => setLanguage('en')}
        className={`rounded-full px-2.5 py-1.5 text-xs font-medium transition-colors ${
          language === 'en'
            ? 'bg-brand-500 text-white'
            : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-white'
        }`}
      >
        {t('language.en')}
      </button>
      <button
        type="button"
        onClick={() => setLanguage('ar')}
        className={`rounded-full px-2.5 py-1.5 text-xs font-medium transition-colors ${
          language === 'ar'
            ? 'bg-brand-500 text-white'
            : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-white'
        }`}
      >
        {t('language.ar')}
      </button>
    </div>
  );
}
