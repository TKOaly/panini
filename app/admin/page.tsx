import { cachedPaninis, createPanini, destroyPanini } from "@/services/panini";
import { createUnicafe } from "@/services/unicafe";
import prisma from "@/db";
import { config } from "@/next-auth";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";

export default async function Admin() {
  const session = await getServerSession(config);
  const paninis = await cachedPaninis();
  const unicafes = await prisma.unicafe.findMany();

  if (!session?.user?.admin) {
    redirect("/");
  }

  return (
    <>
      <h1>Admin</h1>
      <div className="flex gap-8">
        <div>
          <h2>Paninis</h2>
          {paninis.map((panini) => (
            <form key={panini.id} action={destroyPanini} className="relative">
              <input type="hidden" name="id" value={panini.id} />
              {panini.name}
              <button type="submit" className="absolute right-3">
                destroy
              </button>
            </form>
          ))}
          {paninis.length === 0 && <pre>no paninis</pre>}
          <form action={createPanini} className="flex flex-col">
            <input name="name" placeholder="name" />
            <input name="description" placeholder="description" />
            <button type="submit">create panini</button>
          </form>
        </div>

        <div>
          <h2>Unicafes</h2>
          <ul>
            {unicafes.map((unicafe) => (
              <li key={unicafe.id}>{unicafe.name}</li>
            ))}
          </ul>
          {unicafes.length === 0 && <pre>no unicafes</pre>}
          <form action={createUnicafe} className="flex flex-col">
            <input name="name" placeholder="name" />
            <input name="description" placeholder="description" />
            <button type="submit">create unicafe</button>
          </form>
        </div>
      </div>
    </>
  );
}
