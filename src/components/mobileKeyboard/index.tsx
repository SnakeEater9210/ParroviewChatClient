// @ts-nocheck
import { useState, ChangeEvent } from "react";
import SendMessageButton from "../buttons/sendMessageButton";
import TextArea from "../TextArea";
import { useMessageContext } from "../../contexts/ChatContext";

export default function MobileKeyboardFlow() {
  const [content, setContent] = useState<string>("");
  const { processAndSaveUserMessage } = useMessageContext();

  const isButtonDisabled = () => {
    return content === "" ? true : false;
  };

  const buttonOpacity = isButtonDisabled() ? "opacity-50" : "opacity-100";
  const handleContentChange = (event: ChangeEvent<HTMLTextAreaElement>) => {
    setContent(event.target.value);
  };

  const handleSendMessage = (event) => {
    event.preventDefault();
    processAndSaveUserMessage(content);
    setContent("");
  };

  return (
    <form className="flex justify-between align-center items-end">
      <div className="w-[100%] max-w-[85%]">
        <TextArea
          placeholder="Type something here..."
          onChange={handleContentChange}
          value={content}
          shouldSetBorderColur={true}
        />
      </div>
      <div className="mx-[0.5rem]">
        <SendMessageButton
          onClick={handleSendMessage}
          disabled={isButtonDisabled()}
          className={buttonOpacity}
        />
      </div>
    </form>
  );
}
