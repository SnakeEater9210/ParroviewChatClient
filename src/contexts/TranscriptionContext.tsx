import {
  createContext,
  useState,
  useRef,
  useContext,
  ReactNode,
  useEffect,
} from "react";
import { io } from "socket.io-client";

interface TranscriptionContextType {
  content: string;
  isTranscribing: boolean;
  startTranscribing: () => void;
  stopTranscribing: () => void;
  setContent: (content: string) => void;
  setupSocket: () => void;
}

const TranscriptionContext = createContext<
  TranscriptionContextType | undefined
>(undefined);

interface TranscriptionProviderProps {
  children: ReactNode;
}

export const TranscriptionProvider = ({
  children,
}: TranscriptionProviderProps) => {
  const serverUrl = "https://parroview.giuseppelaterza.repl.co";

  const [stream, setStream] = useState<MediaStream | null>(null);
  const socket = useRef<any>(null); // Use a ref instead of state
  // const [socket, setSocket] = useState(null);
  const [socketIsConnected, setSocketIsConnected] = useState<boolean>(false);
  const [content, setContent] = useState<string>("");
  const [isTranscribing, setIsTranscribing] = useState<boolean>(false);
  const mediaRecorder = useRef<MediaRecorder | null>(null);

  useEffect(() => {
    if (isTranscribing) {
      navigator.mediaDevices.getUserMedia({ audio: true }).then((_stream) => {
        setStream(_stream);
        const newMediaRecorder = new MediaRecorder(_stream);
        mediaRecorder.current = newMediaRecorder;
        socket.current.on("connect", async () => {
          // socket.on("connect", async () => {
          if (
            mediaRecorder.current &&
            mediaRecorder.current.state === "inactive"
          )
            mediaRecorder.current.start(500);

          mediaRecorder.current &&
            mediaRecorder.current.addEventListener("dataavailable", (event) => {
              socket.current.emit("packet-sent", event.data);
              // socket.emit("packet-sent", event.data);
            });
        });
      });
    }
  }, [isTranscribing]);

  function stopRecording() {
    if (mediaRecorder.current) {
      mediaRecorder.current.stop();
      mediaRecorder.current = null;
    }
    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
      setStream(null);
    }
    socket.current?.disconnect();
    socket.current = null; // Clear the socket.
    // socket.disconnect();
  }

  function setupSocket() {
    const newSocket = io(serverUrl, { transports: ["websocket"] });
    socket.current = newSocket;

    newSocket.on("print-transcript", (msg) => {
      setContent((prevContent) => {
        if (prevContent.length > 0 && prevContent.slice(-1) !== " ") {
          return prevContent + " " + msg;
        }
        return msg;
      });
    });

    newSocket.on("connect", () => {
      setSocketIsConnected(true);
    });
  }

  function startTranscribing() {
    setupSocket();

    setIsTranscribing(true);
  }

  function stopTranscribing() {
    stopRecording();
    socket.current = null;
    // setSocket(null);
    setIsTranscribing(false);
    setSocketIsConnected(false);
  }

  const value = {
    content,
    isTranscribing,
    startTranscribing,
    stopTranscribing,
    setupSocket,
    socketIsConnected,
    setContent,
  };

  return (
    <TranscriptionContext.Provider value={value}>
      {children}
    </TranscriptionContext.Provider>
  );
};

export function useTranscription() {
  const context = useContext(TranscriptionContext);
  if (!context) {
    throw new Error(
      "useTranscription must be used within a TranscriptionProvider"
    );
  }
  return context;
}
