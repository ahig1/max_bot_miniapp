// Декларируем глобальные переменства для TypeScript
declare global {
    interface Window {
        Telegram?: { WebApp: any };
        WebApp?: any; // SDK платформы MAX
    }
}

// Ленивое определение платформы (не на этапе загрузки модуля)
export function getIsMax(): boolean {
    return typeof window !== 'undefined' && !!window.WebApp;
}

export function getIsTg(): boolean {
    return typeof window !== 'undefined' && !!window.Telegram?.WebApp?.initData;
}

// Обратная совместимость
export const isMax = typeof window !== 'undefined' && !!window.WebApp;
export const isTg = typeof window !== 'undefined' && !!window.Telegram?.WebApp?.initData;

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
    if (getIsTg() && window.Telegram?.WebApp?.sendData) {
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
        if (typeof window.WebApp.ready === 'function') {
            window.WebApp.ready();
        }
    } else if (getIsTg()) {
        window.Telegram?.WebApp?.expand();
    }
}

/**
 * Получение payload из initDataUnsafe.
 * MAX передаёт payload из OpenAppButton в start_param.
 */
export function getLaunchPayload(): Record<string, any> {
    const webapp = window.WebApp ?? window.Telegram?.WebApp;
    const unsafe = webapp?.initDataUnsafe;

    console.log("[getLaunchPayload] window.WebApp:", !!window.WebApp);
    console.log("[getLaunchPayload] window.WebApp?.initData:", window.WebApp?.initData?.substring?.(0, 100));
    console.log("[getLaunchPayload] initDataUnsafe:", JSON.stringify(unsafe)?.substring(0, 300));
    console.log("[getLaunchPayload] start_param:", unsafe?.start_param);
    console.log("[getLaunchPayload] payload:", unsafe?.payload);

    // MAX может передать payload в start_param или payload
    const raw = unsafe?.start_param ?? unsafe?.payload;

    if (!raw) {
        console.warn("[getLaunchPayload] No start_param or payload found in initDataUnsafe");
        return {};
    }

    try {
        // base64url → base64 → decode
        const padded = raw.replace(/-/g, "+").replace(/_/g, "/");
        const remainder = padded.length % 4;
        const finalStr = remainder ? padded + "=".repeat(4 - remainder) : padded;
        const binString = window.atob(finalStr);
        const bytes = new Uint8Array(binString.length);
        for (let i = 0; i < binString.length; i++) {
            bytes[i] = binString.charCodeAt(i);
        }
        const decoded = JSON.parse(new TextDecoder().decode(bytes));
        console.log("[getLaunchPayload] Decoded payload:", decoded);
        return decoded;
    } catch (e) {
        console.error("[getLaunchPayload] Failed to decode payload:", raw, e);
        return {};
    }
}

/**
 * Получение параметров темы
 */
export function getWebAppTheme() {
    if (getIsMax()) {
        return {};
    }
    return window.Telegram?.WebApp?.themeParams ?? {};
}
