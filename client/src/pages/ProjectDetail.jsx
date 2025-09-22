import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { projectsAPI, promptsAPI } from "../services/api";
import { PencilIcon, TrashIcon, PlusIcon } from "@heroicons/react/24/outline";
import PromptModal from "../components/PromptModal";

const ProjectDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [project, setProject] = useState(null);
  const [prompts, setPrompts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [editing, setEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    name: "",
    description: "",
    model: "",
  });
  const [promptModalOpen, setPromptModalOpen] = useState(false);
  const [editingPrompt, setEditingPrompt] = useState(null);

  useEffect(() => {
    fetchProject();
    fetchPrompts();
  }, [id]);

  const fetchProject = async () => {
    try {
      const response = await projectsAPI.getProject(id);
      setProject(response.data.project);
      setEditForm({
        name: response.data.project.name,
        description: response.data.project.description,
        model: response.data.project.model,
      });
    } catch (error) {
      setError("Failed to fetch project");
    }
  };

  const fetchPrompts = async () => {
    try {
      const response = await promptsAPI.getPrompts(id);
      setPrompts(response.data.prompts);
    } catch (error) {
      console.error("Failed to fetch prompts:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      const response = await projectsAPI.updateProject(id, editForm);
      setProject(response.data.project);
      setEditing(false);
    } catch (error) {
      setError("Failed to update project");
    }
  };

  const handleDelete = async () => {
    if (
      !window.confirm(
        "Are you sure you want to delete this project? This action cannot be undone."
      )
    ) {
      return;
    }

    try {
      await projectsAPI.deleteProject(id);
      navigate("/projects");
    } catch (error) {
      setError("Failed to delete project");
    }
  };

  const handleAddPrompt = () => {
    setEditingPrompt(null);
    setPromptModalOpen(true);
  };

  const handleEditPrompt = (prompt) => {
    setEditingPrompt(prompt);
    setPromptModalOpen(true);
  };

  const handleDeletePrompt = async (promptId) => {
    if (!window.confirm("Are you sure you want to delete this prompt?")) {
      return;
    }

    try {
      await promptsAPI.deletePrompt(promptId);
      fetchPrompts(); // Refresh prompts list
    } catch (error) {
      setError("Failed to delete prompt");
    }
  };

  const handlePromptSuccess = () => {
    fetchPrompts(); // Refresh prompts list
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
    <div className="max-w-4xl mx-auto">
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              {project?.name}
            </h1>
            <p className="mt-2 text-gray-600">
              {project?.description || "No description provided"}
            </p>
          </div>
          <div className="flex space-x-2">
            <button
              onClick={() => setEditing(!editing)}
              className="btn-secondary"
            >
              <PencilIcon className="w-4 h-4 mr-2" />
              Edit
            </button>
            <button
              onClick={handleDelete}
              className="btn-secondary hover:text-red-700 hover:bg-red-50 text-red-600"
            >
              <TrashIcon className="w-4 h-4 mr-2" />
              Delete
            </button>
          </div>
        </div>
      </div>

      {editing && (
        <div className="card mb-8">
          <h2 className="mb-4 text-xl font-semibold">Edit Project</h2>
          <form onSubmit={handleUpdate} className="space-y-4">
            <div>
              <label className="block mb-2 text-sm font-medium text-gray-700">
                Project Name
              </label>
              <input
                type="text"
                className="input-field"
                value={editForm.name}
                onChange={(e) =>
                  setEditForm({ ...editForm, name: e.target.value })
                }
              />
            </div>
            <div>
              <label className="block mb-2 text-sm font-medium text-gray-700">
                Description
              </label>
              <textarea
                rows={3}
                className="input-field"
                value={editForm.description}
                onChange={(e) =>
                  setEditForm({ ...editForm, description: e.target.value })
                }
              />
            </div>
            <div className="flex space-x-2">
              <button type="submit" className="btn-primary">
                Save Changes
              </button>
              <button
                type="button"
                onClick={() => setEditing(false)}
                className="btn-secondary"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="lg:grid-cols-2 grid grid-cols-1 gap-8">
        {/* Project Info */}
        <div className="card">
          <h2 className="mb-4 text-xl font-semibold">Project Information</h2>
          <div className="space-y-3">
            <div>
              <span className="text-sm font-medium text-gray-500">Model:</span>
              <p className="text-gray-900">{project?.model}</p>
            </div>
            <div>
              <span className="text-sm font-medium text-gray-500">
                Created:
              </span>
              <p className="text-gray-900">
                {new Date(project?.created_at).toLocaleDateString()}
              </p>
            </div>
            <div>
              <span className="text-sm font-medium text-gray-500">
                Updated:
              </span>
              <p className="text-gray-900">
                {new Date(project?.updated_at).toLocaleDateString()}
              </p>
            </div>
          </div>
        </div>

        {/* Prompts */}
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold">System Prompts</h2>
            <button onClick={handleAddPrompt} className="btn-primary">
              <PlusIcon className="w-4 h-4 mr-2" />
              Add Prompt
            </button>
          </div>
          {prompts.length === 0 ? (
            <p className="py-4 text-center text-gray-500">
              No prompts added yet. Add system prompts to customize your
              chatbot's behavior.
            </p>
          ) : (
            <div className="space-y-3">
              {prompts.map((prompt) => (
                <div
                  key={prompt.id}
                  className="p-3 border border-gray-200 rounded-lg"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2">
                        <h3 className="font-medium text-gray-900">
                          {prompt.name}
                        </h3>
                        <span className="px-2 py-1 text-xs text-gray-600 bg-gray-100 rounded-full">
                          {prompt.type}
                        </span>
                      </div>
                      <p className="line-clamp-2 mt-1 text-sm text-gray-600">
                        {prompt.content}
                      </p>
                    </div>
                    <div className="flex ml-2 space-x-1">
                      <button
                        onClick={() => handleEditPrompt(prompt)}
                        className="hover:text-gray-600 p-1 text-gray-400"
                        title="Edit prompt"
                      >
                        <PencilIcon className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeletePrompt(prompt.id)}
                        className="hover:text-red-600 p-1 text-gray-400"
                        title="Delete prompt"
                      >
                        <TrashIcon className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Prompt Modal */}
      <PromptModal
        isOpen={promptModalOpen}
        onClose={() => setPromptModalOpen(false)}
        projectId={id}
        prompt={editingPrompt}
        onSuccess={handlePromptSuccess}
      />
    </div>
  );
};

export default ProjectDetail;
