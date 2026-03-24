import { API_URL } from "./common";

const AUTH_HEADER = "X-Telegram-User-Auth";

function getMessageParams() {
    const urlParams = new URLSearchParams(window.location.search);
    const telegramId = parseInt(urlParams.get("telegramId") || "0");
    const messageId = parseInt(urlParams.get("messageId") || "0");
    return {
        telegramId,
        messageId,
    };
}

function getAuthParams() {
    const urlParams = new URLSearchParams(window.location.search);
    const telegramId = parseInt(urlParams.get("telegramId") || "0");
    const authToken = urlParams.get("authToken") || "";
    return {
        telegramId,
        authToken,
    };
}

export function applyOrderFilter(data: object) {
    const { telegramId, authToken } = getAuthParams();
    return fetch(`${API_URL}/user/orders/apply-filter/`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            [AUTH_HEADER]: `${telegramId}:${authToken}`,
        },
        body: JSON.stringify({
            ...data,
            ...getMessageParams(),
        }),
    });
}

