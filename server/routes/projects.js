const express = require("express");
const supabase = require("../config/database");
const { authenticateToken } = require("../middleware/auth");

const router = express.Router();

// All routes require authentication
router.use(authenticateToken);

// Get all projects for the authenticated user
router.get("/", async (req, res) => {
  try {
    const { data: projects, error } = await supabase
      .from("projects")
      .select("*")
      .eq("user_id", req.user.id)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Database error:", error);
      return res.status(500).json({ error: "Failed to fetch projects" });
    }

    res.json({ projects });
  } catch (error) {
    console.error("Get projects error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Get a specific project
router.get("/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const { data: project, error } = await supabase
      .from("projects")
      .select("*")
      .eq("id", id)
      .eq("user_id", req.user.id)
      .single();

    if (error || !project) {
      return res.status(404).json({ error: "Project not found" });
    }

    res.json({ project });
  } catch (error) {
    console.error("Get project error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Create a new project
router.post("/", async (req, res) => {
  try {
    const { name, description, model } = req.body;

    // Validation
    if (!name) {
      return res.status(400).json({ error: "Project name is required" });
    }

    const { data: project, error } = await supabase
      .from("projects")
      .insert([
        {
          name,
          description: description || "",
          model: model || "openai/gpt-3.5-turbo",
          user_id: req.user.id,
        },
      ])
      .select("*")
      .single();

    if (error) {
      console.error("Database error:", error);
      return res.status(500).json({ error: "Failed to create project" });
    }

    res.status(201).json({
      message: "Project created successfully",
      project,
    });
  } catch (error) {
    console.error("Create project error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Update a project
router.put("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, model } = req.body;

    // Check if project exists and belongs to user
    const { data: existingProject } = await supabase
      .from("projects")
      .select("id")
      .eq("id", id)
      .eq("user_id", req.user.id)
      .single();

    if (!existingProject) {
      return res.status(404).json({ error: "Project not found" });
    }

    const updateData = {};
    if (name !== undefined) updateData.name = name;
    if (description !== undefined) updateData.description = description;
    if (model !== undefined) updateData.model = model;

    const { data: project, error } = await supabase
      .from("projects")
      .update(updateData)
      .eq("id", id)
      .eq("user_id", req.user.id)
      .select("*")
      .single();

    if (error) {
      console.error("Database error:", error);
      return res.status(500).json({ error: "Failed to update project" });
    }

    res.json({
      message: "Project updated successfully",
      project,
    });
  } catch (error) {
    console.error("Update project error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Delete a project
router.delete("/:id", async (req, res) => {
  try {
    const { id } = req.params;

    // Check if project exists and belongs to user
    const { data: existingProject } = await supabase
      .from("projects")
      .select("id")
      .eq("id", id)
      .eq("user_id", req.user.id)
      .single();

    if (!existingProject) {
      return res.status(404).json({ error: "Project not found" });
    }

    // Delete associated prompts first
    await supabase.from("prompts").delete().eq("project_id", id);

    // Delete the project
    const { error } = await supabase
      .from("projects")
      .delete()
      .eq("id", id)
      .eq("user_id", req.user.id);

    if (error) {
      console.error("Database error:", error);
      return res.status(500).json({ error: "Failed to delete project" });
    }

    res.json({ message: "Project deleted successfully" });
  } catch (error) {
    console.error("Delete project error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

module.exports = router;

