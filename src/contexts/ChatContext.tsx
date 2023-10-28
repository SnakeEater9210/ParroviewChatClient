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

type saveMessageToAirtable = {
  content: string;
  role: string;
};

// Create the context
const MessageContext = createContext();

// Create a provider component
export const MessageProvider = ({ children }) => {
  const [messages, setMessages] = useState<AirtableRecord[]>([]);
  const [loadingMessage, setLoadingMessage] = useState(null);
  const [hasExistingMessages, setHasExistingMessages] =
    useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);
  const [sessionData, setSessionData] = useState<AirtableRecord[]>([]);

  const chatId = sessionStorage.getItem("chat_id");
  const sessionId = window.location.pathname.split("/")[1];

  async function retrieveExistingMessages() {
    const requestOptions = {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${import.meta.env.VITE_AIRTABLE_API_KEY}`,
      },
    };

    try {
      const response = await fetch(
        `https://api.airtable.com/v0/${
          import.meta.env.VITE_AIRTABLE_BASE_ID
        }/Chat Messages?filterByFormula=AND({Session ID}="${encodeURIComponent(
          sessionId
        )}", {ChatSessionId}="${encodeURIComponent(chatId)}")`,
        requestOptions
      );
      const data = await response.json();
      if (data && data.records.length > 0) {
        setHasExistingMessages(true);
        const results = data.records
          .sort(
            (a, b) =>
              new Date(a.createdTime).getTime() -
              new Date(b.createdTime).getTime()
          )
          .map((record) => ({
            role: record.fields.Role,
            content: record.fields.Content,
          }));

        setMessages(results);
        return results;
      }
    } catch (error) {
      console.error("Error retriving messages from Airtable:", error);
    }
  }

  async function saveMessageToAirtable(content, role) {
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
              "Message ID": Date.now(),
              Role: role,
              Content: content,
              ChatSessionId: chatId,
            },
          },
        ],
      }),
    };

    try {
      await fetch(
        `https://api.airtable.com/v0/${
          import.meta.env.VITE_AIRTABLE_BASE_ID
        }/Chat%20Messages`,
        requestOptions
      );

      return { role: role, content: content };
    } catch (error) {
      console.error("Error saving message to Airtable:", error);
    }
  }

  async function fetchSessionData() {
    const requestOptions = {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${import.meta.env.VITE_AIRTABLE_API_KEY}`,
      },
    };

    try {
      const response = await fetch(
        `https://api.airtable.com/v0/${
          import.meta.env.VITE_AIRTABLE_BASE_ID
        }/Session%20Configurations/${sessionId}`,
        requestOptions
      );
      const data = await response.json();
      setSessionData(data);
    } catch (error) {
      console.error("Error fetching sesion data from Airtable:", error);
    }
  }

  async function sendMessageToGPT(messages) {
    const requestOptions = {
      method: "POST",
      headers: {
        "content-type": "application/json",
      },
      body: JSON.stringify({
        messages: messages,
      }),
    };

    try {
      const response = await fetch(
        "https://wqckfnto2bqxg4737vqqxk6rlu0rzaap.lambda-url.eu-west-2.on.aws/",
        requestOptions
      );
      const data = await response.json();
      await saveMessageToAirtable(data.message, "assistant");
      return data.message; // Here, return the GPT's response after saving it to Airtable
    } catch (error) {
      console.error("Error processing message:", error);

      const errorMessage =
        "Oops, something went wrong. Please type 'continue' to proceed with our conversation.";

      await saveMessageToAirtable(errorMessage, "assistant");

      return errorMessage;
    }
  }

  async function processUserMessage(userMessage) {
    const newMessages = [
      ...messages,
      {
        role: "user",
        content: userMessage,
      },
    ];

    setMessages(newMessages);

    return newMessages;
  }

  async function processAndSaveUserMessage(userMessage) {
    const userMsgObject = {
      role: "user",
      content: userMessage,
    };

    // Step 1: Immediately display user's message in UI.
    setMessages((prevMessages) => [...prevMessages, userMsgObject]);

    setIsLoading(true);

    // Step 2: Display the loading message right after the user's message.
    setLoadingMessage({ role: "assistant", content: "...", id: "loading" });
    setMessages((prevMessages) => [
      ...prevMessages,
      { role: "assistant", content: "...", id: "loading" },
    ]);

    try {
      // Step 3: Save user's message to Airtable.
      const savedUserMsg = await saveMessageToAirtable(userMessage, "user");

      // Step 4: Get GPT's response.
      const gptResponse = await sendMessageToGPT([...messages, savedUserMsg]);

      // Step 5: Update the state to display GPT's response and remove the loading message.
      setMessages((prevMessages) => [
        ...prevMessages.filter((msg) => msg.id !== "loading"), // Filter out the loading message.
        {
          role: "assistant",
          content: gptResponse,
        },
      ]);
    } catch (error) {
      console.error("Error processing message:", error);
      const errorMessage =
        "Oops, something went wrong. Please type 'continue' to proceed with our conversation.";
      setMessages((prevMessages) => [
        ...prevMessages.filter((msg) => msg.id !== "loading"), // Filter out the loading message.
        {
          role: "assistant",
          content: errorMessage,
        },
      ]);
      await saveMessageToAirtable(errorMessage, "assistant");
    } finally {
      setLoadingMessage(null);
      setIsLoading(false);
    }
  }

  return (
    <MessageContext.Provider
      value={{
        messages,
        hasExistingMessages,
        isLoading,
        error,
        sessionData,
        processAndSaveUserMessage,
        saveMessageToAirtable,
        sendMessageToGPT,
        retrieveExistingMessages,
        fetchSessionData,
        setMessages,
        loadingMessage,
      }}
    >
      {children}
    </MessageContext.Provider>
  );
};

// Custom hook for accessing the message context
export const useMessageContext = () => {
  const context = useContext(MessageContext);
  if (context === undefined) {
    throw new Error("useMessageContext must be used within a MessageProvider");
  }
  return context;
};
