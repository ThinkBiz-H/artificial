const mongoose = require("mongoose");
const { RESOURCES, ACTIONS } = require("../constants/permissions");

// One entry per resource this role has ANY access to. A resource absent
// from `permissions` means "no access to that resource" for this role.
const permissionEntrySchema = new mongoose.Schema(
  {
    resource: { type: String, enum: RESOURCES, required: true },
    actions: [{ type: String, enum: ACTIONS }],
  },
  { _id: false },
);

const roleSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, lowercase: true, trim: true },
    description: { type: String, default: "", trim: true },

    // Super Admin bypasses every requirePermission() check unconditionally —
    // `permissions` is irrelevant for a role with this flag set.
    isSuperAdmin: { type: Boolean, default: false },

    // Seeded roles (see seed/roleSeeder.js) — protected from deletion and
    // renaming so the admin panel can't be left without a working role, but
    // their permission grants CAN still be edited by a Super Admin.
    isSystem: { type: Boolean, default: false },

    permissions: [permissionEntrySchema],
  },
  { timestamps: true },
);

module.exports = mongoose.model("Role", roleSchema);
