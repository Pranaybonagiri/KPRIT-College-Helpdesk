import { useState } from "react";
import "./App.css";

function App() {
  const [question, setQuestion] = useState("");
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);

  const sendMessage = async () => {
    if (!question.trim() || loading) return;

    const userQuestion = question.trim();

    setMessages((prev) => [
      ...prev,
      { role: "user", text: userQuestion },
    ]);

    setQuestion("");
    setLoading(true);

    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/chat`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ question: userQuestion }),
      });

      if (!response.ok) {
        throw new Error("Server error");
      }

      const data = await response.json();

      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          text: data.answer,
          sources: data.sources || [],
        },
      ]);
    } catch (error) {
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          text: "Sorry, something went wrong. Please try again.",
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="app">
      <header className="header">
        <div className="logo">🎓</div>
        <div>
          <h1>KPRIT Help Desk</h1>
          <p>AI-powered College Assistant</p>
        </div>
        <div className="status">
          <span></span> Online
        </div>
      </header>

      <main className="chat-container">
        {messages.length === 0 && (
          <div className="welcome">
            <div className="bot-icon">🤖</div>
            <h2>How can I help you?</h2>
            <p>
              Ask me anything about KPRIT — courses, admissions,
              placements, campus facilities and more.
            </p>

            <div className="suggestions">
              <button onClick={() => setQuestion("What is KPRIT?")}>
                What is KPRIT?
              </button>

              <button
                onClick={() =>
                  setQuestion("What courses are offered at KPRIT?")
                }
              >
                Courses offered
              </button>

              <button
                onClick={() =>
                  setQuestion("Tell me about KPRIT admissions")
                }
              >
                Admissions
              </button>

              <button
                onClick={() =>
                  setQuestion("Tell me about KPRIT placements")
                }
              >
                Placements
              </button>
            </div>
          </div>
        )}

        <div className="messages">
          {messages.map((message, index) => (
            <div
              key={index}
              className={`message ${message.role}`}
            >
              <div className="avatar">
                {message.role === "user" ? "👤" : "🤖"}
              </div>

              <div className="message-content">
                <div className="message-name">
                  {message.role === "user" ? "You" : "KPRIT AI"}
                </div>

                <div className="message-text">
                  {message.text}
                </div>

                {message.sources?.length > 0 && (
                  <div className="sources">
                    <small>Sources</small>

                    {message.sources.slice(0, 3).map((source, i) => (
                      <a
                        key={i}
                        href={source.url}
                        target="_blank"
                        rel="noreferrer"
                      >
                        {source.title || "KPRIT Website"}
                      </a>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))}

          {loading && (
            <div className="message assistant">
              <div className="avatar">🤖</div>
              <div className="message-content">
                <div className="message-name">KPRIT AI</div>
                <div className="typing">
                  <span></span>
                  <span></span>
                  <span></span>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>

      <div className="input-area">
        <div className="input-box">
          <input
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") sendMessage();
            }}
            placeholder="Ask anything about KPRIT..."
          />

          <button
            onClick={sendMessage}
            disabled={!question.trim() || loading}
          >
            ➤
          </button>
        </div>

        <p>Powered by Gemini • KPRIT Official Website</p>
      </div>
    </div>
  );
}

export default App;