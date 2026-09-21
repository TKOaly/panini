"use client";

import type { Panini } from "@/src/generated/browser";
import { Fragment, useEffect, useState } from "react";
import { PaniniImage } from "../PaniniImage";

const relativeFormatter = new Intl.RelativeTimeFormat("en", {
  style: "narrow",
});
const RelativeTime = ({
  time,
  className,
}: {
  time: Date;
  className?: string;
}) => {
  "use client";

  const [now, setNow] = useState(new Date());
  useEffect(() => {
    const interval = setInterval(() => {
      setNow(new Date());
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  let timeString = "";
  const diff = now.getTime() - time.getTime();

  const buckets: [number, Intl.RelativeTimeFormatUnit, number][] = [
    [1000 * 60, "second", 1000],
    [1000 * 60 * 60, "minute", 1000 * 60],
    [1000 * 60 * 60 * 24, "hour", 1000 * 60 * 60],
  ];

  if (diff < 1000 * 5) {
    timeString = "just now";
  } else {
    for (const [cutoff, unit, divisor] of buckets) {
      if (diff < cutoff) {
        timeString = relativeFormatter.format(
          -1 * Math.floor(diff / divisor),
          unit,
        );
        break;
      }
    }
  }

  return (
    <time
      className={className}
      dateTime={time.toISOString()}
      suppressHydrationWarning
    >
      {timeString}
    </time>
  );
};

export const DoubleColumnRecentlySeenList = ({
  paninis,
}: {
  paninis: (Panini & {
    _count: {
      observations: number;
    };
  } & {
    observations: {
      id: number;
      time: Date;
      paniniId: number;
    }[];
  })[];
}) => {
  if (paninis.length === 0) {
    return (
      <div className="flex min-h-0 flex-1 items-center justify-center text-center">
        <p className="text-2xl">No paninis have been observed today.</p>
      </div>
    );
  }

  const sortedPaninis = [...paninis].sort(
    (a, b) =>
      new Date(b.observations[0].time).getTime() -
      new Date(a.observations[0].time).getTime(),
  );

  return (
    <div className="grid min-h-0 flex-1 grid-cols-[5rem_minmax(8rem,1fr)_3rem_5rem_minmax(8rem,1fr)_3rem] items-center gap-x-3 gap-y-1 overflow-hidden text-center [&>*:nth-child(6n+4)]:pl-3">
      <p className="text-xl font-semibold">Last seen</p>
      <p className="text-xl font-semibold">Suspect</p>
      <p className="text-xl font-semibold">Today</p>
      <p className="text-xl font-semibold">Last seen</p>
      <p className="text-xl font-semibold">Suspect</p>
      <p className="text-xl font-semibold">Today</p>
      {sortedPaninis.map((panini) => {
        return (
          <Fragment key={panini.id}>
            <RelativeTime
              className="text-xl font-semibold tabular-nums"
              time={new Date(panini.observations[0].time)}
            />
            <PaniniImage
              panini={panini}
              className="max-h-[11dvh] object-contain"
            />
            <span className="text-3xl font-bold tabular-nums">
              {panini._count.observations}
            </span>
          </Fragment>
        );
      })}
    </div>
  );
};
