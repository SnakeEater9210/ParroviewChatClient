// @ts-nocheck
import { useState, useEffect, useMemo } from "react";
import Airtable from "airtable";
import { useMessageContext } from "../contexts/ChatContext";
import { useConfirmationModalContext } from "../contexts/ConfirmationModalContext";

interface AirtableRecord {
  id: string;
  fields: Record<string, any>;
}

type Error = {
  message: string;
};

const BASE_PATH = "https://chat.parroview.com/";

export default function useCreateSession() {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);

  const {
    saveMessageToAirtable,
    fetchSessionData,
    sessionData,
    retrieveExistingMessages,
  } = useMessageContext();

  const { interviewConfirmed } = useConfirmationModalContext();

  const [hasSentMessages, setHasSentMessages] = useState<boolean>(
    sessionStorage.getItem("hasSentInitialMessages") === "true"
  );

  const [generatedChatId, setGeneratedChatId] = useState<string>(
    sessionStorage.getItem("chat_id") !== "null"
  );

  useEffect(() => {
    if (!sessionStorage.getItem("chat_id")) {
      sessionStorage.setItem(
        "chat_id",
        Array.from(Array(10), () =>
          Math.floor(Math.random() * 36).toString(36)
        ).join("")
      );
    }
    fetchSessionData();
  }, []);

  const ASSISTANT_MESSAGE =
    "Welcome to the product research interview! I'm an AI research designer, and I'll be conducting this interview to gather insights related to our research goal. We'll have a conversation, and I'll be asking you a series of questions. I'll also ask follow-up questions to better understand your perspective. Please feel free to share your thoughts and experiences in your own words. Before we begin, is everything clear, and do you have any questions?";

  const sessionId = window.location.pathname.split("/")[1];
  const computedChatUrl = BASE_PATH + sessionId;

  useEffect(() => {
    const sessionCreated = sessionStorage.getItem("sessionCreated");
    if (!sessionCreated) {
      createSessionOnAirtable();
    }
  }, []);

  async function checkIfMessagesExist() {
    const response = await retrieveExistingMessages();
    if (response && response.length > 0) {
      return true;
    }
  }

  useEffect(() => {
    const sendMessages = async () => {
      try {
        const messagesExist = await checkIfMessagesExist();
        if (
          interviewConfirmed ||
          Boolean(sessionStorage.getItem("interview_confirmed"))
        ) {
          if (!messagesExist) {
            if (
              sessionData.fields &&
              sessionStorage.getItem("sessionCreated")
            ) {
              let assistantSaveResult;
              await createTranscriptOnAirtable();
              const SYSTEM_MESSAGE = `You are an expert research designer conducting an interview for product research. Your goal is to gather insights and information relevant to ${sessionData.fields["Goal"]}. Make sure to follow the principles of good research design, including asking open-ended and follow-up questions, showing empathy, and avoiding leading questions. Throughout the interview, you will ask the main questions provided by the admin: ${sessionData.fields["Question 1"]}, ${sessionData.fields["Question 2"]}, ${sessionData.fields["Question 3"]}, ${sessionData.fields["Question 4"]}, and ${sessionData.fields["Question 5"]} as well as follow up questions when you see fit. Based on these questions, considering the questions and the potential subquestions you could ask. Guide the conversation based on the participant's responses and delve deeper when you find interesting points related to the goal. End the interview when you have finished asking all of the questions. When an interview has finished, you MUST say that the "interview has concluded", in those exact words (only write the content of the quotations, not the quotatons themself). Do NOT wrap the interview has concluded inside of quotations. If you receive interview_timed_out, in that exact word, in a message from role user then say that the user has run out of time for the interview, do not include the word conclude in the case where a session has timed out.`;
              const systemSaveResult = await saveMessageToAirtable(
                SYSTEM_MESSAGE,
                "system"
              );
              if (sessionData.fields["MessagePrompt"]) {
                const messagePrompt = sessionData.fields["MessagePrompt"];
                assistantSaveResult = await saveMessageToAirtable(
                  messagePrompt,
                  "assistant"
                );
              } else {
                assistantSaveResult = await saveMessageToAirtable(
                  ASSISTANT_MESSAGE,
                  "assistant"
                );
              }
              debugger;
              if (systemSaveResult && assistantSaveResult) {
                setHasSentMessages(true);
                await retrieveExistingMessages();
                sessionStorage.setItem("hasSentInitialMessages", "true");
              } else {
                console.error("Error: Messages were not saved to Airtable.");
              }
            }
          }
        }
      } catch (error) {
        console.error("Error sending initial messages:", error);
      }
    };

    sendMessages();
  }, [sessionData, hasSentMessages, generatedChatId, interviewConfirmed]);

  async function createSessionOnAirtable() {
    const generatedChatId = sessionStorage.getItem("chat_id");
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
              ChatURL: computedChatUrl,
              generatedChatId,
            },
          },
        ],
      }),
    };

    try {
      const response = await fetch(
        `https://api.airtable.com/v0/${
          import.meta.env.VITE_AIRTABLE_BASE_ID
        }/ChatSession`,
        requestOptions
      );
      if (response.ok) {
        sessionStorage.setItem("sessionCreated", "true");
      }
    } catch (error) {
      console.error("Error saving message to Airtable:", error);
      throw error;
    }
  }

  async function createTranscriptOnAirtable() {
    const generatedChatId = sessionStorage.getItem("chat_id");
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
              ChatSessionId: generatedChatId,
            },
          },
        ],
      }),
    };

    try {
      const response = await fetch(
        `https://api.airtable.com/v0/${
          import.meta.env.VITE_AIRTABLE_BASE_ID
        }/Transcripts`,
        requestOptions
      );
    } catch (error) {
      console.error("Error creating transcript in Airtable:", error);
      throw error;
    }
  }

  return {
    isLoading,
    error,
    createSessionOnAirtable,
    hasSentMessages,
  };
}
