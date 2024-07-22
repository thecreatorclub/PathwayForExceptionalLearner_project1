
// import { currentUser } from "@clerk/nextjs/server";
import { Chat } from "./components/chat";

export const runtime = 'edge';

export default function Page() {
  return <Chat />;
}