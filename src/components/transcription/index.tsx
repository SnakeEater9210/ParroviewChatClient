// @ts-nocheck
import { useEffect } from "react";
import TextArea from "../TextArea";
import CloseButton from "../buttons/closeButton";
import MicrophoneButton from "../buttons/microphoneButton";
import SendMessageButton from "../buttons/sendMessageButton";
import StopRecordingButton from "../buttons/stopRecordingButton";
import { useTranscription } from "../../contexts/TranscriptionContext";
import { useMessageContext } from "../../contexts/ChatContext";

interface HandleChange {
  handleChange: (input: boolean) => void;
}

export default function TranscriptionUI({ handleChange }: HandleChange) {
  const {
    content,
    isTranscribing,
    startTranscribing,
    stopTranscribing,
    setContent,
    socketIsConnected,
  } = useTranscription();

  const handleClose = () => {
    stopTranscribing();
    setContent("");
    handleChange(false);
  };

  const handleSendMessage = (event: { preventDefault: () => void }) => {
    event.preventDefault();
    processAndSaveUserMessage(content);
    setContent("");
    stopTranscribing();
    handleChange(false);
  };

  useEffect(() => {
    startTranscribing();
  }, []);

  const { processAndSaveUserMessage } = useMessageContext();

  function getTranscriptionButton() {
    if (isTranscribing) {
      return <StopRecordingButton onClick={stopTranscribing} />;
    } else {
      return <MicrophoneButton onClick={startTranscribing} />;
    }
  }
  const isSendButtonDisabled = () => {
    return content === "" ? true : false;
  };
  const buttonOpacity = isSendButtonDisabled() ? "opacity-50" : "opacity-100";

  function retrievePlaceholderText() {
    if (socketIsConnected) {
      return "You can talk now, I'm listening";
    }
    if (!socketIsConnected && isTranscribing) {
      return "Connecting...";
    }
    return "Click the microphone to start transcription";
  }

  const handleKeyDown = (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (
      event.key === "Enter" &&
      !event.shiftKey &&
      !event.ctrlKey &&
      !event.altKey
    ) {
      event.preventDefault(); // Prevent the default action (i.e., newline insertion)
      handleSendMessage(event); // Submit the text content
    }
  };

  return (
    <div className="flex flex-col">
      <TextArea
        value={content}
        onKeyDown={handleKeyDown}
        onChange={(e) => setContent(e.target.value)}
        onFocus={() => stopTranscribing()}
        placeholder={retrievePlaceholderText()}
        centerAlignPlaceholder={!socketIsConnected && isTranscribing}
        shouldSetBorderColour={socketIsConnected}
      />
      <div
        id="transcription-buttons"
        className="m-auto flex m-auto justify-center items-end my-[0.5rem]"
      >
        <div className="mr-[1rem]">
          <CloseButton onClick={handleClose} />
        </div>
        {getTranscriptionButton()}
        <div className="ml-[1rem]">
          <SendMessageButton
            onClick={handleSendMessage}
            disabled={isSendButtonDisabled()}
            className={buttonOpacity}
          />
        </div>
      </div>
    </div>
  );
}
