// @ts-nocheck
import { useState, useEffect, useMemo, createContext, useContext } from "react";
import Airtable from "airtable";

interface AirtableRecord {
  id: string;
  fields: Record<string, any>;
}

type Error = {
  message: string;
};

// Create the context
const ConfirmationModalContext = createContext();

// Create a provider component
export const ConfirmationModalProvider = ({ children }) => {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);
  const [interviewConfirmed, setInterviewConfirmed] = useState(false);

  const chatId = sessionStorage.getItem("chat_id");
  const sessionId = window.location.pathname.split("/")[1];

  async function saveConfirmationToAirtable({
    fullName,
    email,
    phoneNumber,
    confirmation,
    consent,
  }: {
    fullName: string;
    email: string;
    phoneNumber: string;
    confirmation: boolean;
    consent: boolean;
  }) {
    const chatId = sessionStorage.getItem("chat_id");
    const requestOptions = {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${import.meta.env.VITE_AIRTABLE_API_KEY}`,
      },
      body: JSON.stringify({
        records: [
          {
            fields: {
              "Session ID": sessionId,
              FullName: fullName,
              Email: email,
              SignedPolicy: confirmation,
              Consent: consent,
              PhoneNumber: phoneNumber,
              ChatSessionId: chatId,
            },
          },
        ],
      }),
    };

    try {
      const response = await fetch(
        `https://api.airtable.com/v0/${
          import.meta.env.VITE_AIRTABLE_BASE_ID
        }/InterviewUserData`,
        requestOptions
      );

      const data = await response.json();
      if (data.error) {
        throw new Error(data.error.message);
      }
      setInterviewConfirmed(true);
      return true;
    } catch (error) {
      console.error("Error saving message to Airtable:", error);
    }
  }

  return (
    <ConfirmationModalContext.Provider
      value={{
        isLoading,
        error,
        saveConfirmationToAirtable,
        interviewConfirmed,
      }}
    >
      {children}
    </ConfirmationModalContext.Provider>
  );
};

// Custom hook for accessing the message context
export const useConfirmationModalContext = () => {
  const context = useContext(ConfirmationModalContext);
  if (context === undefined) {
    throw new Error(
      "useConfirmationModalContext must be used within a ConfirmationModalContext"
    );
  }
  return context;
};
