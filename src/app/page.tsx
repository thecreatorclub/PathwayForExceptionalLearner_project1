
// import { currentUser } from "@clerk/nextjs/server";
import { Chat } from "./components/chat";
//import { UploadFile } from "./api/uploadFile";

export const runtime = 'edge';

export default function Page() {
  return <Chat />;
  // <UploadFile/>;
}