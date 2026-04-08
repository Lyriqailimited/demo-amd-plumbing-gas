"use client";

import type { PipecatClient as PipecatClientType } from "@pipecat-ai/client-js";
import { AnimatePresence, motion } from "framer-motion";
import { Mic, PhoneOff, Sparkles, X } from "lucide-react";
import {
  startTransition,
  useEffect,
  useRef,
  useState,
  type CSSProperties,
} from "react";

import type { WidgetConfig } from "@/types/site";

function getWidgetStyle(colors: WidgetConfig["colors"]): CSSProperties {
  return {
    "--widget-primary": colors.primary,
    "--widget-primary-hover": colors.primaryHover,
    "--widget-accent": colors.accent,
    "--widget-end": colors.endButton,
    "--widget-end-hover": colors.endButtonHover,
    "--widget-text": colors.text,
    "--widget-subtitle": colors.subtitle,
    "--widget-success": colors.success,
    "--widget-panel": colors.panel,
    "--widget-panel-strong": colors.panelStrong,
  } as CSSProperties;
}

function getPipecatErrorMessage(message: { data: unknown }) {
  if (typeof message.data === "string") {
    return message.data;
  }

  if (
    message.data &&
    typeof message.data === "object" &&
    "message" in message.data &&
    typeof message.data.message === "string"
  ) {
    return message.data.message;
  }

  return "Unknown Pipecat error";
}

export function PipecatWidget({
  config,
  brandName,
}: {
  config: WidgetConfig;
  brandName: string;
}) {
  const [open, setOpen] = useState(false);
  const [connected, setConnected] = useState(false);
  const [busy, setBusy] = useState(false);
  const [transcript, setTranscript] = useState(config.greetingText);
  const [statusText, setStatusText] = useState(config.statusReady);
  const [error, setError] = useState<string | null>(null);

  const clientRef = useRef<PipecatClientType | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const autoOpenedRef = useRef(false);

  useEffect(() => {
    if (!config.autoOpen || autoOpenedRef.current) {
      return;
    }

    autoOpenedRef.current = true;
    const timer = window.setTimeout(() => {
      startTransition(() => setOpen(true));
    }, config.autoOpenDelayMs);
    return () => window.clearTimeout(timer);
  }, [config.autoOpen, config.autoOpenDelayMs]);

  useEffect(() => {
    return () => {
      const client = clientRef.current;
      if (!client) {
        return;
      }

      void client.disconnect().catch(() => undefined);
    };
  }, []);

  useEffect(() => {
    function handleOpenWidget() {
      startTransition(() => setOpen(true));
    }

    function handleCloseWidget() {
      startTransition(() => setOpen(false));
    }

    window.addEventListener("pipecat-widget:open", handleOpenWidget);
    window.addEventListener("pipecat-widget:close", handleCloseWidget);

    return () => {
      window.removeEventListener("pipecat-widget:open", handleOpenWidget);
      window.removeEventListener("pipecat-widget:close", handleCloseWidget);
    };
  }, []);

  async function connect() {
    if (busy) {
      return;
    }

    if (config.assistantId.startsWith("<")) {
      setError(
        "Replace assistantId in src/data/widget-content.json before starting live Pipecat calls.",
      );
      return;
    }

    setBusy(true);
    setError(null);
    setStatusText(config.connectingText);
    setTranscript("Initializing devices...");

    try {
      const [{ PipecatClient, RTVIEvent }, { WebSocketTransport }] =
        await Promise.all([
          import("@pipecat-ai/client-js"),
          import("@pipecat-ai/websocket-transport"),
        ]);

      const client = new PipecatClient({
        transport: new WebSocketTransport(),
        enableMic: true,
        enableCam: false,
        callbacks: {
          onConnected: () => {
            setBusy(false);
            setConnected(true);
            setStatusText(config.statusConnected);
            setTranscript(config.connectedText);
          },
          onDisconnected: () => {
            setBusy(false);
            setConnected(false);
            setStatusText(config.statusReady);
            setTranscript(config.disconnectedText);
            if (audioRef.current) {
              audioRef.current.srcObject = null;
            }
          },
          onBotReady: () => {
            setTranscript(config.agentReadyText);
          },
          onUserTranscript: (data) => {
            if (data?.final && data.text) {
              setTranscript(`You: ${data.text}`);
            }
          },
          onBotTranscript: (data) => {
            if (data?.text) {
              setTranscript(`Assistant: ${data.text}`);
            }
          },
          onError: (event) => {
            setBusy(false);
            setConnected(false);
            setStatusText(config.statusReady);
            setTranscript(config.connectionFailedText);
            setError(getPipecatErrorMessage(event));
          },
        },
      });

      clientRef.current = client;

      client.on(RTVIEvent.TrackStarted, (track, participant) => {
        if (!participant?.local && track.kind === "audio" && audioRef.current) {
          const stream = new MediaStream([track]);
          audioRef.current.srcObject = stream;
        }
      });

      await client.initDevices();
      setTranscript(config.connectingText);

      const response = await fetch(`${config.backendUrl}/frontend/connect`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ assistant_id: config.assistantId }),
      });

      if (!response.ok) {
        throw new Error(`Failed to get WebSocket URL: ${response.status}`);
      }

      const { ws_url: wsUrl } = (await response.json()) as { ws_url: string };
      await client.connect({ wsUrl });
    } catch (cause) {
      const message =
        cause instanceof Error ? cause.message : config.connectionFailedText;

      setBusy(false);
      setConnected(false);
      setStatusText(config.statusReady);
      setTranscript(config.connectionFailedText);
      setError(message);

      if (clientRef.current) {
        try {
          await clientRef.current.disconnect();
        } catch {
          // Ignore cleanup failures after a failed connection attempt.
        }
        clientRef.current = null;
      }
    }
  }

  async function disconnect() {
    if (!clientRef.current) {
      setConnected(false);
      setBusy(false);
      setStatusText(config.statusReady);
      return;
    }

    setBusy(true);

    try {
      await clientRef.current.disconnect();
    } catch {
      setBusy(false);
    } finally {
      clientRef.current = null;
      setBusy(false);
      setConnected(false);
      setStatusText(config.statusReady);
      if (audioRef.current) {
        audioRef.current.srcObject = null;
      }
    }
  }

  async function closePanel() {
    if (connected || busy) {
      await disconnect();
    }
    setOpen(false);
  }

  const visualizerActive = connected || busy;
  const statusClass = connected
    ? "rounded-full border border-emerald-400/30 bg-emerald-500/10 px-4 py-2 text-xs font-medium text-emerald-300"
    : "rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs font-medium text-[color:var(--widget-subtitle)]";

  return (
    <>
      <audio ref={audioRef} autoPlay className="hidden" />

      {open ? (
        <button
          aria-label="Close widget overlay"
          className="fixed inset-0 z-40 bg-black/40 sm:hidden"
          onClick={() => {
            void closePanel();
          }}
        />
      ) : null}

      <div className="fixed bottom-4 right-4 z-50 flex max-w-[calc(100vw-1rem)] flex-col items-end sm:bottom-6 sm:right-6">
        <AnimatePresence>
          {open ? (
            <motion.div
              initial={{ opacity: 0, y: 18, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 14, scale: 0.96 }}
              transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
              style={getWidgetStyle(config.colors)}
              className="mb-3 w-[calc(100vw-1rem)] sm:w-[390px]"
            >
              <div className="overflow-hidden rounded-[30px] border border-white/10 bg-[color:var(--widget-panel)] shadow-glow backdrop-blur-xl">
                <div className="relative overflow-hidden p-5 sm:p-6">
                  <div
                    className="absolute inset-x-0 top-0 h-40"
                    style={{
                      background:
                        "radial-gradient(circle at top, color-mix(in srgb, var(--widget-primary) 28%, transparent), transparent 70%)",
                    }}
                  />

                  <div className="relative flex items-start justify-between gap-4">
                    <div>
                      <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-semibold uppercase tracking-[0.22em] text-[color:var(--widget-accent)]">
                        <Sparkles className="h-3.5 w-3.5" />
                        {config.badgeText}
                      </div>
                      <h2 className="mt-4 text-2xl font-semibold text-[color:var(--widget-text)]">
                        {config.title}
                      </h2>
                      <p className="mt-3 text-sm leading-7 text-[color:var(--widget-subtitle)]">
                        {config.subtitle}
                      </p>
                    </div>

                    <button
                      className="rounded-full border border-white/10 bg-white/5 p-2 text-[color:var(--widget-text)] transition hover:bg-white/10"
                      onClick={() => {
                        void closePanel();
                      }}
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>

                  <div className="relative mt-8 flex flex-col items-center rounded-[28px] border border-white/10 bg-[color:var(--widget-panel-strong)] px-5 py-6">
                    <div className={statusClass}>{statusText}</div>

                    <motion.div
                      className="mt-6 flex h-28 w-28 items-center justify-center rounded-full border border-white/10 bg-[radial-gradient(circle,rgba(255,255,255,0.1),rgba(255,255,255,0.02))]"
                      animate={
                        visualizerActive
                          ? {
                              scale: [1, 1.06, 1],
                              boxShadow: [
                                "0 0 0 color-mix(in srgb, var(--widget-primary) 10%, transparent)",
                                "0 0 42px color-mix(in srgb, var(--widget-primary) 38%, transparent)",
                                "0 0 0 color-mix(in srgb, var(--widget-primary) 10%, transparent)",
                              ],
                            }
                          : { scale: 1 }
                      }
                      transition={{
                        duration: 1.8,
                        ease: "easeInOut",
                        repeat: visualizerActive
                          ? Number.POSITIVE_INFINITY
                          : 0,
                      }}
                    >
                      <div className="flex items-end gap-1.5">
                        {Array.from({ length: 5 }).map((_, index) => (
                          <motion.span
                            key={index}
                            className="w-2 rounded-full bg-[color:var(--widget-text)]"
                            animate={
                              visualizerActive
                                ? { height: [12, 28 - index * 2, 14 + index] }
                                : { height: 10 }
                            }
                            transition={{
                              duration: 0.7,
                              ease: "easeInOut",
                              repeat: visualizerActive
                                ? Number.POSITIVE_INFINITY
                                : 0,
                              repeatType: "mirror",
                              delay: index * 0.08,
                            }}
                          />
                        ))}
                      </div>
                    </motion.div>

                    <p className="mt-6 text-center text-sm leading-7 text-[color:var(--widget-text)]">
                      {transcript}
                    </p>
                  </div>

                  <button
                    className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-[20px] px-4 py-4 text-sm font-semibold text-white transition duration-300"
                    disabled={busy}
                    onClick={() => {
                      void (connected ? disconnect() : connect());
                    }}
                    style={{
                      background: connected
                        ? "var(--widget-end)"
                        : "linear-gradient(135deg, var(--widget-primary), var(--widget-accent))",
                    }}
                  >
                    {connected ? (
                      <PhoneOff className="h-4 w-4" />
                    ) : (
                      <Mic className="h-4 w-4" />
                    )}
                    {busy
                      ? "Working..."
                      : connected
                        ? config.endButtonText
                        : config.startButtonText}
                  </button>

                  {error ? (
                    <div className="mt-4 rounded-[18px] border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm leading-6 text-red-200">
                      {error}
                    </div>
                  ) : null}
                </div>
              </div>
            </motion.div>
          ) : null}
        </AnimatePresence>

        <button
          className="inline-flex items-center gap-2 rounded-full border border-white/10 px-4 py-3 text-sm font-semibold text-white shadow-lg transition duration-300 hover:-translate-y-0.5"
          style={{
            background:
              "linear-gradient(135deg, color-mix(in srgb, var(--widget-primary) 95%, transparent), color-mix(in srgb, var(--widget-accent) 90%, transparent))",
          }}
          onClick={() => {
            setOpen((current) => !current);
          }}
        >
          {open ? <X className="h-4 w-4" /> : <Sparkles className="h-4 w-4" />}
          {open ? `Hide ${brandName}` : config.launcherLabel}
        </button>
      </div>
    </>
  );
}
