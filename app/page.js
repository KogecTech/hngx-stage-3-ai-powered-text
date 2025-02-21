"use client";
import { useState, useEffect, useRef } from "react";

export default function TranslatorApp() {
  const [inputText, setInputText] = useState("");
  const [messages, setMessages] = useState([]);
  const [detectedLanguage, setDetectedLanguage] = useState("");
  const [selectedLanguage, setSelectedLanguage] = useState("");
  const [darkMode, setDarkMode] = useState(false);
  const [error, setError] = useState(null);
  const chatBoxRef = useRef(null);
  const messageRefs = useRef({});

  // Auto-scroll chat container when new messages arrive
  useEffect(() => {
    if (chatBoxRef.current) {
      chatBoxRef.current.scrollTop = chatBoxRef.current.scrollHeight;
    }
  }, [messages]);

  // Scroll a specific message into view when an action is performed
  const scrollMessageIntoView = (msgId) => {
    setTimeout(() => {
      if (messageRefs.current[msgId]) {
        messageRefs.current[msgId].scrollIntoView({
          behavior: "smooth",
          block: "nearest",
        });
      }
    }, 100);
  };

  // Detects language of input text. Ensures the detected language has a high confidence level before using it.
  const detectLanguage = async (text) => {
    try {
      if (!text.trim()) {
        setError("Input cannot be empty.");
        return null;
      }

      if (!("ai" in self && "languageDetector" in self.ai)) {
        console.log("Language detection API is unavailable.");
        return "Unknown";
      }

      const languageDetectorCapabilities =
        await self.ai.languageDetector.capabilities();

      if (languageDetectorCapabilities.available === "no") {
        console.log("The language detector isn't Available.");
        return "Unknown";
      }

      let detector;

      const canDetect = languageDetectorCapabilities.capabilities;

      if (canDetect === "readily") {
        detector = await self.ai.languageDetector.create();
        // console.log("The language detector can immediately be used.");
      } else {
        // console.log("The language detector can be used after model download.")
        detector = await self.ai.languageDetector.create({
          // monitor(m) {
          //   m.addEventListener('downloadprogress', (e) => {
          //     console.log(`Downloaded ${e.loaded} of ${e.total} bytes.`);
          //   });
          // },
        });
        await detector.ready;
      }

      const results = await detector.detect(text);

      if (results.length > 0) {
        const { detectedLanguage, confidence } = results[0];

        if (confidence < 0.5) {
          setError("Check the spelling to be sure");
          return "Unknown";
        }

        return detectedLanguage;
      }

      return "Unknown";
    } catch (error) {
      console.error("Error detecting language:", error);
      setError("Failed to detect language.");
      return "Unknown";
    }
  };

  // Handle Summarize action on a specific message
  const handleSummarize = async (msgId, text) => {
    try {
      const options = {
        sharedContext: "This is a scientific article",
        type: "key-points",
        format: "markdown",
        length: "medium",
      };

      const capabilities = await self.ai.summarizer.capabilities();

      if (capabilities.available === "no") {
        console.log("The Summarizer API isn't usable.");
        return;
      }

      let summarizer = await self.ai.summarizer.create(options);

      await summarizer.ready;

      const summary = await summarizer.summarize(text);

      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === msgId ? { ...msg, summary: summary } : msg
        )
      );

      scrollMessageIntoView(msgId);
    } catch (error) {
      console.error("summarization error:", error);
      setError("Failed to summarize the text.");
    }
  };

  // Handle Translate action on a specific message
  const handleTranslate = async (msgId, text, lang) => {
    try {
      if (!("ai" in self && "translator" in self.ai)) {
        console.log("Translation API is unavailable.");
        return;
      }

      const translatorCapabilities = await self.ai.translator.capabilities();

      const available = translatorCapabilities.available;

      if (available === "no") {
        console.log("The Translator API isn't usable.");
        return;
      }

      const translator = await self.ai.translator.create({
        sourceLanguage: lang,
        targetLanguage: lang,
        monitor(m) {
          console.log("The translator can be used after model download.");

          m.addEventListener("downloadprogress", (e) => {
            console.log(`Downloaded ${e.loaded} of ${e.total} bytes.`);
          });
        },
      });

      const translated = await translator.translate(text);
      setSelectedLanguage(translated);
      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === msgId ? { ...msg, translation: translated } : msg
        )
      );
      scrollMessageIntoView(msgId);
    } catch (error) {
      console.error("Translation error:", error);
      setError("Failed to translate text.");
    }
  };

  // Handle sending a new message
  const handleSend = async () => {
    try {
      setError(null);

      if (!inputText.trim()) {
        setError("Please enter some text before sending.");
        return;
      }
      const detected = await detectLanguage(inputText);

      setDetectedLanguage(detected);

      const newMsg = {
        id: messages.length + 1,
        text: inputText,
        language: detected,
      };
      setMessages((prev) => [...prev, newMsg]);
      setInputText("");
    } catch (error) {
      console.error("Send error:", error);
      setError("Failed to send message.");
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  // Dynamic styling for light/dark mode
  const bgClass = darkMode
    ? "bg-gradient-to-br from-[#605C3C] via-[#3C3B3F] to-[#3C3B3F]"
    : "bg-gradient-to-br from-[#24243e] via-[#302b63] to-[#3b8d99]";
  const appBg = darkMode
    ? "bg-gradient-to-br from-[#e0eafc] via-[#3C3B3F] to-[#cfdef3]"
    : "bg-gradient-to-br from-[#24243e] via-[#302b63] to-[#3b8d99]";
  const headerBg = darkMode
    ? "bg-gradient-to-br from-[#2c3e50] via-[#2c3e50] to-[#bdc3c7]"
    : "bg-gradient-to-r from-indigo-800 to-purple-700";
  const textBg = darkMode
    ? "bg-gray-700 text-white border-gray-500 focus:ring-indigo-500"
    : "bg-gray-700 text-white border-gray-300 focus:ring-blue-300";
  const footerBg = darkMode
    ? "bg-gradient-to-br from-[#24243e] via-[#302b63] to-[#3b8d99]"
    : "bg-gradient-to-br from-[#605C3C] via-[#3C3B3F] to-[#3C3B3F]";

  return (
    <div
      className={`min-h-screen  ${bgClass} items-center justify-center p-4 transition-colors duration-300`}
    >
      {/* Full-Width Header */}
      <header
        className={`w-full  ${headerBg} py-4 px-6 flex items-center justify-between fixed top-0 left-0 right-0 z-50`}
      >
        <h1 className="sigmar-regular text-2xl font-bold tracking-wide">
          Powerful AI Translator{" "}
        </h1>
        {/* Mode Toggle: Icon only, at top-right */}
        <button
          className="absolute right-6 top-4 p-2 rounded-full bg-gray-200 dark:bg-gray-600 hover:bg-gray-300 dark:hover:bg-gray-500 transition-colors"
          onClick={() => setDarkMode(!darkMode)}
          aria-label="Toggle Dark Mode"
        >
          {darkMode ? "🌙" : "☀️"}
        </button>
      </header>

      {/* container for main content  */}
      <div
        className={`w-md min-w-100 max-w-lg md:max-w-xl lg:max-w-2xl ${appBg} rounded-lg fmt-10 shadow-xl overflow-hidden mt-[64px] m-auto`}
      >
        {/* Main Content */}
        <div className="flex flex-col h-[calc(100vh-64px)] justify-center2">
          {error && (
            <p className="fixed bg-black text-red-500 text-sm">{error}</p>
          )}
          {messages.length === 0 ? (
            // No messages: center the input box (with visible border & spacing)
            <div className="flex-grow flex flex-col items-center justify-center">
              <p className="text-center flex w-full justify-center text-white p-8 m-8">
                Type a message to get started.
              </p>
              <div className="w-full max-w-md p-4 border border-gray-300 rounded-lg shadow-lg bg-white text-black">
                <textarea
                  className="w-full p-2 resize-none focus:outline-none focus:ring focus:ring-blue-300"
                  placeholder="Type your message here..."
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  onKeyDown={handleKeyDown}
                  rows={3}
                ></textarea>
                <button
                  className="mt-2 w-full bg-purple-500 hover:bg-blue-600 text-white py-2 px-4 rounded transition"
                  onClick={handleSend}
                >
                  Send
                </button>
              </div>
            </div>
          ) : (
            <>
              {/* Chat Messages at Top (no visible border, just spacing) */}
              <main
                ref={chatBoxRef}
                className="flex-grow p-4 overflow-y-auto space-y-4"
              >
                {messages.map((msg) => (
                  <div
                    key={msg.id}
                    ref={(el) => (messageRefs.current[msg.id] = el)}
                    className="p-4 my-6 rounded-lg shadow transition-colors duration-300 bg-pink-200 text-black"
                  >
                    <p className="text-base">{msg.text}</p>
                    <small className="text-sm text-gray-500 block mt-1">
                      Language: {msg.language}
                    </small>
                    {msg.summary && (
                      <div className="w-full p-4 bg-black  mt-2 text-blue-500 font-semibold border border-green-300 rounded-lg shadow-lg">
                        Summary: {msg.summary}
                      </div>
                    )}
                    {msg.translation && (
                      <div className="w-full p-4 bg-black  mt-2 text-green-500 font-semibold border border-blue-300 rounded-lg shadow-lg">
                        Translation: {msg.translation}
                      </div>
                    )}
                    {/* Message-specific Action Controls */}
                    <div className="mt-3 flex flex-wrap items-center gap-3">
                      {msg.language === "en" && msg.text.length > 150 && (
                        <button
                          onClick={() => handleSummarize(msg.id, msg.text)}
                          className="bg-blue-700 hover:bg-blue-800 text-white px-3 py-1 rounded transition-colors"
                        >
                          Summarize
                        </button>
                      )}
                      <div className="flex items-center gap-2">
                        <select
                          className="rounded border px-2 py-1 bg-white dark:bg-gray-700 text-black dark:text-white border-gray-300 dark:border-gray-600"
                          onChange={(e) =>
                            handleTranslate(msg.id, msg.text, e.target.value)
                          }
                          defaultValue="en"
                        >
                          <option value="en">English</option>
                          <option value="pt">Portuguese</option>
                          <option value="es">Spanish</option>
                          <option value="ru">Russian</option>
                          <option value="tr">Turkish</option>
                          <option value="fr">French</option>
                        </select>
                        <button
                          onClick={() =>
                            handleTranslate(msg.id, msg.text, "en")
                          }
                          className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded transition-colors"
                        >
                          Translate
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </main>

              {/* Input Section at Bottom */}
              <footer
                className={`p-4 ${footerBg} transition-colors duration-300`}
              >
                <div className="max-w-lg mx-auto flex items-center">
                  <textarea
                    className={`flex-1 p-1 border rounded resize-none focus:outline-none focus:ring-2 ${textBg} transition-colors duration-300`}
                    placeholder="Type your message here..."
                    value={inputText}
                    onChange={(e) => setInputText(e.target.value)}
                    onKeyDown={handleKeyDown}
                    rows={3}
                  ></textarea>
                  <button
                    className="ml-2 bg-blue-500 hover:bg-blue-600 text-white px-6 py-6 rounded shadow transition-all"
                    onClick={handleSend}
                    aria-label="Send Message"
                  >
                    ➤
                  </button>
                </div>
              </footer>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
