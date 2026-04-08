"use client";

import { useState, useRef, useEffect, useCallback, type CSSProperties } from "react";
import type { WidgetConfig } from "@/types/site";

export default function VoiceWidget({ config }: { config: WidgetConfig }) {
  const [open, setOpen] = useState(false);
  const [connected, setConnected] = useState(false);
  const [transcript, setTranscript] = useState(config.greetingText);
  const [error, setError] = useState("");
  const [status, setStatus] = useState(config.statusReady);
  const [scriptLoaded, setScriptLoaded] = useState(false);

  const clientRef = useRef<any>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const micStreamRef = useRef<MediaStream | null>(null);

  // Auto-open widget on page load
  useEffect(() => {
    if (!config.autoOpen) return;
    const timer = setTimeout(() => setOpen(true), config.autoOpenDelayMs);
    return () => clearTimeout(timer);
  }, [config.autoOpen, config.autoOpenDelayMs]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if ((window as any).PipecatClient) {
      setScriptLoaded(true);
      return;
    }
    const script = document.createElement("script");
    script.src = config.scriptPath;
    script.async = true;
    script.onload = () => setScriptLoaded(true);
    document.body.appendChild(script);
    return () => {};
  }, [config.scriptPath]);

  const showError = useCallback((msg: string) => {
    setError(msg);
    setTimeout(() => setError(""), 5000);
  }, []);

  const updateUI = useCallback(
    (isConnected: boolean) => {
      setConnected(isConnected);
      setStatus(isConnected ? config.statusConnected : config.statusReady);
    },
    [config.statusConnected, config.statusReady]
  );

  const connectCall = useCallback(async () => {
    if (!scriptLoaded) return;
    const win = window as any;
    const { PipecatClient, RTVIEvent, WebSocketTransport } = win;
    if (!PipecatClient) {
      showError("Voice SDK not loaded");
      return;
    }

    try {
      setError("");
      const clientConfig = {
        transport: new WebSocketTransport(),
        enableMic: true,
        enableCam: false,
        callbacks: {
          onConnected: () => {
            updateUI(true);
            setTranscript(config.connectedText);
          },
          onDisconnected: () => {
            updateUI(false);
            setTranscript(config.disconnectedText);
          },
          onBotReady: () => {
            setTranscript(config.agentReadyText);
          },
          onUserTranscript: (data: any) => {
            if (data.final) setTranscript(`${config.userTranscriptPrefix}: ${data.text}`);
          },
          onBotTranscript: (data: any) => {
            setTranscript(`${config.agentTranscriptPrefix}: ${data.text}`);
          },
          onError: (err: any) => {
            showError(err?.message || "Unknown error");
          },
        },
      };

      const client = new PipecatClient(clientConfig);
      clientRef.current = client;

      client.on(RTVIEvent.TrackStarted, (track: any, participant: any) => {
        if (!participant?.local && track.kind === "audio" && audioRef.current) {
          const stream = new MediaStream([track]);
          audioRef.current.srcObject = stream;
        }
      });

      // Acquire mic with browser-native noise suppression (requires HTTPS)
      setTranscript(config.initializingMicText);
      if (navigator.mediaDevices?.getUserMedia) {
        try {
          const micStream = await navigator.mediaDevices.getUserMedia({
            audio: {
              noiseSuppression: true,
              echoCancellation: true,
              autoGainControl: true,
            },
          });
          micStreamRef.current = micStream;
        } catch {
          // Noise suppression unavailable, continue without it
        }
      }

      setTranscript(config.initializingDevicesText);
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

      const { ws_url } = await response.json();
      await client.connect({ wsUrl: ws_url });
    } catch (err: any) {
      showError(err.message || "Connection failed");
      updateUI(false);
      setTranscript(config.connectionFailedText);
    }
  }, [scriptLoaded, showError, updateUI]);

  const disconnectCall = useCallback(async () => {
    if (clientRef.current) {
      try {
        await clientRef.current.disconnect();
      } catch {
        /* ignore */
      }
      clientRef.current = null;
      updateUI(false);
    }
    // Stop noise-suppressed mic stream
    if (micStreamRef.current) {
      micStreamRef.current.getTracks().forEach((t) => t.stop());
      micStreamRef.current = null;
    }
  }, [updateUI]);

  const toggleCall = useCallback(() => {
    if (connected) {
      disconnectCall();
    } else {
      connectCall();
    }
  }, [connected, connectCall, disconnectCall]);

  useEffect(() => {
    return () => {
      if (clientRef.current) {
        clientRef.current.disconnect().catch(() => {});
      }
      if (micStreamRef.current) {
        micStreamRef.current.getTracks().forEach((t) => t.stop());
      }
    };
  }, []);

  const widgetVars = {
    "--vw-primary": config.primaryColor,
    "--vw-accent": config.accentColor,
    "--vw-end-btn": config.endButtonColor,
    "--vw-panel-bg": config.panelBgColor,
    "--vw-title-color": config.titleColor,
  } as CSSProperties;

  return (
    <div style={widgetVars}>
      <audio ref={audioRef} autoPlay style={{ display: "none" }} />

      {/* Floating trigger button */}
      <button
        onClick={() => setOpen((p) => !p)}
        aria-label={config.fabAriaLabel}
        className="voice-widget-fab"
      >
        {open ? (
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        ) : (
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z" />
            <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
            <line x1="12" x2="12" y1="19" y2="22" />
          </svg>
        )}
      </button>

      {/* Widget panel */}
      {open && (
        <div className="voice-widget-panel">
          {/* Gradient bg */}
          <div className="voice-widget-gradient" />

          {/* Header */}
          <div style={{ position: "relative", zIndex: 10, padding: "24px 28px 0", flexShrink: 0 }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={config.logoUrl}
              alt={config.logoAlt}
              className="object-contain dark:filter-none logo-light-filter"
              style={{ height: 32, width: "auto", marginBottom: 16, transition: "filter 0.3s ease" }}
            />
            <h2 className="voice-widget-title">
              {config.title}
            </h2>
            <p className="voice-widget-subtitle">
              {config.subtitle}
            </p>
          </div>

          {/* Visualizer */}
          <div className="voice-widget-visualizer">
            {/* Status badge */}
            <div className={`voice-widget-status ${connected ? "connected" : "disconnected"}`}>
              <div
                className={connected ? "widget-status-dot-pulse" : ""}
                style={{
                  width: 8,
                  height: 8,
                  borderRadius: "50%",
                  background: connected ? config.successColor : "var(--vw-status-dot)",
                }}
              />
              <span>{status}</span>
            </div>

            <div
              style={{
                position: "relative",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              {/* Ripple effects */}
              <div className={connected ? "widget-ripple active" : "widget-ripple"} />
              <div className={connected ? "widget-ripple delayed active" : "widget-ripple delayed"} />

              {/* Core circle */}
              <div className={`widget-core-circle${connected ? " active" : ""}`}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 4, height: 48 }}>
                  {[0, 1, 2, 3, 4].map((i) => (
                    <div
                      key={i}
                      className={connected ? "widget-bar active" : "widget-bar"}
                      style={{
                        width: 8,
                        height: 8,
                        background: "#fff",
                        borderRadius: 9999,
                        opacity: 0.9,
                        transition: "height 0.3s ease",
                      }}
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Action area */}
          <div className="voice-widget-action">
            {/* Transcript */}
            <div
              style={{
                textAlign: "center",
                marginBottom: 20,
                minHeight: 48,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                padding: "0 12px",
              }}
            >
              <p className="voice-widget-transcript">
                {transcript}
              </p>
            </div>

            {/* Call button */}
            <button
              onClick={toggleCall}
              className={`voice-widget-call-btn ${connected ? "end" : "start"}`}
            >
              {connected ? (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
                </svg>
              ) : (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z" />
                  <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
                  <line x1="12" x2="12" y1="19" y2="22" />
                </svg>
              )}
              <span>
                {connected ? config.endButtonText : config.startButtonText}
              </span>
            </button>

            {/* Error */}
            {error && (
              <div className="voice-widget-error">
                {error}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Widget styles - theme aware */}
      <style>{`
        /* ── Widget CSS variables ── */
        :root {
          --vw-panel-bg: rgba(255, 255, 255, 0.95);
          --vw-panel-border: rgba(168, 85, 247, 0.15);
          --vw-panel-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.15);
          --vw-gradient: linear-gradient(135deg, rgba(124, 58, 237, 0.04) 0%, rgba(245, 243, 255, 0.4) 100%);
          --vw-title-color: #1a1a2e;
          --vw-subtitle-color: #64748b;
          --vw-transcript-color: #1e293b;
          --vw-action-bg: rgba(248, 245, 255, 0.8);
          --vw-action-border: rgba(168, 85, 247, 0.1);
          --vw-status-disconnected-bg: rgba(100, 116, 139, 0.08);
          --vw-status-disconnected-color: #64748b;
          --vw-status-disconnected-border: rgba(100, 116, 139, 0.15);
          --vw-status-connected-bg: rgba(16, 185, 129, 0.08);
          --vw-status-connected-color: #059669;
          --vw-status-connected-border: rgba(16, 185, 129, 0.25);
          --vw-status-dot: #94a3b8;
          --vw-error-bg: rgba(239, 68, 68, 0.06);
          --vw-error-border: rgba(239, 68, 68, 0.2);
          --vw-error-color: #dc2626;
        }

        .dark {
          --vw-panel-bg: rgba(15, 10, 30, 0.85);
          --vw-panel-border: rgba(168, 85, 247, 0.2);
          --vw-panel-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
          --vw-gradient: linear-gradient(135deg, rgba(124, 58, 237, 0.08) 0%, rgba(15, 10, 30, 0.4) 100%);
          --vw-title-color: #f1f5f9;
          --vw-subtitle-color: #94a3b8;
          --vw-transcript-color: #f1f5f9;
          --vw-action-bg: rgba(15, 10, 30, 0.5);
          --vw-action-border: rgba(124, 58, 237, 0.15);
          --vw-status-disconnected-bg: rgba(148, 163, 184, 0.1);
          --vw-status-disconnected-color: #94a3b8;
          --vw-status-disconnected-border: rgba(148, 163, 184, 0.2);
          --vw-status-connected-bg: rgba(16, 185, 129, 0.1);
          --vw-status-connected-color: #34d399;
          --vw-status-connected-border: rgba(16, 185, 129, 0.3);
          --vw-status-dot: #64748b;
          --vw-error-bg: rgba(239, 68, 68, 0.1);
          --vw-error-border: rgba(239, 68, 68, 0.3);
          --vw-error-color: #f87171;
        }

        /* ── FAB ── */
        .voice-widget-fab {
          position: fixed;
          bottom: 24px;
          right: 24px;
          z-index: 9999;
          width: 56px;
          height: 56px;
          border-radius: 50%;
          background: linear-gradient(135deg, var(--vw-primary) 0%, var(--vw-accent) 100%);
          border: none;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 4px 24px color-mix(in srgb, var(--vw-primary) 40%, transparent);
          transition: transform 0.2s, box-shadow 0.2s;
        }
        .voice-widget-fab:hover {
          transform: scale(1.08);
        }

        /* ── Panel ── */
        .voice-widget-panel {
          position: fixed;
          bottom: 92px;
          right: 24px;
          z-index: 9998;
          width: 480px;
          height: 66vh;
          max-height: 720px;
          border-radius: 32px;
          background: var(--vw-panel-bg);
          backdrop-filter: blur(20px);
          border: 1px solid var(--vw-panel-border);
          box-shadow: var(--vw-panel-shadow);
          overflow: hidden;
          display: flex;
          flex-direction: column;
          font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Oxygen, Ubuntu, sans-serif;
        }

        .voice-widget-gradient {
          position: absolute;
          inset: 0;
          background: var(--vw-gradient);
          z-index: 0;
          pointer-events: none;
        }

        .voice-widget-title {
          font-size: 2rem;
          font-weight: 400;
          color: var(--vw-title-color);
          line-height: 1.2;
          margin-bottom: 10px;
          font-family: Georgia, 'Times New Roman', serif;
        }

        .voice-widget-subtitle {
          color: var(--vw-subtitle-color);
          font-size: 0.95rem;
          line-height: 1.5;
          max-width: 400px;
        }

        /* ── Visualizer ── */
        .voice-widget-visualizer {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          flex: 1;
          min-height: 180px;
          padding: 16px 32px;
          position: relative;
          z-index: 10;
        }

        .widget-core-circle {
          width: 110px;
          height: 110px;
          border-radius: 50%;
          background: linear-gradient(135deg, var(--vw-primary) 0%, var(--vw-accent) 100%);
          display: flex;
          align-items: center;
          justify-content: center;
          position: relative;
          z-index: 10;
          box-shadow: 0 0 30px 5px color-mix(in srgb, var(--vw-primary) 30%, transparent);
          transition: box-shadow 0.3s ease, transform 0.3s ease;
        }
        .widget-core-circle.active {
          box-shadow: 0 0 40px 10px color-mix(in srgb, var(--vw-accent) 40%, transparent);
          animation: widget-pulse-circle 1.5s ease-in-out infinite;
        }

        /* ── Status badge ── */
        .voice-widget-status {
          white-space: nowrap;
          margin-bottom: 24px;
          padding: 6px 16px;
          border-radius: 9999px;
          font-size: 14px;
          font-weight: 500;
          display: flex;
          align-items: center;
          gap: 8px;
          transition: all 0.3s ease;
        }
        .voice-widget-status.disconnected {
          background: var(--vw-status-disconnected-bg);
          color: var(--vw-status-disconnected-color);
          border: 1px solid var(--vw-status-disconnected-border);
        }
        .voice-widget-status.connected {
          background: var(--vw-status-connected-bg);
          color: var(--vw-status-connected-color);
          border: 1px solid var(--vw-status-connected-border);
        }

        /* ── Action area ── */
        .voice-widget-action {
          padding: 24px 28px;
          position: relative;
          z-index: 10;
          background: var(--vw-action-bg);
          border-top: 1px solid var(--vw-action-border);
          backdrop-filter: blur(10px);
          flex-shrink: 0;
        }

        .voice-widget-transcript {
          font-size: 1.05rem;
          font-weight: 500;
          color: var(--vw-transcript-color);
          transition: opacity 0.3s ease;
        }

        /* ── Call button ── */
        .voice-widget-call-btn {
          width: 100%;
          padding: 16px;
          border-radius: 16px;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 12px;
          font-size: 1.1rem;
          font-weight: 600;
          border: none;
          cursor: pointer;
          transition: all 0.3s ease;
          box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
          color: white;
        }
        .voice-widget-call-btn:hover {
          transform: translateY(-1px);
          box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.15);
        }
        .voice-widget-call-btn:active {
          transform: scale(0.98);
        }
        .voice-widget-call-btn.start {
          background: linear-gradient(135deg, var(--vw-primary) 0%, var(--vw-accent) 100%);
        }
        .voice-widget-call-btn.start:hover {
          background: linear-gradient(135deg, color-mix(in srgb, var(--vw-primary) 85%, black) 0%, color-mix(in srgb, var(--vw-accent) 85%, black) 100%);
        }
        .voice-widget-call-btn.end {
          background: var(--vw-end-btn);
        }
        .voice-widget-call-btn.end:hover {
          background: color-mix(in srgb, var(--vw-end-btn) 85%, black);
        }

        /* ── Error ── */
        .voice-widget-error {
          margin-top: 16px;
          padding: 12px;
          background: var(--vw-error-bg);
          border: 1px solid var(--vw-error-border);
          border-radius: 12px;
          color: var(--vw-error-color);
          font-size: 14px;
          text-align: center;
        }

        /* ── Animations ── */
        @keyframes widget-pulse-circle {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.1); }
        }
        .widget-bar.active:nth-child(1) { animation: widget-bar-anim 0.6s ease-in-out infinite alternate; animation-delay: 0.1s; }
        .widget-bar.active:nth-child(2) { animation: widget-bar-anim 0.6s ease-in-out infinite alternate; animation-delay: 0.2s; }
        .widget-bar.active:nth-child(3) { animation: widget-bar-anim 0.6s ease-in-out infinite alternate; animation-delay: 0.3s; }
        .widget-bar.active:nth-child(4) { animation: widget-bar-anim 0.6s ease-in-out infinite alternate; animation-delay: 0.4s; }
        .widget-bar.active:nth-child(5) { animation: widget-bar-anim 0.6s ease-in-out infinite alternate; animation-delay: 0.5s; }
        @keyframes widget-bar-anim {
          0% { height: 10px; }
          100% { height: 32px; }
        }
        .widget-ripple {
          position: absolute;
          inset: 0;
          border-radius: 50%;
          opacity: 0;
          transform: scale(1);
        }
        .widget-ripple.active {
          animation: widget-ripple-anim 2s ease-out infinite;
          background: color-mix(in srgb, var(--vw-accent) 20%, transparent);
        }
        .widget-ripple.delayed.active {
          animation: widget-ripple-anim-small 2s ease-out infinite;
          animation-delay: 0.5s;
          background: color-mix(in srgb, var(--vw-accent) 20%, transparent);
        }
        @keyframes widget-ripple-anim {
          0% { opacity: 0; transform: scale(1); }
          50% { opacity: 0.4; }
          100% { opacity: 0; transform: scale(2); }
        }
        @keyframes widget-ripple-anim-small {
          0% { opacity: 0; transform: scale(1); }
          50% { opacity: 0.4; }
          100% { opacity: 0; transform: scale(1.5); }
        }
        .widget-status-dot-pulse {
          animation: widget-dot-pulse 1s ease-in-out infinite;
        }
        @keyframes widget-dot-pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }

        /* ── Responsive ── */

        /* Short viewports — shrink circle and spacing */
        @media (max-height: 700px) {
          .voice-widget-panel {
            bottom: 76px;
          }
          .voice-widget-visualizer {
            padding: 12px 24px;
            min-height: 150px;
          }
          .widget-core-circle {
            width: 88px;
            height: 88px;
          }
          .voice-widget-title {
            font-size: 1.5rem;
            margin-bottom: 6px;
          }
          .voice-widget-subtitle {
            font-size: 0.85rem;
            line-height: 1.4;
          }
          .voice-widget-action {
            padding: 14px 24px;
          }
          .voice-widget-status {
            margin-bottom: 12px;
            font-size: 12px;
          }
          .voice-widget-transcript {
            font-size: 1rem;
          }
        }

        /* Tablets & small laptops */
        @media (max-width: 768px) {
          .voice-widget-panel {
            width: calc(100vw - 48px);
            right: 24px;
          }
        }

        /* Mobile */
        @media (max-width: 520px) {
          .voice-widget-fab {
            bottom: 16px;
            right: 16px;
            width: 50px;
            height: 50px;
          }
          .voice-widget-panel {
            width: calc(100vw - 24px);
            right: 12px;
            left: 12px;
            bottom: 78px;
            border-radius: 24px;
          }
          .voice-widget-panel > div:first-child + div {
            padding: 20px 20px 0 !important;
          }
          .voice-widget-title {
            font-size: 1.4rem;
            margin-bottom: 6px;
          }
          .voice-widget-subtitle {
            font-size: 0.85rem;
            line-height: 1.4;
          }
          .voice-widget-status {
            font-size: 11px;
            padding: 4px 10px;
            margin-bottom: 10px;
          }
          .voice-widget-action {
            padding: 14px 20px;
          }
          .voice-widget-transcript {
            font-size: 0.9rem;
          }
          .voice-widget-visualizer {
            padding: 10px 20px;
            min-height: 140px;
          }
          .widget-core-circle {
            width: 84px;
            height: 84px;
          }
          .voice-widget-call-btn {
            padding: 14px;
            font-size: 1rem;
            border-radius: 14px;
          }
        }

        /* Very small phones */
        @media (max-width: 380px) {
          .voice-widget-fab {
            bottom: 12px;
            right: 12px;
            width: 46px;
            height: 46px;
          }
          .voice-widget-panel {
            width: calc(100vw - 16px);
            right: 8px;
            left: 8px;
            bottom: 70px;
            border-radius: 20px;
          }
          .voice-widget-title {
            font-size: 1.25rem;
          }
          .voice-widget-subtitle {
            font-size: 0.75rem;
          }
          .voice-widget-visualizer {
            padding: 8px 16px;
            min-height: 120px;
          }
          .widget-core-circle {
            width: 72px;
            height: 72px;
          }
          .voice-widget-action {
            padding: 12px 16px;
          }
          .voice-widget-call-btn {
            padding: 12px;
            font-size: 0.95rem;
            border-radius: 12px;
          }
        }
      `}</style>
    </div>
  );
}
