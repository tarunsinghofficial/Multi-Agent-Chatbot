import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { projectsAPI } from "../services/api";
import {
  PlusIcon,
  PencilIcon,
  TrashIcon,
  ChatBubbleLeftRightIcon,
} from "@heroicons/react/24/outline";

const Projects = () => {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deleteLoading, setDeleteLoading] = useState(null);

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    try {
      const response = await projectsAPI.getProjects();
      setProjects(response.data.projects);
    } catch (error) {
      console.error("Failed to fetch projects:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (projectId) => {
    if (
      !window.confirm(
        "Are you sure you want to delete this project? This action cannot be undone."
      )
    ) {
      return;
    }

    setDeleteLoading(projectId);
    try {
      await projectsAPI.deleteProject(projectId);
      setProjects(projects.filter((p) => p.id !== projectId));
    } catch (error) {
      console.error("Failed to delete project:", error);
      alert("Failed to delete project. Please try again.");
    } finally {
      setDeleteLoading(null);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin border-primary-600 w-12 h-12 border-b-2 rounded-full"></div>
      </div>
    );
  }

  return (
    <div>
      <div className="sm:flex sm:items-center sm:justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Projects</h1>
          <p className="mt-2 text-gray-600">
            Manage your chatbot projects and agents
          </p>
        </div>
        <div className="sm:mt-0 mt-4">
          <Link to="/projects/new" className="btn-primary">
            New Project
          </Link>
        </div>
      </div>

      <div className="sm:grid-cols-2 lg:grid-cols-3 grid grid-cols-1 gap-6">
        {projects.map((project) => (
          <div
            key={project.id}
            className="card hover:shadow-md transition-shadow duration-200"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <h3 className="mb-2 text-lg font-semibold text-gray-900">
                  {project.name}
                </h3>
                <p className="line-clamp-2 mb-3 text-sm text-gray-600">
                  {project.description || "No description provided"}
                </p>
                <div className="flex items-center text-sm text-gray-500">
                  <span className="px-2 py-1 text-xs bg-gray-100 rounded-full">
                    {project.model}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex space-x-2">
              <Link
                to={`/projects/${project.id}/chat`}
                className="btn-primary flex items-center justify-center flex-1"
              >
                <ChatBubbleLeftRightIcon className="w-4 h-4 mr-2" />
                Chat
              </Link>
              <Link to={`/projects/${project.id}`} className="btn-secondary">
                <PencilIcon className="w-4 h-4" />
              </Link>
              <button
                onClick={() => handleDelete(project.id)}
                disabled={deleteLoading === project.id}
                className="btn-secondary hover:text-red-700 hover:bg-red-50 text-red-600"
              >
                {deleteLoading === project.id ? (
                  <div className="animate-spin w-4 h-4 border-b-2 border-red-600 rounded-full"></div>
                ) : (
                  <TrashIcon className="w-4 h-4" />
                )}
              </button>
            </div>
          </div>
        ))}
      </div>

      {projects.length === 0 && (
        <div className="py-12 text-center">
          <ChatBubbleLeftRightIcon className="w-12 h-12 mx-auto text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">
            No projects
          </h3>
          <p className="mt-1 text-sm text-gray-500">
            Get started by creating a new chatbot project.
          </p>
          <div className="mt-6">
            <Link to="/projects/new" className="btn-primary">
              <PlusIcon className="w-4 h-4 mr-2" />
              Create Project
            </Link>
          </div>
        </div>
      )}
    </div>
  );
};

export default Projects;
