"use client";

import { Panini } from "@prisma/client";
import { PaniniImage } from "../PaniniImage";
import { MouseEventHandler } from "react";
import { DestroyPaniniAction } from "@/services/panini";
import { useFormState } from "react-dom";

export const PaniniListItem = ({
  panini,
  action,
}: {
  panini: Panini;
  action: DestroyPaniniAction;
}) => {
  const verifyDelete: MouseEventHandler<HTMLButtonElement> = (e) => {
    if (!confirm(`Are you sure you want to delete panini "${panini.name}"?`)) {
      e.preventDefault();
      return;
    }
  };

  const [state, formAction] = useFormState(action, {});

  return (
    <form
      key={panini.id}
      action={formAction}
      className="min-w-96 flex flex-col gap-x-2 border-2 rounded-lg p-2 relative"
    >
      <div>
        <h3 className="text-lg font-semibold">{panini.name}</h3>
        <p>{panini.description || "No description"}</p>
      </div>
      <input type="hidden" name="id" value={panini.id} />
      <PaniniImage panini={panini} className="max-w-96" />
      {state.error && <p className="text-red-500">{state.error}</p>}
      <button
        type="submit"
        className="
    absolute top-2 right-2 p-2 bg-red-500 text-white rounded-md hover:bg-red-600"
        onClick={verifyDelete}
      >
        Delete
      </button>
    </form>
  );
};
