import type { Metadata } from "next";
import { CreateForm } from "./CreateForm";

export const metadata: Metadata = {
  title: "Make a prediction",
  description: "Say it now. Prove it later.",
};

export default function CreatePage() {
  return (
    <div className="mx-auto max-w-xl px-4 py-12 sm:py-16">
      <h1 className="display text-3xl sm:text-4xl">Make a prediction</h1>
      <p className="mt-2 text-muted">
        It gets a public page, a timestamp and a countdown. You can&apos;t edit
        the text later — that&apos;s the point.
      </p>
      <div className="mt-8">
        <CreateForm />
      </div>
    </div>
  );
}
