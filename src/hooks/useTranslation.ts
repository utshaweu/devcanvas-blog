import { useLanguage } from '@/contexts/LanguageContext';
import { t as translate, TranslationKey } from '@/i18n';

export function useTranslation() {
  const { language } = useLanguage();

  const t = (key: TranslationKey) => translate(key, language);

  return { t, language };
}
