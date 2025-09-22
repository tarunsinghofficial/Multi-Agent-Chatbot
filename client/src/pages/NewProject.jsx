import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { projectsAPI } from "../services/api";

const NewProject = () => {
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    model: "openai/gpt-3.5-turbo",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const navigate = useNavigate();

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
      const response = await projectsAPI.createProject(formData);
      navigate(`/projects/${response.data.project.id}`);
    } catch (error) {
      setError(error.response?.data?.error || "Failed to create project");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Create New Project</h1>
        <p className="mt-2 text-gray-600">
          Set up a new chatbot project with your preferred AI model
        </p>
      </div>

      <div className="card">
        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="bg-red-50 px-4 py-3 text-red-600 border border-red-200 rounded-md">
              {error}
            </div>
          )}

          <div>
            <label
              htmlFor="name"
              className="block mb-2 text-sm font-medium text-gray-700"
            >
              Project Name *
            </label>
            <input
              id="name"
              name="name"
              type="text"
              required
              className="input-field"
              placeholder="Enter project name"
              value={formData.name}
              onChange={handleChange}
            />
          </div>

          <div>
            <label
              htmlFor="description"
              className="block mb-2 text-sm font-medium text-gray-700"
            >
              Description
            </label>
            <textarea
              id="description"
              name="description"
              rows={4}
              className="input-field"
              placeholder="Describe your chatbot project..."
              value={formData.description}
              onChange={handleChange}
            />
          </div>

          <div className="flex space-x-4">
            <button type="submit" disabled={loading} className="btn-primary">
              {loading ? "Creating..." : "Create Project"}
            </button>
            <button
              type="button"
              onClick={() => navigate("/projects")}
              className="btn-secondary"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default NewProject;
