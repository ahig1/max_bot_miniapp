// Декларируем глобальные переменные для TypeScript
declare global {
    interface Window {
        Telegram?: { WebApp: any };
        WebApp?: any; // SDK платформы MAX
    }
}

// Утилиты для определения текущей платформы (добавили знаки вопроса)
export const isMax = typeof window !== 'undefined' && !!window.WebApp?.initData;
export const isTg = typeof window !== 'undefined' && !!window.Telegram?.WebApp?.initData;

/**
 * Получение строки авторизации (для отправки на бекенд)
 */
export function getInitData(): string {
    if (isMax) return window.WebApp?.initData || "";
    if (isTg) return window.Telegram?.WebApp?.initData || "";
    return "";
}

/**
 * Получение payload из OpenAppButton (параметры запуска мини-приложения).
 * В MAX payload передаётся через initData, в Telegram — через start_param или аналог.
 * Возвращает распарсенный объект или пустой объект.
 */
export function getLaunchPayload(): Record<string, unknown> {
    try {
        if (isMax) {
            const raw = window.WebApp?.initDataUnsafe?.payload
                || window.WebApp?.payload;
            if (raw) return typeof raw === 'string' ? JSON.parse(raw) : raw;
        }
        if (isTg) {
            const raw = window.Telegram?.WebApp?.initDataUnsafe?.start_param;
            if (raw) return typeof raw === 'string' ? JSON.parse(raw) : raw;
        }
    } catch (e) {
        console.warn("Failed to parse launch payload:", e);
    }
    return {};
}

/**
 * Отправка данных обратно в чат. 
 * ВАЖНО: В MAX нет прямого аналога sendData. 
 * Рекомендуется отправлять данные на свой бекенд через fetch(), 
 * а бекенд уже сам отправит сообщение в чат через API.
 */
export async function sendDataToBot(data: unknown) {
    if (isTg && window.Telegram?.WebApp?.sendData) {
        await window.Telegram.WebApp.sendData(JSON.stringify(data));
    } else if (isMax) {
        console.warn("В MAX отправка данных напрямую в чат (sendData) не поддерживается. Используйте REST API бекенда.");
        // Здесь в будущем можно сделать fallback на fetch-запрос к твоему API
    }
}

/**
 * Закрытие окна мини-приложения
 */
export function closeWebApp() {
    if (isMax) {
        window.WebApp.close();
    } else if (isTg) {
        window.Telegram?.WebApp?.close();
    }
}

/**
 * Разворачивание на весь экран
 */
export function expandWebapp() {
    if (isMax) {
        // В доке MAX нет метода expand(), приложения сами занимают нужный размер.
        // Но мы можем вызвать ready(), чтобы сообщить платформе о готовности.
        if (typeof window.WebApp.ready === 'function') {
            window.WebApp.ready();
        }
    } else if (isTg) {
        window.Telegram?.WebApp?.expand();
    }
}

/**
 * Получение параметров темы
 */
export function getWebAppTheme() {
    if (isMax) {
        // Документация MAX пока не передает цвета темы, возвращаем пустой объект
        return {}; 
    }
    return window.Telegram?.WebApp?.themeParams ?? {};
}