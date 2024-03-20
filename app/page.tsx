import LogIn from "@/components/log-in";
import LogOut from "@/components/log-out";
import { config } from "@/next-auth";
import { getServerSession } from "next-auth";

export default async function Home() {
  const session = await getServerSession(config);
  return (
    <>
      <pre>{JSON.stringify(session, null, 2)}</pre>
      <LogIn />
      <LogOut />
    </>
  );
}
