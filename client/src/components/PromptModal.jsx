import { useState, useEffect } from "react";
import { XMarkIcon } from "@heroicons/react/24/outline";
import { promptsAPI } from "../services/api";

const PromptModal = ({
  isOpen,
  onClose,
  projectId,
  prompt = null,
  onSuccess,
}) => {
  const [formData, setFormData] = useState({
    name: "",
    content: "",
    type: "system",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (prompt) {
      setFormData({
        name: prompt.name || "",
        content: prompt.content || "",
        type: prompt.type || "system",
      });
    } else {
      setFormData({
        name: "",
        content: "",
        type: "system",
      });
    }
    setError("");
  }, [prompt, isOpen]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      if (prompt) {
        // Update existing prompt
        await promptsAPI.updatePrompt(prompt.id, formData);
      } else {
        // Create new prompt
        await promptsAPI.createPrompt({
          ...formData,
          project_id: projectId,
        });
      }
      onSuccess();
      onClose();
    } catch (error) {
      setError(error.response?.data?.error || "Failed to save prompt");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-screen items-center justify-center p-4">
        <div
          className="fixed inset-0 bg-gray-500 bg-opacity-75"
          onClick={onClose}
        />
        <div className="relative bg-white rounded-lg shadow-xl max-w-2xl w-full">
          <div className="flex items-center justify-between p-6 border-b">
            <h3 className="text-lg font-semibold text-gray-900">
              {prompt ? "Edit Prompt" : "Add New Prompt"}
            </h3>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              <XMarkIcon className="h-6 w-6" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="p-6">
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-md mb-4">
                {error}
              </div>
            )}

            <div className="space-y-4">
              <div>
                <label
                  htmlFor="name"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Prompt Name *
                </label>
                <input
                  id="name"
                  name="name"
                  type="text"
                  required
                  className="input-field"
                  placeholder="e.g., System Instructions, Welcome Message"
                  value={formData.name}
                  onChange={handleChange}
                />
              </div>

              <div>
                <label
                  htmlFor="type"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Prompt Type
                </label>
                <select
                  id="type"
                  name="type"
                  className="input-field"
                  value={formData.type}
                  onChange={handleChange}
                >
                  <option value="system">System</option>
                  <option value="user">User</option>
                  <option value="assistant">Assistant</option>
                </select>
                <p className="mt-1 text-sm text-gray-500">
                  System prompts define the chatbot's behavior and personality
                </p>
              </div>

              <div>
                <label
                  htmlFor="content"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Prompt Content *
                </label>
                <textarea
                  id="content"
                  name="content"
                  rows={8}
                  required
                  className="input-field"
                  placeholder="Enter your prompt content here..."
                  value={formData.content}
                  onChange={handleChange}
                />
                <p className="mt-1 text-sm text-gray-500">
                  This content will be used to guide the AI's responses
                </p>
              </div>
            </div>

            <div className="flex justify-end space-x-3 mt-6">
              <button type="button" onClick={onClose} className="btn-secondary">
                Cancel
              </button>
              <button type="submit" disabled={loading} className="btn-primary">
                {loading
                  ? "Saving..."
                  : prompt
                  ? "Update Prompt"
                  : "Create Prompt"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default PromptModal;

