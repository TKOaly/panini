import {
  cachedRecentObesrvations,
  createObservation,
} from "@/services/observation";
import LogIn from "@/components/log-in";
import LogOut from "@/components/log-out";
import { config } from "@/next-auth";
import { getServerSession } from "next-auth";
import { cachedPaninis } from "@/services/panini";
import { cachedUnicafes } from "@/services/unicafe";

export default async function Home() {
  const session = await getServerSession(config);
  const recentObservations = await cachedRecentObesrvations();
  const paninis = await cachedPaninis();
  const unicafes = await cachedUnicafes();

  return (
    <>
      <pre>{JSON.stringify(session, null, 2)}</pre>
      {recentObservations.map((observation) => (
        <pre key={observation.id}>
          {observation.paniniId} {observation.time.toLocaleString()}
        </pre>
      ))}
      {recentObservations.length === 0 && <pre>no panini observations</pre>}
      <form action={createObservation}>
        <select name="paniniId">
          {paninis.map((panini) => (
            <option key={panini.id} value={panini.id}>
              {panini.name}
            </option>
          ))}
        </select>
        <select name="unicafeId">
          {unicafes.map((unicafe) => (
            <option key={unicafe.id} value={unicafe.id}>
              {unicafe.name}
            </option>
          ))}
        </select>
        <button type="submit">observe</button>
      </form>
      <LogIn />
      <LogOut />
    </>
  );
}
