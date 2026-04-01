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
        window.Telegram.WebApp.sendData(JSON.stringify(data));
        return;
    }

    // MAX: отправляем данные на бекенд через REST API,
    // бекенд сам отправит сообщение в чат
    const initDataUnsafe =
        window.WebApp?.initDataUnsafe ??
        window.Telegram?.WebApp?.initDataUnsafe;
    const userId = initDataUnsafe?.user?.id;
    const chatId = initDataUnsafe?.chat?.id;

    if (!userId || !chatId) {
        console.error("sendDataToBot: missing userId or chatId", { userId, chatId, initDataUnsafe });
        alert("Ошибка: не удалось определить userId или chatId");
        return;
    }

    try {
        const { API_URL } = await import("./common");
        const response = await fetch(`${API_URL}/forms/submit`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ formData: data, userId, chatId }),
        });

        if (!response.ok) {
            const text = await response.text();
            alert(`Ошибка сервера: ${response.status}\n${text}`);
            return;
        }

        closeWebApp();
    } catch (error: any) {
        alert(`Сетевая ошибка: ${error.message}`);
        console.error("sendDataToBot fetch error:", error);
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
 * Получение payload из initDataUnsafe.start_param (base64url-encoded JSON).
 * Используется для чтения параметров, переданных через OpenAppButton в MAX.
 */
export function getLaunchPayload(): Record<string, any> {
    const raw =
        window.WebApp?.initDataUnsafe?.start_param ??
        window.Telegram?.WebApp?.initDataUnsafe?.start_param;
    if (!raw) return {};
    try {
        // base64url → base64 → decode
        const padded = raw.replace(/-/g, "+").replace(/_/g, "/");
        const binString = window.atob(padded);
        const bytes = new Uint8Array(binString.length);
        for (let i = 0; i < binString.length; i++) {
            bytes[i] = binString.charCodeAt(i);
        }
        return JSON.parse(new TextDecoder().decode(bytes));
    } catch {
        return {};
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
