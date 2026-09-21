import { cachedPaninis, cachedRecentlySeenPaninis } from "@/services/panini";
import { DoubleColumnRecentlySeenList } from "./DoubleColumnRecentlySeenList";

export default async function InfoScreenPage() {
  const paninis = await cachedPaninis();
  const recentlySeenPaninis = await cachedRecentlySeenPaninis();

  if (paninis.length === 0) {
    return (
      <main className="flex h-[calc(100dvh-7rem)] w-full max-w-[80ch] flex-col items-center justify-center gap-2 p-4 text-center">
        <p className="text-xl font-semibold">
          This instance of Dr. Panini has not been set up yet.
        </p>
        <p>
          Please ask an administrator to add paninis to the system.
        </p>
      </main>
    );
  }

  return (
    <main className="flex h-[calc(100dvh-5rem)] w-full max-w-[80ch] flex-col gap-y-2 overflow-hidden p-3">
      <p className="text-center text-lg font-semibold">
        Report panini sightings at panini.tko-aly.fi
      </p>
      <DoubleColumnRecentlySeenList paninis={recentlySeenPaninis} />
    </main>
  );
}
