import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { projectsAPI, chatAPI } from "../services/api";
import { PaperAirplaneIcon, ArrowLeftIcon } from "@heroicons/react/24/outline";

const Chat = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [project, setProject] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");
  const [conversationId, setConversationId] = useState(null);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    fetchProject();
  }, [id]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const fetchProject = async () => {
    try {
      const response = await projectsAPI.getProject(id);
      setProject(response.data.project);
    } catch (error) {
      setError("Failed to fetch project");
    } finally {
      setLoading(false);
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || sending) return;

    const userMessage = {
      role: "user",
      content: newMessage.trim(),
      timestamp: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setNewMessage("");
    setSending(true);

    try {
      const response = await chatAPI.sendMessage({
        project_id: id,
        message: userMessage.content,
        conversation_id: conversationId,
      });

      const aiMessage = {
        role: "assistant",
        content: response.data.message,
        timestamp: new Date().toISOString(),
      };

      setMessages((prev) => [...prev, aiMessage]);
      setConversationId(response.data.conversation_id);
    } catch (error) {
      setError("Failed to send message. Please try again.");
      // Remove the user message if sending failed
      setMessages((prev) => prev.slice(0, -1));
    } finally {
      setSending(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage(e);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin border-primary-600 w-12 h-12 border-b-2 rounded-full"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="py-12 text-center">
        <p className="text-red-600">{error}</p>
        <button
          onClick={() => navigate("/projects")}
          className="btn-primary mt-4"
        >
          Back to Projects
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen">
      {/* Header */}
      <div className="px-6 py-4 bg-white border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => navigate(`/projects/${id}`)}
              className="hover:text-gray-600 text-gray-400"
            >
              <ArrowLeftIcon className="w-6 h-6" />
            </button>
            <div>
              <h1 className="text-xl font-semibold text-gray-900">
                {project?.name}
              </h1>
              <p className="text-sm text-gray-500">
                Chat with your AI assistant
              </p>
            </div>
          </div>
          <div className="text-sm text-gray-500">Model: {project?.model}</div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 p-6 space-y-4 overflow-y-auto">
        {messages.length === 0 ? (
          <div className="py-12 text-center">
            <div className="mb-4 text-gray-400">
              <svg
                className="w-12 h-12 mx-auto"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                />
              </svg>
            </div>
            <h3 className="mb-2 text-lg font-medium text-gray-900">
              Start a conversation
            </h3>
            <p className="text-gray-500">
              Send a message to begin chatting with your AI assistant.
            </p>
          </div>
        ) : (
          messages.map((message, index) => (
            <div
              key={index}
              className={`flex text-black ${
                message.role === "user" ? "justify-end" : "justify-start"
              }`}
            >
              <div
                className={`max-w-3xl px-4 py-2 rounded-lg ${
                  message.role === "user"
                    ? "bg-gray-200 text-black"
                    : "bg-gray-200 text-gray-900"
                }`}
              >
                <div className="whitespace-pre-wrap">{message.content}</div>
                <div
                  className={`text-xs mt-1 ${
                    message.role === "user"
                      ? "text-primary-100"
                      : "text-gray-500"
                  }`}
                >
                  {new Date(message.timestamp).toLocaleTimeString()}
                </div>
              </div>
            </div>
          ))
        )}
        {sending && (
          <div className="flex justify-start">
            <div className="px-4 py-2 text-gray-900 bg-gray-100 rounded-lg">
              <div className="flex items-center space-x-2">
                <div className="animate-spin w-4 h-4 border-b-2 border-gray-600 rounded-full"></div>
                <span>AI is typing...</span>
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="px-6 py-4 bg-white border-t border-gray-200">
        <form onSubmit={handleSendMessage} className="flex space-x-4">
          <div className="flex-1">
            <textarea
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Type your message here..."
              className="focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent w-full px-4 py-2 border border-gray-300 rounded-lg resize-none"
              rows={1}
              disabled={sending}
            />
          </div>
          <button
            type="submit"
            disabled={!newMessage.trim() || sending}
            className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center px-4 py-2"
          >
            <PaperAirplaneIcon className="w-5 h-5" />
          </button>
        </form>
        <p className="mt-2 text-xs text-gray-500">
          Press Enter to send, Shift+Enter for new line
        </p>
      </div>
    </div>
  );
};

export default Chat;
