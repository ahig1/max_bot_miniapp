import { useEffect, useState } from "react";
import { getWebAppTheme } from "../api/telegram";
import { createTheme } from "@mui/material";

const darkTheme = createTheme({
  palette: {
    mode: "dark",
  },
});

const lightTheme = createTheme({
  palette: {
    mode: "light",
  },
});

function isDark(bgColor: string | undefined): boolean {
  // Если цвет не определён (MAX без themeParams) — считаем светлую тему
  if (!bgColor) return false;
  return bgColor !== "#ffffff";
}

export function useTheme() {
  const themeParams = getWebAppTheme();
  const [isDarkMode, setIsDarkMode] = useState(isDark(themeParams.bg_color));

  useEffect(() => {
    window.Telegram?.WebApp.onEvent("themeChanged", () => {
      const updatedParams = getWebAppTheme();
      setIsDarkMode(isDark(updatedParams.bg_color));
    });

    return () => {
      window.Telegram?.WebApp.offEvent("themeChanged");
    };
  }, []);

  return isDarkMode ? darkTheme : lightTheme;
}

