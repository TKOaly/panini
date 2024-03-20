"use client";

import { Panini } from "@prisma/client";
import { Fragment, useEffect, useState } from "react";
import { PaniniImage } from "./PaniniImage";

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

export const RecentlySeenList = ({
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
      <div>
        <p>No paninis have been observed in the last 24 hours.</p>
      </div>
    );
  }

  const sortedPaninis = paninis.sort(
    (a, b) =>
      new Date(b.observations[0].time).getTime() -
      new Date(a.observations[0].time).getTime(),
  );

  return (
    <div className="grid grid-cols-3 items-center text-center">
      <p className="font-semibold">Last seen</p>
      <p className="font-semibold">Suspect</p>
      <p className="font-semibold">Today</p>
      {sortedPaninis.map((panini) => {
        return (
          <Fragment key={panini.id}>
            <RelativeTime time={new Date(panini.observations[0].time)} />
            <PaniniImage panini={panini} />
            <span className="text-xl">{panini._count.observations}</span>
          </Fragment>
        );
      })}
    </div>
  );
};
