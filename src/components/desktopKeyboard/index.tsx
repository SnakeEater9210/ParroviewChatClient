// @ts-nocheck
import { useState, ChangeEvent, useCallback, useEffect } from "react";
import SendMessageButton from "../buttons/sendMessageButton";
import TextArea from "../TextArea";
import MicrophoneReturnButton from "../buttons/microphoneReturnButton";
import { useMessageContext } from "../../contexts/ChatContext";

interface HandleChange {
  handleChange: (input: boolean) => void;
}

export default function DesktopKeyboardFlow({ handleChange }: HandleChange) {
  const [content, setContent] = useState<string>("");
  const { processAndSaveUserMessage } = useMessageContext();
  const [isDisabled, setSetDisabled] = useState<boolean>(false);

  const { messages } = useMessageContext() as {
    messages: any[];
  };

  const handleContentChange = (event: ChangeEvent<HTMLTextAreaElement>) => {
    setContent(event.target.value);
  };

  const handleSendMessage = async (event) => {
    event.preventDefault();
    processAndSaveUserMessage(content);
    setContent("");
  };

  useEffect(() => {
    if (
      messages.some(
        (message: { role: string; content: string }) =>
          message.role === "assistant" && message.content.includes("conclude")
      )
    ) {
      setSetDisabled(true);
    }
  }, [messages]);

  const isButtonDisabled = () => {
    const disabled =
      (content === "" ? true : false) ||
      messages.some(
        (message: { role: string; content: string }) =>
          message.role === "assistant" && message.content.includes("conclude")
      );

    return disabled;
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (
      event.key === "Enter" &&
      !event.shiftKey &&
      !event.ctrlKey &&
      !event.altKey
    ) {
      event.preventDefault();
      handleSendMessage(event);
    }
  };

  const buttonOpacity = isButtonDisabled() ? "opacity-50" : "opacity-100";

  return (
    <form className="flex justify-between items-end mx-[1rem]">
      <div className="mb-[0.7rem]">
        <MicrophoneReturnButton onClick={() => handleChange(false)} />
      </div>
      <div className="ml-[1rem] w-[100%] max-w-[85%] mt-[0.5rem]">
        <TextArea
          placeholder="Type something here..."
          onKeyDown={handleKeyDown}
          onChange={handleContentChange}
          value={content}
          disabled={isDisabled}
        />
      </div>
      <div className="relative b-[0.5rem] mx-[0.5rem]">
        <SendMessageButton
          onClick={handleSendMessage}
          disabled={isButtonDisabled()}
          className={buttonOpacity}
        />
      </div>
    </form>
  );
}
