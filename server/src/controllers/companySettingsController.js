const CompanySettings = require("../models/CompanySettings");

const editableFields = [
  "companyName",
  "companyEmail",
  "companyWebsite",
  "emailNotifications",
  "applicationAlerts",
  "messageNotifications",
  "publicProfile",
  "showCompanyEmail",
  "showCompanyWebsite",
  "allowRecruiterMessages",
  "darkMode",
  "compactLayout",
  "loginAlerts",
];

const booleanFields = [
  "emailNotifications",
  "applicationAlerts",
  "messageNotifications",
  "publicProfile",
  "showCompanyEmail",
  "showCompanyWebsite",
  "allowRecruiterMessages",
  "darkMode",
  "compactLayout",
  "loginAlerts",
];

function getAuthenticatedUserId(req) {
  return req.user?.id ?? req.user?.userId;
}

// GET /api/company-settings
exports.getSettings = async (req, res) => {
  try {
    const userId = getAuthenticatedUserId(req);

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Authenticated user ID not found.",
      });
    }

    const [settings] = await CompanySettings.findOrCreate({
      where: { userId },
      defaults: { userId },
    });

    return res.status(200).json({
      success: true,
      settings,
    });
  } catch (error) {
    console.error("Get Company Settings Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch company settings.",
    });
  }
};

// PUT /api/company-settings
exports.updateSettings = async (req, res) => {
  try {
    const userId = getAuthenticatedUserId(req);

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Authenticated user ID not found.",
      });
    }

    const updates = {};

    for (const field of editableFields) {
      if (!Object.prototype.hasOwnProperty.call(req.body, field)) {
        continue;
      }

      const value = req.body[field];

      if (booleanFields.includes(field) && typeof value !== "boolean") {
        return res.status(400).json({
          success: false,
          message: `${field} must be true or false.`,
        });
      }

      if (
        ["companyName", "companyEmail", "companyWebsite"].includes(field) &&
        value !== null &&
        typeof value !== "string"
      ) {
        return res.status(400).json({
          success: false,
          message: `${field} must be a string.`,
        });
      }

      updates[field] =
        typeof value === "string" ? value.trim() : value;
    }

    if (Object.keys(updates).length === 0) {
      return res.status(400).json({
        success: false,
        message: "No valid settings provided.",
      });
    }

    const [settings] = await CompanySettings.findOrCreate({
      where: { userId },
      defaults: { userId },
    });

    await settings.update(updates);

    return res.status(200).json({
      success: true,
      message: "Company settings saved successfully.",
      settings,
    });
  } catch (error) {
    console.error("Update Company Settings Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to update company settings.",
    });
  }
};