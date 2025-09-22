const express = require("express");
const supabase = require("../config/database");
const { authenticateToken } = require("../middleware/auth");

const router = express.Router();

// All routes require authentication
router.use(authenticateToken);

// Get all prompts for a project
router.get("/project/:projectId", async (req, res) => {
  try {
    const { projectId } = req.params;

    // Verify project belongs to user
    const { data: project } = await supabase
      .from("projects")
      .select("id")
      .eq("id", projectId)
      .eq("user_id", req.user.id)
      .single();

    if (!project) {
      return res.status(404).json({ error: "Project not found" });
    }

    const { data: prompts, error } = await supabase
      .from("prompts")
      .select("*")
      .eq("project_id", projectId)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Database error:", error);
      return res.status(500).json({ error: "Failed to fetch prompts" });
    }

    res.json({ prompts });
  } catch (error) {
    console.error("Get prompts error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Get a specific prompt
router.get("/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const { data: prompt, error } = await supabase
      .from("prompts")
      .select(
        `
        *,
        projects!inner(user_id)
      `
      )
      .eq("id", id)
      .eq("projects.user_id", req.user.id)
      .single();

    if (error || !prompt) {
      return res.status(404).json({ error: "Prompt not found" });
    }

    res.json({ prompt });
  } catch (error) {
    console.error("Get prompt error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Create a new prompt
router.post("/", async (req, res) => {
  try {
    const { project_id, name, content, type } = req.body;

    // Validation
    if (!project_id || !name || !content) {
      return res
        .status(400)
        .json({ error: "Project ID, name, and content are required" });
    }

    // Verify project belongs to user
    const { data: project } = await supabase
      .from("projects")
      .select("id")
      .eq("id", project_id)
      .eq("user_id", req.user.id)
      .single();

    if (!project) {
      return res.status(404).json({ error: "Project not found" });
    }

    const { data: prompt, error } = await supabase
      .from("prompts")
      .insert([
        {
          project_id,
          name,
          content,
          type: type || "system",
        },
      ])
      .select("*")
      .single();

    if (error) {
      console.error("Database error:", error);
      return res.status(500).json({ error: "Failed to create prompt" });
    }

    res.status(201).json({
      message: "Prompt created successfully",
      prompt,
    });
  } catch (error) {
    console.error("Create prompt error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Update a prompt
router.put("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { name, content, type } = req.body;

    // Check if prompt exists and belongs to user's project
    const { data: existingPrompt } = await supabase
      .from("prompts")
      .select(
        `
        id,
        projects!inner(user_id)
      `
      )
      .eq("id", id)
      .eq("projects.user_id", req.user.id)
      .single();

    if (!existingPrompt) {
      return res.status(404).json({ error: "Prompt not found" });
    }

    const updateData = {};
    if (name !== undefined) updateData.name = name;
    if (content !== undefined) updateData.content = content;
    if (type !== undefined) updateData.type = type;

    const { data: prompt, error } = await supabase
      .from("prompts")
      .update(updateData)
      .eq("id", id)
      .select("*")
      .single();

    if (error) {
      console.error("Database error:", error);
      return res.status(500).json({ error: "Failed to update prompt" });
    }

    res.json({
      message: "Prompt updated successfully",
      prompt,
    });
  } catch (error) {
    console.error("Update prompt error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Delete a prompt
router.delete("/:id", async (req, res) => {
  try {
    const { id } = req.params;

    // Check if prompt exists and belongs to user's project
    const { data: existingPrompt } = await supabase
      .from("prompts")
      .select(
        `
        id,
        projects!inner(user_id)
      `
      )
      .eq("id", id)
      .eq("projects.user_id", req.user.id)
      .single();

    if (!existingPrompt) {
      return res.status(404).json({ error: "Prompt not found" });
    }

    const { error } = await supabase.from("prompts").delete().eq("id", id);

    if (error) {
      console.error("Database error:", error);
      return res.status(500).json({ error: "Failed to delete prompt" });
    }

    res.json({ message: "Prompt deleted successfully" });
  } catch (error) {
    console.error("Delete prompt error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

module.exports = router;

