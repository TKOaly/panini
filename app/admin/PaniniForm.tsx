"use client";

import { useRef } from "react";

export type PaniniFormProps = {
  action: (data: FormData) => Promise<void>;
};

export const PaniniForm = ({ action }: PaniniFormProps) => {
  const formRef = useRef<HTMLFormElement>(null);

  return (
    <div>
      <form
        action={async (formData) => {
          await action(formData);
          formRef.current?.reset();
        }}
        ref={formRef}
        className="flex flex-col gap-4"
      >
        <input name="name" placeholder="name" />
        <input name="description" placeholder="description" />
        <input name="image" type="file" />
        <button
          type="submit"
          className="p-2 bg-green-600 text-white rounded-md hover:bg-green-700 w-max"
        >
          create panini
        </button>
      </form>
    </div>
  );
};
