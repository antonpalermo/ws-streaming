import React from "react";

export default function App() {
  const [isRecording, setIsRecording] = React.useState(false);

  const webSocketRef = React.useRef<WebSocket | null>(null);
  const mediaRecorderRef = React.useRef<MediaRecorder | null>(null);

  React.useEffect(() => {
    if (
      !webSocketRef.current ||
      webSocketRef.current.readyState === WebSocket.CLOSED
    ) {
      webSocketRef.current = new WebSocket("ws://localhost:8080");
      const websocket = webSocketRef.current;

      websocket.onopen = () => {
        console.log("WebSocket connected");
      };

      websocket.onerror = (error) => {
        console.error("WebSocket error:", error);
      };
    }

    if (
      webSocketRef.current &&
      webSocketRef.current.readyState === WebSocket.OPEN
    ) {
      webSocketRef.current.close();
    }
  }, []);

  async function getDisplayMedia() {
    // Ensure WebSocket is connected first
    if (
      !webSocketRef.current ||
      webSocketRef.current.readyState !== WebSocket.OPEN
    ) {
      throw new Error("WebSocket is not connected");
    }

    const stream = await navigator.mediaDevices.getDisplayMedia({
      video: true,
    });

    mediaRecorderRef.current = new MediaRecorder(stream);
    const websocket = webSocketRef.current;
    const recorder = mediaRecorderRef.current;

    recorder.ondataavailable = async (e) => {
      try {
        if (websocket?.readyState === WebSocket.OPEN) {
          websocket.send(
            JSON.stringify({
              type: "RECORDING_START:REQUEST",
              chunk: new Uint8Array(await e.data.arrayBuffer()),
            })
          );
        } else {
          console.error("WebSocket is not in OPEN state");
          recorder.stop();
        }
      } catch (error) {
        console.error("Error sending data:", error);
        recorder.stop();
      }
    };

    recorder.onstop = () => {
      setIsRecording(false);
      if (websocket?.readyState === WebSocket.OPEN) {
        websocket.send(
          JSON.stringify({
            type: "RECORDING_END:REQUEST",
            chunk: new Uint8Array([]),
          })
        );
      } else {
        console.error("WebSocket is not in OPEN state");
        recorder.stop();
      }
    };

    recorder.start(100);
    setIsRecording(true);
  }

  return (
    <div>
      <h1>Streaming Client</h1>
      <p>Open the console to see the messages</p>

      <button onClick={getDisplayMedia} disabled={isRecording}>
        Share Screen
      </button>
    </div>
  );
}
