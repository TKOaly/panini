"use client";

import { Panini } from "@prisma/client";
import { useEffect, useState } from "react";
import { PaniniImage } from "./PaniniImage";
import { useFormState } from "react-dom";
import type { CreateObservationAction } from "@/services/observation";

type ObservationFormProps = {
  paninis: Panini[];
  action: CreateObservationAction;
};

const PaniniOption = ({
  panini,
  onSelect,
  selected,
}: {
  panini: Panini;
  onSelect: () => void;
  selected: boolean;
}) => (
  <div
    className={`select-none cursor-pointer flex items-center justify-center border-black rounded-md p-2 ${selected ? "bg-yellow-500 hover:bg-yellow-600" : "bg-stone-100 hover:bg-stone-200"}`}
    onClick={onSelect}
  >
    <PaniniImage panini={panini} className="max-w-64 max-md:max-w-32" />
  </div>
);

export const ObservationForm = ({ paninis, action }: ObservationFormProps) => {
  const [selectedPaninis, setSelectedPaninis] = useState<number[]>([]);
  const handleSelect = (id: number) =>
    setSelectedPaninis(
      selectedPaninis.includes(id)
        ? selectedPaninis.filter((selected) => selected !== id)
        : [...selectedPaninis, id],
    );

  const [state, formAction] = useFormState(action, {});

  useEffect(() => {
    setSelectedPaninis([]);
  }, [state.message]);

  return (
    <form
      action={formAction}
      className="border-2 rounded-lg p-2 flex flex-col gap-y-2 w-max max-w-full"
    >
      <div>
        <h2 className="text-xl">Submit an observation</h2>
        <p>Which paninis do you see currently available?</p>
      </div>
      <div className="flex flex-wrap gap-2">
        {paninis.map((panini) => (
          <PaniniOption
            onSelect={() => handleSelect(panini.id)}
            selected={selectedPaninis.includes(panini.id)}
            key={panini.id}
            panini={panini}
          />
        ))}
      </div>
      <input type="hidden" name="paniniIds" value={selectedPaninis.join(";")} />
      <button
        type="submit"
        className="p-2 bg-yellow-500 text-black rounded-md hover:bg-yellow-600 w-max"
      >
        Submit
      </button>
      {state.error && <p className="text-red-500">{state.error}</p>}
    </form>
  );
};
