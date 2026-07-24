import type { TFunction } from 'i18next';

type ApiErrorShape = {
  response?: {
    data?: {
      code?: string;
      message?: string;
    };
  };
  message?: string;
};

export function getApiErrorMessage(
  err: unknown,
  t: TFunction,
  fallbackKey = 'errors.generic'
): string {
  const error = err as ApiErrorShape;
  const code = error?.response?.data?.code;

  if (code) {
    const key = `errors.${code}`;
    const translated = t(key);
    if (translated !== key) return translated;
  }

  const message = error?.response?.data?.message || error?.message;
  if (message) return message;

  return t(fallbackKey);
}
