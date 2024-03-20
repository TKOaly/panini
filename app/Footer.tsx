"use client";

import { signOut, signIn } from "next-auth/react";
import Link from "next/link";

export const Footer = ({ logged = false }) => {
  return (
    <footer className="mt-auto mb-2 text-stone-400 flex gap-2 justify-center w-full">
      {logged ? (
        <>
          <Link className="border p-2 rounded-lg" href="/admin">
            admin
          </Link>
          <button className="border p-2 rounded-lg" onClick={() => signOut()}>
            sign out
          </button>
        </>
      ) : (
        <button
          className="border p-2 rounded-lg"
          onClick={() => signIn("tkoaly", { callbackUrl: "/admin" })}
        >
          sign in
        </button>
      )}
    </footer>
  );
};
