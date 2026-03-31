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
    if (getIsTg() && window.Telegram?.WebApp?.sendData) {
        await window.Telegram.WebApp.sendData(JSON.stringify(data));
    } else if (getIsMax()) {
        const initDataUnsafe = window.WebApp?.initDataUnsafe;
        const userId = initDataUnsafe?.user?.id;
        const chatId = initDataUnsafe?.chat?.id;

        if (!userId || !chatId) {
            alert("Ошибка: не хватает userId или chatId!");
            console.error("Cannot submit form: missing userId or chatId", initDataUnsafe);
            return;
        }

        try {
            const { API_URL } = await import("./common");
            
            // Пробуем отправить запрос
            const response = await fetch(`${API_URL}/forms/submit`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    formData: data,
                    userId,
                    chatId,
                }),
            });

            // Если сервер вернул 404, 500 и т.д.
            if (!response.ok) {
                alert(`Ошибка бэкенда: ${response.status} ${response.statusText}\nПроверь, есть ли на сервере роут /forms/submit`);
                return;
            }

            // Если всё ок — закрываем приложение
            closeWebApp();
            
        } catch (error: any) {
            // Если запрос вообще не дошел до сервера (неверный URL, CORS или сервер лежит)
            alert(`Сетевая ошибка: ${error.message}\nУбедись, что API_URL правильный и сервер запущен.`);
            console.error("Fetch error:", error);
        }
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