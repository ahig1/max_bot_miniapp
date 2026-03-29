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

export function useTheme() {
  const themeParams = getWebAppTheme();
  const [isDarkMode, setIsDarkMode] = useState(
    themeParams.bg_color !== "#ffffff"
  );

  useEffect(() => {
    window.Telegram?.WebApp.onEvent("themeChanged", () => {
      const darkMode = themeParams.bg_color !== "#ffffff";
      setIsDarkMode(darkMode);
    });

    return () => {
      window.Telegram?.WebApp.offEvent("themeChanged");
    };
  }, [themeParams]);

  return isDarkMode ? darkTheme : lightTheme;
}

