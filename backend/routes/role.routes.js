const express = require("express");
const router = express.Router();

const {
  getRoles,
  getRoleById,
  createRole,
  updateRole,
  deleteRole,
} = require("../controllers/role.controller");

const { protect, authorize } = require("../middlewares/auth.middleware");
const { requirePermission } = require("../middlewares/permission.middleware");
const validate = require("../middlewares/validate.middleware");
const { roleValidator, roleUpdateValidator } = require("../validators/role.validator");

router.use(protect, authorize("admin"));

router.get("/", requirePermission("Roles", "View"), getRoles);
router.get("/:id", requirePermission("Roles", "View"), getRoleById);
router.post("/", requirePermission("Roles", "Create"), roleValidator, validate, createRole);
router.put("/:id", requirePermission("Roles", "Edit"), roleUpdateValidator, validate, updateRole);
router.delete("/:id", requirePermission("Roles", "Delete"), deleteRole);

module.exports = router;
