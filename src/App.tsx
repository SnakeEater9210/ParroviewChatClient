import { ConfirmationModalProvider } from "./contexts/ConfirmationModalContext";
("./contexts/ConfirmationModalContext");
import Container from "./components/Container";
import { MessageProvider } from "./contexts/ChatContext";
import { TranscriptionProvider } from "./contexts/TranscriptionContext";

function App() {
  return (
    <MessageProvider>
      <TranscriptionProvider>
        <ConfirmationModalProvider>
          <div className="App">
            <Container />
          </div>
        </ConfirmationModalProvider>
      </TranscriptionProvider>
    </MessageProvider>
  );
}

export default App;
