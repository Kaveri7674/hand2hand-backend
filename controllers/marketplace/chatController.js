import ChatRoom from "../../models/marketplace/ChatRoom.js";
import CustomerProfile from "../../models/CustomerModels/CustomerProfile.js";
import WorkerProfile from "../../models/WorkerModels/WorkerProfile.js";
import Message from "../../models/marketplace/Message.js";
import cloudinary from "../../config/cloudinary.js";
import { io } from "../../server.js";

// 🔥 START OR GET CHAT
export const startChat = async (req, res) => {
  try {
    const userId = req.user._id;
    const { receiverId } = req.body;

    if (!receiverId) {
      return res.status(400).json({ message: "Receiver ID required" });
    }

    // 🔥 Prevent self chat
    if (userId.toString() === receiverId) {
      return res.status(400).json({ message: "Cannot chat with yourself" });
    }

    // 🔥 Check existing chat
    let chatRoom = await ChatRoom.findOne({
      participants: { $all: [userId, receiverId] }
    });

    // 🔥 If not exists → create
    if (!chatRoom) {
      chatRoom = await ChatRoom.create({
        participants: [userId, receiverId]
      });
    }

    res.status(200).json({
      message: "Chat room ready",
      chatRoom
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// 🔍 SEARCH USERS FROM BOTH PROFILES
export const searchUsers = async (req, res) => {
  try {
    const { query } = req.query;

    if (!query) {
      return res.status(200).json({ users: [] });
    }

    // 🔹 Search in Customer Profiles
    const customers = await CustomerProfile.find({
      name: { $regex: `^${query}`, $options: "i" }
    })
      .populate("user", "_id username role")
      .limit(5);

    // 🔹 Search in Worker Profiles
    const workers = await WorkerProfile.find({
      name: { $regex: `^${query}`, $options: "i" }
    })
      .populate("user", "_id username role")
      .limit(5);

    // 🔥 Merge results
    const users = [
      ...customers.map(c => ({
        _id: c.user._id,
        username: c.user.username,
        profileImage: c.profileImage,
        role: "customer",
        name: c.name
      })),
      ...workers.map(w => ({
        _id: w.user._id,
        username: w.user.username,
        profileImage: w.profileImage,
        role: "worker",
        name: w.name
      }))
    ];

    res.status(200).json({ users });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

//Send Messages
export const sendMessage = async (req, res) => {
  try {
    const sender = req.user._id;
    const { roomId, text, messageType } = req.body;

    if (!roomId) {
      return res.status(400).json({ message: "Room ID required" });
    }

    const images = req.files?.images
      ? req.files.images.map(file => file.path)
      : [];

    // const audio = req.files?.audio
    //   ? req.files.audio[0].path
    //   : "";
    // let audio = "";

    // if (req.files && req.files.audio && req.files.audio.length > 0) {
    //   const file = req.files.audio[0];

    //   const result = await cloudinary.uploader.upload(file.path, {
    //     resource_type: "video", // 🔥 required for audio
    //     folder: "hand2hand/chat/audio"
    //   });

    //   audio = result.secure_url;
    // }
    
    // if (!text && images.length === 0 && !audio) {
    //     return res.status(400).json({ message: "Empty message" });
    // }
    let audio = "";

    if (messageType === "audio" && req.body.audio) {
      audio = req.body.audio;
    }

    const message = await Message.create({
      chatRoom: roomId,
      sender,
      text: text || "",
      images,
      audio,
      messageType,
      deliveredTo: [], 
      seenBy: []
    });

    const fullMessage = await Message.findById(message._id).lean();

    fullMessage.sender = fullMessage.sender.toString();

    await ChatRoom.findByIdAndUpdate(
      roomId,
      {
        lastMessage:
          messageType === "text"
            ? text
            : messageType === "image"
            ? "📷 Image"
            : "🎤 Voice",
        lastMessageType: messageType,
        updatedAt: new Date() // 🔥 THIS FIXES YOUR ISSUE
      },
      { new: true }
    );

    console.log("FILES:", req.files);
    console.log("BODY:", req.body);

    // 🔥 SOCKET EMIT
    io.to(roomId).emit("newMessage", fullMessage);

    // ✅ ONLY ONE RESPONSE
    res.status(201).json({ message: fullMessage });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message });
  }
};

export const getMessages = async (req, res) => {
  try {
    const { roomId } = req.params;

    const messages = await Message.find({
      chatRoom: roomId
    }).sort({ createdAt: 1 });

    const enrichedMessages = await Promise.all(
      messages.map(async (msg) => {

        let profile = await CustomerProfile.findOne({
          user: msg.sender
        });

        let role = "customer";

        if (!profile) {
          profile = await WorkerProfile.findOne({
            user: msg.sender
          });
          role = "worker";
        }

        return {
          ...msg.toObject(),
          sender: msg.sender.toString(),
          senderInfo: {
            _id: msg.sender,
            name: profile?.name,
            profileImage: profile?.profileImage,
            role
          }
        };
      })
    );

    res.status(200).json({ messages: enrichedMessages });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getMyChats = async (req, res) => {
  try {
    const userId = req.user._id;

    const chats = await ChatRoom.find({
      participants: userId
    }).sort({ updatedAt: -1 });

    const formattedChats = await Promise.all(
      chats.map(async (chat) => {

        const otherUserId = chat.participants.find(
          id => id.toString() !== userId.toString()
        );

        // 🔥 Try customer profile
        let profile = await CustomerProfile.findOne({
          user: otherUserId
        });

        let role = "customer";

        // 🔥 If not customer → try worker
        if (!profile) {
          profile = await WorkerProfile.findOne({
            user: otherUserId
          });
          role = "worker";
        }

        return {
          _id: chat._id,
          otherUser: {
            _id: otherUserId,
            username: profile?.name || "User",
            profileImage: profile?.profileImage || "",
            role
          },
          lastMessage: chat.lastMessage,
          updatedAt: chat.updatedAt
        };
      })
    );

    res.status(200).json({ chats: formattedChats });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};