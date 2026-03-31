import { API_URL } from "./common";
import { getLaunchPayload } from "./telegram";

const AUTH_HEADER = "X-Telegram-User-Auth";

function getParam(key: string): string {
    const searchParams = new URLSearchParams(window.location.search);
    const val = searchParams.get(key);
    if (val != null) return val;
    const hashParams = new URLSearchParams(window.location.hash.replace(/^#/, ""));
    const hashVal = hashParams.get(key);
    if (hashVal != null) return hashVal;
    const payload = getLaunchPayload();
    return payload[key] != null ? String(payload[key]) : "";
}

function getMessageParams() {
    const telegramId = parseInt(getParam("telegramId") || "0");
    const messageId = parseInt(getParam("messageId") || "0");
    return {
        telegramId,
        messageId,
    };
}

function getAuthParams() {
    const telegramId = parseInt(getParam("telegramId") || "0");
    const authToken = getParam("authToken") || "";
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

