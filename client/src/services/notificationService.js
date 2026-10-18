import axios from "axios";

const API_URL = "http://localhost:5000/api";

// ======================================================
// GET AUTH TOKEN
// ======================================================

const getToken = () => {
  const token = localStorage.getItem("token");

  if (!token) {
    throw new Error("Authentication token not found. Please login again.");
  }

  return token;
};

// ======================================================
// AUTH CONFIG
// ======================================================

const getAuthConfig = () => {
  const token = getToken();

  return {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };
};

// ======================================================
// GET ALL NOTIFICATIONS
// ======================================================

export const getNotifications = async () => {
  try {
    const response = await axios.get(
      `${API_URL}/notifications`,
      getAuthConfig()
    );

    return response.data;
  } catch (error) {
    console.error(
      "Fetch Notifications Error:",
      error.response?.data || error.message
    );

    throw error;
  }
};

// ======================================================
// GET UNREAD NOTIFICATION COUNT
// ======================================================

export const getUnreadCount = async () => {
  try {
    const response = await axios.get(
      `${API_URL}/notifications/unread-count`,
      getAuthConfig()
    );

    return response.data;
  } catch (error) {
    console.error(
      "Unread Count Error:",
      error.response?.data || error.message
    );

    throw error;
  }
};

// ======================================================
// MARK SINGLE NOTIFICATION AS READ
// ======================================================

export const markNotificationAsRead = async (id) => {
  try {
    if (!id) {
      throw new Error("Notification ID is required.");
    }

    const response = await axios.put(
      `${API_URL}/notifications/${id}/read`,
      {},
      getAuthConfig()
    );

    return response.data;
  } catch (error) {
    console.error(
      "Mark Notification As Read Error:",
      error.response?.data || error.message
    );

    throw error;
  }
};

// ======================================================
// MARK ALL NOTIFICATIONS AS READ
// ======================================================

export const markAllNotificationsAsRead = async () => {
  try {
    const response = await axios.put(
      `${API_URL}/notifications/read-all`,
      {},
      getAuthConfig()
    );

    return response.data;
  } catch (error) {
    console.error(
      "Mark All Notifications As Read Error:",
      error.response?.data || error.message
    );

    throw error;
  }
};

// ======================================================
// DELETE NOTIFICATION
// ======================================================

export const deleteNotification = async (id) => {
  try {
    if (!id) {
      throw new Error("Notification ID is required.");
    }

    const response = await axios.delete(
      `${API_URL}/notifications/${id}`,
      getAuthConfig()
    );

    return response.data;
  } catch (error) {
    console.error(
      "Delete Notification Error:",
      error.response?.data || error.message
    );

    throw error;
  }
};