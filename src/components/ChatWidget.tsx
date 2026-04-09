"use client";
import { useState, useEffect } from "react";
import { PhoneCall } from "lucide-react";

export default function ChatWidget() {
  const WIDGET_URL = "https://widget-amd-plumbing-gas.vercel.app";
  const PRIMARY_COLOR = "#003366";
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    if (!sessionStorage.getItem("widget-opened")) {
      sessionStorage.setItem("widget-opened", "1");
      const timer = window.setTimeout(() => setIsOpen(true), 0);
      return () => window.clearTimeout(timer);
    }
  }, []);

  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (event.data?.type === "widget-minimize") setIsOpen(false);
    };
    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  }, []);

  useEffect(() => {
    const handleOpen = () => setIsOpen(true);
    window.addEventListener("pipecat-widget:open", handleOpen);
    return () => window.removeEventListener("pipecat-widget:open", handleOpen);
  }, []);

  return (
    <>
      {isOpen && (
        <div className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm sm:hidden" onClick={() => setIsOpen(false)} />
      )}
      <div className="fixed bottom-4 right-4 z-50 max-sm:left-4 sm:bottom-6 sm:right-6">
        {isOpen && (
          <div className="mb-4 max-sm:w-full max-sm:h-[calc(100vh-7rem)] sm:w-[400px] sm:h-[620px] rounded-2xl overflow-hidden shadow-2xl">
            <iframe src="https://widget-amd-plumbing-gas.vercel.app/" className="w-full h-full border-0" allow="microphone" title="Voice Assistant" />
          </div>
        )}
        <button
          onClick={() => setIsOpen(!isOpen)}
          style={{ background: PRIMARY_COLOR }}
          className="ml-auto flex items-center justify-center w-14 h-14 rounded-full text-white shadow-lg transition-all duration-200 hover:opacity-90 cursor-pointer"
          aria-label={isOpen ? "Close assistant" : "Open assistant"}
        >
          {isOpen ? (
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          ) : (
            <PhoneCall size={24} strokeWidth={2.2} />
          )}
        </button>
      </div>
    </>
  );
}
