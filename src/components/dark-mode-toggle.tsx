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
    <Button
      className="ml-auto cursor-pointer"
      onClick={() => setTheme(resolvedTheme === "light" ? "dark" : "light")}
    >
      {resolvedTheme === "dark" ? (
        <MoonIcon className="h-[1.2rem] w-[1.2rem]" />
      ) : (
        <SunIcon className="h-[1.2rem] w-[1.2rem]" />
      )}
      <span>Toggle theme</span>
    </Button>
  );
}
