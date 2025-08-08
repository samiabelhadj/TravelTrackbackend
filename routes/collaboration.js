const express = require("express");
const router = express.Router();
const { body } = require("express-validator");

// Import controllers (to be created)
// const collaborationController = require("../controllers/collaborationController");

// Validation middleware
const validateInviteCollaborator = [
  body("email")
    .isEmail()
    .normalizeEmail()
    .withMessage("Please provide a valid email"),
  body("role")
    .isIn(["viewer", "editor", "admin"])
    .withMessage("Role must be viewer, editor, or admin"),
];

// Routes
// GET /api/collaboration/trips/:tripId/collaborators
router.get("/trips/:tripId/collaborators", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Get collaborators endpoint - to be implemented",
  });
});

// POST /api/collaboration/trips/:tripId/invite
router.post("/trips/:tripId/invite", validateInviteCollaborator, (req, res) => {
  res.status(200).json({
    success: true,
    message: "Invite collaborator endpoint - to be implemented",
  });
});

// PUT /api/collaboration/trips/:tripId/collaborators/:userId/role
router.put("/trips/:tripId/collaborators/:userId/role", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Update collaborator role endpoint - to be implemented",
  });
});

// DELETE /api/collaboration/trips/:tripId/collaborators/:userId
router.delete("/trips/:tripId/collaborators/:userId", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Remove collaborator endpoint - to be implemented",
  });
});

module.exports = router;
