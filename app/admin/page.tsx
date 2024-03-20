import { cachedPaninis, createPanini, destroyPanini } from "@/services/panini";
import { config } from "@/next-auth";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { PaniniForm } from "./PaniniForm";
import { PaniniListItem } from "./PaniniListItem";

export default async function Admin() {
  const session = await getServerSession(config);
  const paninis = await cachedPaninis();

  if (!session?.user?.admin) {
    redirect("/");
  }

  return (
    <div className="grid grid-cols-[1fr_max-content] gap-8 p-4 max-lg:grid-rows-[max-content_max-content] max-lg:grid-cols-1">
      <div className="flex flex-wrap gap-2">
        {paninis.map((panini) => (
          <PaniniListItem
            key={panini.id}
            panini={panini}
            action={destroyPanini}
          />
        ))}
        {paninis.length === 0 && <pre>no paninis</pre>}
      </div>
      <div className="max-lg:-order-1 h-max">
        <h2 className="font-semibold text-lg">Create a panini</h2>
        <PaniniForm action={createPanini} />
      </div>
    </div>
  );
}
