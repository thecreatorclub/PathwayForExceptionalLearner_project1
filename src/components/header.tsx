"use client";

import { ModeToggle } from "@/components/dark-mode-toggle";
import { ThemeProvider } from "@/components/theme-provider";
import { RocketIcon } from "@radix-ui/react-icons";
import { TabNav } from "@radix-ui/themes";
import Link from "next/link";
import { usePathname } from "next/navigation";
export function Header() {
  const local = usePathname();

  return (
    <TabNav.Root className="px-4 items-center">
      <li className="self-center"></li>
      <li className="self-center text-xl font-bold mr-4">
        <Link href="/" className=" flex items-center gap-2 ">
          <RocketIcon /> We are Learners
        </Link>
      </li>

      <TabNav.Link active={local.indexOf("/admin") === -1}>
        <Link href="/assignments">Students</Link>
      </TabNav.Link>
      <TabNav.Link href="#" active={local.indexOf("/admin") !== -1}>
        <Link href="/admin/assignments">Teachers</Link>
      </TabNav.Link>
      <div style={{ flex: 1 }}></div>
      <li className="self-center">
        <ThemeProvider>
          <ModeToggle />
        </ThemeProvider>
      </li>
    </TabNav.Root>
  );
}
