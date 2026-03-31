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
 * Отправка данных обратно в чат.
 * В Telegram используется sendData, в MAX — POST на бекенд.
 */
export async function sendDataToBot(data: unknown) {
    if (isTg && window.Telegram?.WebApp?.sendData) {
        await window.Telegram.WebApp.sendData(JSON.stringify(data));
    } else if (isMax) {
        const initDataUnsafe = window.WebApp?.initDataUnsafe;
        const userId = initDataUnsafe?.user?.id;
        const chatId = initDataUnsafe?.chat?.id;

        if (!userId || !chatId) {
            console.error("Cannot submit form: missing userId or chatId from initDataUnsafe");
            return;
        }

        const { API_URL } = await import("./common");
        const response = await fetch(`${API_URL}/forms/submit`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                formData: data,
                userId,
                chatId,
            }),
        });

        if (!response.ok) {
            throw new Error(`Form submission failed: ${response.status}`);
        }

        // Close the mini app after successful submission
        closeWebApp();
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