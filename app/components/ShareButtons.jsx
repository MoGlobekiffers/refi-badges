"use client";
import { useEffect, useState } from "react";

export default function ShareButtons({ imageUrl, title }) {
  const [url, setUrl] = useState("");
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined") setUrl(window.location.href);
  }, []);

  const onCopy = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 1200);
    } catch {}
  };

  return (
    <div className="flex flex-wrap gap-2 mt-4">
      <button
        onClick={onCopy}
        className="px-3 py-2 rounded-xl border text-sm hover:bg-black/5 active:scale-[.98] transition"
      >
        {copied ? "Link copied" : "Copy link"}
      </button>
      {imageUrl ? (
        <a
          href={imageUrl}
          download
          title={title ?? "image"}
          className="px-3 py-2 rounded-xl border text-sm hover:bg-black/5 active:scale-[.98] transition"
        >
          Download image
        </a>
      ) : null}
    </div>
  );
}
