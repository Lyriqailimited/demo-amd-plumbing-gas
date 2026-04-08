// Entry point for bundling Pipecat dependencies
import { PipecatClient, RTVIEvent } from "@pipecat-ai/client-js";
import { WebSocketTransport } from "@pipecat-ai/websocket-transport";

// Expose to window for use in widget.html
window.PipecatClient = PipecatClient;
window.RTVIEvent = RTVIEvent;
window.WebSocketTransport = WebSocketTransport;
