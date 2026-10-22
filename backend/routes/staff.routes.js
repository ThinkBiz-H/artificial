const express = require("express");
const router = express.Router();

const {
  getStaff,
  getStaffById,
  createStaff,
  updateStaff,
  deleteStaff,
} = require("../controllers/staff.controller");

const { protect, authorize } = require("../middlewares/auth.middleware");
const { requirePermission } = require("../middlewares/permission.middleware");
const validate = require("../middlewares/validate.middleware");
const { staffValidator, staffUpdateValidator } = require("../validators/staff.validator");

router.use(protect, authorize("admin"));

router.get("/", requirePermission("Users", "View"), getStaff);
router.get("/:id", requirePermission("Users", "View"), getStaffById);
router.post("/", requirePermission("Users", "Create"), staffValidator, validate, createStaff);
router.put("/:id", requirePermission("Users", "Edit"), staffUpdateValidator, validate, updateStaff);
router.delete("/:id", requirePermission("Users", "Delete"), deleteStaff);

module.exports = router;
