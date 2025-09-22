import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { projectsAPI } from "../services/api";
import { PlusIcon, ChatBubbleLeftRightIcon } from "@heroicons/react/24/outline";

const Dashboard = () => {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);

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

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="mt-2 text-gray-600">
          Manage your chatbot projects and start conversations
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {/* Create new project card */}
        <Link
          to="/projects/new"
          className="card hover:shadow-md transition-shadow duration-200 border-2 border-dashed border-gray-300 hover:border-primary-400 flex flex-col items-center justify-center text-center min-h-[200px]"
        >
          <PlusIcon className="h-12 w-12 text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Create New Project
          </h3>
          <p className="text-gray-500">Start building a new chatbot agent</p>
        </Link>

        {/* Existing projects */}
        {projects.map((project) => (
          <div
            key={project.id}
            className="card hover:shadow-md transition-shadow duration-200"
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  {project.name}
                </h3>
                <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                  {project.description || "No description provided"}
                </p>
                <div className="flex items-center text-sm text-gray-500">
                  <span className="bg-gray-100 px-2 py-1 rounded-full text-xs">
                    {project.model}
                  </span>
                </div>
              </div>
            </div>
            <div className="mt-4 flex space-x-2">
              <Link
                to={`/projects/${project.id}/chat`}
                className="flex-1 btn-primary flex items-center justify-center"
              >
                <ChatBubbleLeftRightIcon className="h-4 w-4 mr-2" />
                Chat
              </Link>
              <Link to={`/projects/${project.id}`} className="btn-secondary">
                Edit
              </Link>
            </div>
          </div>
        ))}
      </div>

      {projects.length === 0 && (
        <div className="text-center py-12">
          <ChatBubbleLeftRightIcon className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">
            No projects
          </h3>
          <p className="mt-1 text-sm text-gray-500">
            Get started by creating a new chatbot project.
          </p>
          <div className="mt-6">
            <Link to="/projects/new" className="btn-primary">
              <PlusIcon className="h-4 w-4 mr-2" />
              Create Project
            </Link>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;

