// @ts-nocheck
import { useEffect, useState } from "react";

import MicrophoneButton from "../buttons/microphoneButton";
import KeyboardButton from "../buttons/keyboardButton";
import TranscriptionUI from "../transcription";
import DesktopKeyboardFlow from "../desktopKeyboard";
import { useMessageContext } from "../../contexts/ChatContext";
import { useTranscription } from "../../contexts/TranscriptionContext";
import ConfirmationModal from "../ConfirmationModal";
import { useConfirmationModalContext } from "../../contexts/ConfirmationModalContext";
import RedirectNotification from "../RedirectNotification";

export default function BaseState() {
  const [showTranscriptionUI, setShowTranscriptionUI] =
    useState<boolean>(false);
  const [showKeyboardUI, setShowKeyboardUI] = useState<boolean>(false);
  const { isLoading, messages, fetchSessionData, sessionData } =
    useMessageContext() as {
      isLoading: boolean;
      messages: any[];
    };
  const [isDisabled, setSetDisabled] = useState<boolean>(false);
  const [showConfirmationModal, setShowConfirmationModal] =
    useState<boolean>(true);

  const [showRedirectionToast, setShowRedirectionToast] =
    useState<boolean>(false);

  const { interviewConfirmed } = useConfirmationModalContext();

  useEffect(() => {
    if (sessionStorage.getItem("interview_confirmed")) {
      setShowConfirmationModal(false);
    }
  }, [interviewConfirmed]);

  useEffect(() => {
    fetchSessionData();
  }, []);

  const { setupSocket } = useTranscription();

  function handleTranscriptionChange() {
    setShowTranscriptionUI(false);
  }

  function handleShowKeyboardUIChange() {
    setShowKeyboardUI(false);
  }

  useEffect(() => {
    // console.log(sessionData);
    setSetDisabled(isLoading);
    if (
      messages.some(
        (message: { role: string; content: string }) =>
          message.role === "assistant" && message.content.includes("conclude")
      )
    ) {
      setSetDisabled(true);
      if (sessionData && sessionData.fields) {
        if (sessionData.fields["RedirectUrl"]) {
          if (!showRedirectionToast) {
            setShowRedirectionToast(true);
          }
          setTimeout(() => {
            window.location.replace(sessionData.fields["RedirectUrl"]);
          }, 5000);
        }
      }
    }
  }, [isLoading, messages, sessionData, showRedirectionToast]);

  if (showTranscriptionUI) {
    return (
      <div className="flex flex-col justify-between mx-auto">
        <TranscriptionUI handleChange={handleTranscriptionChange} />
      </div>
    );
  }

  if (showKeyboardUI) {
    return (
      <div className="flex flex-col justify-between mx-auto">
        <DesktopKeyboardFlow handleChange={handleShowKeyboardUIChange} />
      </div>
    );
  }

  function renderBaseStateUI() {
    setupSocket();
    return (
      <>
        <KeyboardButton
          onClick={() => setShowKeyboardUI(true)}
          disabled={isDisabled}
          style={{ opacity: isDisabled ? "0.5" : "1" }}
        />
        <MicrophoneButton
          onClick={() => setShowTranscriptionUI(true)}
          disabled={isDisabled}
          style={{ opacity: isDisabled ? "0.5" : "1" }}
        />
      </>
    );
  }

  return (
    <div className="max-w-[50%]">
      <div className="flex justify-between align-center ml-[1rem]">
        <div className="flex justify-between align-center w-[100%]">
          {renderBaseStateUI()}
          {showConfirmationModal && <ConfirmationModal />}
          {showRedirectionToast && (
            <RedirectNotification
              body="You have completed the interview."
              subText="You will be redirected to the next page in 5 seconds."
            />
          )}
        </div>
      </div>
    </div>
  );
}
