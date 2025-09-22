const express = require("express");
const supabase = require("../config/database");
const { authenticateToken } = require("../middleware/auth");

const router = express.Router();

// All routes require authentication
router.use(authenticateToken);

// Send message to AI
router.post("/", async (req, res) => {
  try {
    const { project_id, message, conversation_id } = req.body;

    // Validation
    if (!project_id || !message) {
      return res
        .status(400)
        .json({ error: "Project ID and message are required" });
    }

    // Verify project belongs to user
    const { data: project, error: projectError } = await supabase
      .from("projects")
      .select("*")
      .eq("id", project_id)
      .eq("user_id", req.user.id)
      .single();

    if (projectError || !project) {
      return res.status(404).json({ error: "Project not found" });
    }

    // Get system prompts for the project
    const { data: systemPrompts } = await supabase
      .from("prompts")
      .select("content")
      .eq("project_id", project_id)
      .eq("type", "system");

    // Prepare messages for OpenRouter
    const messages = [];

    // Add system prompts
    if (systemPrompts && systemPrompts.length > 0) {
      const systemContent = systemPrompts.map((p) => p.content).join("\n\n");
      messages.push({
        role: "system",
        content: systemContent,
      });
    }

    // Get conversation history if conversation_id is provided
    if (conversation_id) {
      const { data: history } = await supabase
        .from("conversations")
        .select("messages")
        .eq("id", conversation_id)
        .eq("project_id", project_id)
        .single();

      if (history && history.messages) {
        messages.push(...history.messages);
      }
    }

    // Add user message
    messages.push({
      role: "user",
      content: message,
    });

    // Validate OpenRouter API key
    if (!process.env.OPENROUTER_API_KEY) {
      console.error("OPENROUTER_API_KEY is not set in environment variables");
      return res
        .status(500)
        .json({ error: "OpenRouter API key is not configured" });
    }

    // Call OpenRouter API
    const openRouterResponse = await fetch(
      "https://openrouter.ai/api/v1/chat/completions",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
          "Content-Type": "application/json",
          "HTTP-Referer": process.env.CLIENT_URL || "http://localhost:5173",
          "X-Title": "Chatbot Platform",
        },
        body: JSON.stringify({
          model: "openai/gpt-3.5-turbo",
          messages: messages,
          max_tokens: 1000,
          temperature: 0.7,
        }),
      }
    );

    if (!openRouterResponse.ok) {
      const errorData = await openRouterResponse.text();
      console.error("OpenRouter API error:", errorData);
      return res.status(500).json({
        error: "Failed to get AI response",
        details: errorData,
      });
    }

    const aiResponse = await openRouterResponse.json();
    const aiMessage = aiResponse.choices[0].message.content;

    // Update conversation history
    const updatedMessages = [
      ...messages,
      {
        role: "assistant",
        content: aiMessage,
      },
    ];

    let finalConversationId = conversation_id;

    if (!conversation_id) {
      // Create new conversation
      const { data: newConversation, error: convError } = await supabase
        .from("conversations")
        .insert([
          {
            project_id,
            user_id: req.user.id,
            messages: updatedMessages,
          },
        ])
        .select("id")
        .single();

      if (convError) {
        console.error("Failed to create conversation:", convError);
      } else {
        finalConversationId = newConversation.id;
      }
    } else {
      // Update existing conversation
      await supabase
        .from("conversations")
        .update({ messages: updatedMessages })
        .eq("id", conversation_id)
        .eq("project_id", project_id);
    }

    res.json({
      message: aiMessage,
      conversation_id: finalConversationId,
      usage: aiResponse.usage,
    });
  } catch (error) {
    console.error("Chat error:", error);
    res.status(500).json({
      error: "Internal server error",
      details: error.message,
    });
  }
});

// Get conversation history
router.get("/conversation/:conversationId", async (req, res) => {
  try {
    const { conversationId } = req.params;

    const { data: conversation, error } = await supabase
      .from("conversations")
      .select("*")
      .eq("id", conversationId)
      .eq("user_id", req.user.id)
      .single();

    if (error || !conversation) {
      return res.status(404).json({ error: "Conversation not found" });
    }

    res.json({ conversation });
  } catch (error) {
    console.error("Get conversation error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Get all conversations for a project
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

    const { data: conversations, error } = await supabase
      .from("conversations")
      .select("id, created_at, updated_at")
      .eq("project_id", projectId)
      .eq("user_id", req.user.id)
      .order("updated_at", { ascending: false });

    if (error) {
      console.error("Database error:", error);
      return res.status(500).json({ error: "Failed to fetch conversations" });
    }

    res.json({ conversations });
  } catch (error) {
    console.error("Get conversations error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

module.exports = router;
