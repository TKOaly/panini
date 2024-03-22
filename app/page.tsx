import { createObservation } from "@/services/observation";
import { cachedPaninis, cachedRecentlySeenPaninis } from "@/services/panini";
import { ObservationForm } from "./ObservationForm";
import { RecentlySeenList } from "./RecentlySeenList";

export default async function Home() {
  const paninis = await cachedPaninis();
  const recentlySeenPaninis = await cachedRecentlySeenPaninis();

  if (paninis.length === 0) {
    return (
      <div className="p-4">
        <p>This instance of Dr. Panini has not been set up yet.</p>
        <p>Please ask an adminstrator to add paninis to the system.</p>
      </div>
    );
  }

  return (
    <main className="p-4 flex flex-col gap-y-4 w-full max-w-[80ch]">
      <RecentlySeenList paninis={recentlySeenPaninis} />
      <ObservationForm paninis={paninis} action={createObservation} />
    </main>
  );
}
