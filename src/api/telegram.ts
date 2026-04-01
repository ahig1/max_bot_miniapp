// Декларируем глобальные переменные для TypeScript
declare global {
    interface Window {
        Telegram?: { WebApp: any };
        WebApp?: any; // SDK платформы MAX
    }
}

// Утилиты для определения текущей платформы (вычисляются при каждом вызове,
// чтобы SDK успел инициализироваться)
export function getIsMax() {
    return typeof window !== 'undefined' && !!window.WebApp?.initData;
}
export function getIsTg() {
    return typeof window !== 'undefined' && !!window.Telegram?.WebApp?.initData;
}

/**
 * Получение строки авторизации (для отправки на бекенд)
 */
export function getInitData(): string {
    if (getIsMax()) return window.WebApp?.initData || "";
    if (getIsTg()) return window.Telegram?.WebApp?.initData || "";
    return "";
}

/**
 * Отправка данных обратно в чат.
 * В Telegram используется sendData, в MAX — POST на бекенд.
 */
export async function sendDataToBot(data: unknown) {
    console.log("sendDataToBot called", { isTg: getIsTg(), isMax: getIsMax(), data });

    if (getIsTg() && window.Telegram?.WebApp?.sendData) {
        await window.Telegram.WebApp.sendData(JSON.stringify(data));
        return;
    }

    // Для MAX (или если платформа не определена — пробуем через REST API)
    const initDataUnsafe =
        window.WebApp?.initDataUnsafe ??
        window.Telegram?.WebApp?.initDataUnsafe;
    const userId = initDataUnsafe?.user?.id;
    const chatId = initDataUnsafe?.chat?.id;

    console.log("sendDataToBot: initDataUnsafe", initDataUnsafe);

    if (!userId || !chatId) {
        alert(`DEBUG: userId=${userId}, chatId=${chatId}, isMax=${getIsMax()}, WebApp=${!!window.WebApp}, initData=${!!window.WebApp?.initData}`);
        return;
    }

    try {
        const { API_URL } = await import("./common");
        console.log("sendDataToBot: posting to", `${API_URL}/forms/submit`);

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
    if (getIsMax()) {
        window.WebApp.close();
    } else if (getIsTg()) {
        window.Telegram?.WebApp?.close();
    }
}

/**
 * Разворачивание на весь экран
 */
export function expandWebapp() {
    if (getIsMax()) {
        // В доке MAX нет метода expand(), приложения сами занимают нужный размер.
        // Но мы можем вызвать ready(), чтобы сообщить платформе о готовности.
        if (typeof window.WebApp.ready === 'function') {
            window.WebApp.ready();
        }
    } else if (getIsTg()) {
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
    if (getIsMax()) {
        // Документация MAX пока не передает цвета темы, возвращаем пустой объект
        return {}; 
    }
    return window.Telegram?.WebApp?.themeParams ?? {};
}