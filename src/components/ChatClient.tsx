// @ts-nocheck
import { useEffect, useRef, useMemo } from "react"; // useState is not used anymore, so it's removed.
import { useMessageContext } from "../contexts/ChatContext";

const BASE_STYLE =
  "px-[1.25rem] py-[0.75rem] mb-[1rem] border border-solid rounded relative";

export default function ChatClient() {
  const {
    messages,
    isLoading: isLoadingContext,
    loadingMessage,
  } = useMessageContext();
  const endOfMessagesRef = useRef(null);

  useEffect(() => {
    endOfMessagesRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  return (
    <>
      {messages?.map((ms, index) => {
        switch (ms.role) {
          case "system":
            return;
          case "user":
            return (
              <div
                className={BASE_STYLE}
                style={{
                  backgroundColor: "#cce5ff",
                  borderColor: "#b8daff",
                  color: "#004085",
                }}
                key={ms.id || index}
              >
                {ms.content}
              </div>
            );
          case "assistant":
            return (
              <div
                className={BASE_STYLE}
                style={{
                  backgroundColor: "#e2e3e5",
                  borderColor: "#d6d8db",
                  color: "black",
                }}
                key={ms.id || index}
              >
                {ms.content}
              </div>
            );
          default:
            return null;
        }
      })}
      <div ref={endOfMessagesRef} />
    </>
  );
}
