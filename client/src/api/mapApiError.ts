import { ApiClientError } from './client.js';

const STATUS_MESSAGES: Record<number, string> = {
  400: 'Проверьте введённые данные',
  401: 'Войдите в аккаунт',
  403: 'Недостаточно прав для этого действия',
  404: 'Данные не найдены',
  409: 'Такая запись уже существует',
  422: 'Данные не прошли проверку',
  429: 'Слишком много запросов. Попробуйте позже',
  500: 'Ошибка сервера. Попробуйте позже',
  503: 'Сервис временно недоступен',
};

/** Понятное сообщение для UI из ошибки API */
export function mapApiError(error: unknown, fallback = 'Произошла ошибка'): string {
  if (error instanceof ApiClientError) {
    if (error.message && error.message !== 'Request failed') {
      return error.message;
    }
    return STATUS_MESSAGES[error.status] ?? fallback;
  }
  if (error instanceof Error && error.message) {
    return error.message;
  }
  return fallback;
}
