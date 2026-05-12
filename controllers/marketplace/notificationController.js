import Notification from "../../models/marketplace/NotificationModel.js";


// ==============================
// CREATE NOTIFICATION (HELPER)
// ==============================

export const createNotification = async ({
  user,
  title,
  message,
  type,
  booking,
  request,
  postId
}) => {

  try {

    await Notification.create({
      user,
      title,
      message,
      type,
      booking,
      request,
      postId
    });

  } catch (error) {

    console.log(
      "Notification error:",
      error
    );

  }

};



// ==============================
// GET MY NOTIFICATIONS
// ==============================

export const getMyNotifications =
  async (req, res) => {

    try {

      const userId = req.user._id;

      const notifications =
        await Notification.find({
          user: userId
        })
          .sort({ createdAt: -1 });

      res.json(notifications);

    } catch (error) {

      res.status(500).json({
        message:
          "Error fetching notifications"
      });

    }

  };



// ==============================
// MARK AS READ
// ==============================

export const markAsRead =
  async (req, res) => {

    try {

      const { notificationId } =
        req.params;

      const notification =
        await Notification.findById(
          notificationId
        );

      if (!notification) {
        return res.status(404).json({
          message:
            "Notification not found"
        });
      }

      notification.isRead = true;

      await notification.save();

      res.json({
        message:
          "Marked as read"
      });

    } catch (error) {

      res.status(500).json({
        message:
          "Error updating notification"
      });

    }

  };