import { useEffect, useState } from "react";

export function useColorScheme() {
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    setIsDark(mq.matches);

    const handleChange = (e: MediaQueryListEvent) => setIsDark(e.matches);

    if ("addEventListener" in mq) {
      mq.addEventListener("change", handleChange);
    } else {
      // Safari fallback
      (mq as any).addListener(handleChange);
    }

    return () => {
      if ("removeEventListener" in mq) {
        mq.removeEventListener("change", handleChange);
      } else {
        (mq as any).removeListener(handleChange);
      }
    };
  }, []);

  return isDark;
}
