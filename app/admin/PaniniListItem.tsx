"use client";

import Image from "next/image";
import { MouseEventHandler, useState } from "react";
import { useFormState } from "react-dom";
import { Panini } from "@prisma/client";
import { PaniniImage } from "../PaniniImage";
import type { DestroyPaniniAction, EditPaniniAction } from "@/services/panini";
import edit from "@/assets/edit.svg";
import cross from "@/assets/cross.svg";

export const PaniniListItem = ({
  panini,
  editAction,
  deleteAction,
}: {
  panini: Panini;
  editAction: EditPaniniAction;
  deleteAction: DestroyPaniniAction;
}) => {
  const verifyDelete: MouseEventHandler<HTMLButtonElement> = (e) => {
    if (!confirm(`Are you sure you want to delete panini "${panini.name}"?`)) {
      e.preventDefault();
      return;
    }
  };

  const [editState, editFormAction] = useFormState(editAction, {});
  const [deleteState, deleteFormAction] = useFormState(deleteAction, {});
  const [toggleEdit, setToggleEdit] = useState(false);

  return (
    <div className="min-w-96 flex flex-col gap-x-2 border-2 rounded-lg p-2 relative">
      {!toggleEdit ? (
        <>
          <h3 className="text-lg font-semibold">{panini.name}</h3>
          <p>{panini.description || "No description"}</p>
          <PaniniImage panini={panini} className="max-w-96" />
          {deleteState.error && (
            <p className="text-red-500">{deleteState.error}</p>
          )}
        </>
      ) : (
        <form action={editFormAction} className="flex flex-col gap-4">
          <input type="hidden" name="id" value={panini.id} />
          <input
            name="name"
            defaultValue={panini.name}
            aria-label="name"
            className="max-w-72 border rounded border-gray-300 px-2"
          />
          <input
            name="description"
            defaultValue={panini.description ?? ""}
            aria-label="description"
            className="max-w-72 border rounded border-gray-300 px-2"
          />
          <input name="image" type="file" />
          <button
            type="submit"
            className="py-1 px-2 font-bold hover:bg-black/10 border border-black w-max active:scale-95 transition"
          >
            save
          </button>
          {editState.error && <p className="text-red-500">{editState.error}</p>}
        </form>
      )}
      <div className="absolute top-2 right-2 space-x-2">
        <button
          type="button"
          className="h-8 w-8 rounded-full border border-black hover:bg-gray-50"
          title="Edit"
          onClick={() => setToggleEdit((prev) => !prev)}
        >
          <Image src={edit} alt="Edit" height={16} className="mx-auto" />
        </button>
        <form action={deleteFormAction} className="inline">
          <input type="hidden" name="id" value={panini.id} />
          <button
            title="Delete"
            type="submit"
            className="h-8 w-8 rounded-full border border-black hover:bg-gray-50"
            onClick={verifyDelete}
          >
            <Image src={cross} alt="Delete" height={12} className="mx-auto" />
          </button>
        </form>
      </div>
    </div>
  );
};
