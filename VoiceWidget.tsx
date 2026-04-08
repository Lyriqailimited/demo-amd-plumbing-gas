"use client";

import { useState } from "react";

export default function VoiceWidget() {
  const [open, setOpen] = useState(false);

  return (
    <>
      {/* Backdrop on mobile */}
      {open && (
        <div
          className="fixed inset-0 bg-black/40 z-40 sm:hidden"
          onClick={() => setOpen(false)}
        />
      )}

      <div className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-50 flex flex-col items-end">
        {/* Widget iframe container */}
        {open && (
          <div
            className="
              mb-3 rounded-2xl overflow-hidden shadow-2xl animate-in border border-white/10
              w-[calc(100vw-32px)] h-[calc(100vh-100px)]
              sm:w-[370px] sm:h-[min(560px,calc(100vh-100px))]
              md:w-[390px] md:h-[min(580px,calc(100vh-100px))]
            "
          >
            <iframe
              src="/widget.html"
              className="w-full h-full border-0"
              allow="microphone"
              title="Conveyancing AI Assistant"
            />
          </div>
        )}

        {/* Floating toggle button */}
        <button
          onClick={() => setOpen(!open)}
          className="flex items-center gap-2 bg-[#E8604C] hover:bg-[#D14E3B] text-white rounded-full pl-4 pr-5 py-3 shadow-lg transition-all duration-200 hover:scale-105 cursor-pointer hover:shadow-xl"
        >
          {open ? (
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          ) : (
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z" />
              <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
              <line x1="12" x2="12" y1="19" y2="22" />
            </svg>
          )}
          <span className="text-sm font-semibold">
            {open ? "Close" : "Talk to AI"}
          </span>
        </button>
      </div>
    </>
  );
}