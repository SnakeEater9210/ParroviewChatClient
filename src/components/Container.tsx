import { useEffect, useState } from "react";
import ChatClient from "./ChatClient";
import MobileKeyboardFlow from "./mobileKeyboard";
import BaseState from "./baseState";
import useCreateSession from "../hooks/useCreateSession";
import { useMessageContext } from "../contexts/ChatContext";

interface SessionData {
  fields: {
    StudyName: string;
  };
}

export default function Container() {
  const [isMobile, setIsMobile] = useState(false);
  const { sessionData } = useMessageContext() as {
    sessionData: SessionData;
  };

  useCreateSession();
  useEffect(() => {
    setIsMobile(window.innerWidth <= 768);

    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
    };

    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, [window.innerWidth]);

  function renderMobileKeyboard() {
    return (
      <>
        <MobileKeyboardFlow />
      </>
    );
  }

  return (
    <div className="flex flex-col h-screen">
      <div className="h-full flex-grow mb-[1rem] overflow-y-hidden">
        <div className="flex flex-col h-full mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 mt-[1rem] flex align-end">
          {sessionData?.fields && (
            <div className="p-2 flex flex-col items-start sm:flex-row sm:mx-12 sm:items-end justify-between my-2">
              <h2 className="mt-2 text-3xl font-bold tracking-tight text-gray-900">
                {sessionData.fields["StudyName"]}
              </h2>
              {/* <a
                href="https://www.parroview.com"
                target="_blank"
                rel="noreferrer"
                className="text-blue-600"
              >
                Create an interview like this!
              </a> */}
            </div>
          )}
          <div
            className="h-full mx-auto max-w-3xl transform-40 p-[1rem] overflow-y-auto w-[100%] border border-solid border-gray-200"
            style={{ backgroundColor: "#f8f9fa" }}
          >
            <ChatClient />
          </div>
        </div>
      </div>
      <div
        className={`${
          isMobile ? "h-22" : "h-35"
        } p-2 border border-solid border-gray-200`}
        style={{ backgroundColor: "#F8F9FA" }}
        id="input-section"
      >
        {isMobile ? renderMobileKeyboard() : <BaseState />}
      </div>
    </div>
  );
}
