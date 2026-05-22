const Response = require("../models/ResponseSchema");


/**
 * DELETE /api/responses/:responseId
 * Delete a DRAFT only (submitted responses are permanent)
 */
exports.deleteResponse = async (req, res) => {
  try {
    const { responseId } = req.params;
    const participantId = req.user.userId;

    const response = await Response.findOneAndDelete({
      responseId,
      participantId,
      status: "DRAFT"  // ← only drafts can be deleted
    });

    if (!response) {
      return res.status(404).json({ message: "Draft not found or already submitted" });
    }

    return res.json({ message: "Draft deleted" });

  } catch (err) {
    return res.status(500).json({ message: "Error deleting response", error: err.message });
  }
};