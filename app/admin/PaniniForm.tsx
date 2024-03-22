"use client";

import { CreatePaniniAction } from "@/services/panini";
import { useEffect, useRef } from "react";
import { useFormState } from "react-dom";

export type PaniniFormProps = {
  action: CreatePaniniAction;
};

export const PaniniForm = ({ action }: PaniniFormProps) => {
  const formRef = useRef<HTMLFormElement>(null);
  const [state, formAction] = useFormState(action, {});

  useEffect(() => {
    formRef.current?.reset();
  }, [state.message]);

  return (
    <div>
      <form action={formAction} ref={formRef} className="flex flex-col gap-4">
        <input name="name" placeholder="name" />
        <input name="description" placeholder="description" />
        <input name="image" type="file" />
        <button
          type="submit"
          className="p-2 bg-green-600 text-white rounded-md hover:bg-green-700 w-max"
        >
          create panini
        </button>
        {state.error && <p className="text-red-500">{state.error}</p>}
      </form>
    </div>
  );
};
