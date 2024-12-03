"use client";

import { MoonIcon, SunIcon } from "@radix-ui/react-icons";
import { useTheme } from "next-themes";
import * as React from "react";

import { Button } from "@/components/ui/button";

export function ModeToggle() {
  const { theme, resolvedTheme, setTheme, systemTheme } = useTheme();

  // Ensure theme initialization on first load
  React.useEffect(() => {
    if (!theme) {
      setTheme(systemTheme || "light"); // Default to light if no system theme is available
    }
  }, [theme, systemTheme, setTheme]);

  return (
    <Button style={{ marginLeft: "auto" }}>
      {resolvedTheme === "dark" ? (
        <MoonIcon
          className="h-[1.2rem] w-[1.2rem]"
          onClick={() => setTheme("light")}
        />
      ) : (
        <SunIcon
          className="h-[1.2rem] w-[1.2rem]"
          onClick={() => setTheme("dark")}
        />
      )}
      <span>Toggle theme</span>
    </Button>
  );
}
