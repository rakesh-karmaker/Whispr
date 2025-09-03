import { Request, Response } from "express";
import mongoose from "mongoose";
import User from "../models/User.js";
import { deleteFile, uploadFile } from "../lib/upload.js";
import Contact from "../models/Contact.js";
import Message from "../models/Message.js";
import getDate from "../utils/getDate.js";

export async function createNewGroup(
  req: Request,
  res: Response
): Promise<void> {
  try {
    const { name, selectedUsers } = req.body;
    const groupImage = req.file;
    if (
      !name ||
      !groupImage ||
      !selectedUsers ||
      JSON.parse(selectedUsers).length === 0
    ) {
      res.status(400).send({ message: "Invalid request" });
      return;
    }

    const participants = JSON.parse(selectedUsers).map(
      (participant: {
        _id: string;
        name: string;
        firstName: string;
        isActive: boolean;
        avatar: string;
      }) => {
        return new mongoose.Types.ObjectId(participant._id);
      }
    );

    const objectUserId = new mongoose.Types.ObjectId(req.userId);
    const user = await User.findById(objectUserId).select("firstName");
    if (!user) {
      res.status(404).send({ message: "User not found" });
      return;
    }

    // upload the image
    const { url: image, publicId } = await uploadFile(
      groupImage,
      "groups",
      400,
      400
    );

    // create a new group
    const newGroupContact = await Contact.create({
      name,
      image,
      publicId,
      participants,
      admins: [objectUserId],
      isGroup: true,
      isActive: true,
    });

    const createdMessage = await Message.create({
      chatId: newGroupContact._id,
      sender: objectUserId,
      messageType: "announcement",
      summary: "created a new contact",
      announcer: user.firstName,
    });

    res.status(200).send({
      groupData: {
        _id: newGroupContact._id.toString(),
        contactName: newGroupContact.name,
        contactImage: newGroupContact.image,
        isGroup: newGroupContact.isGroup,
        isActive: newGroupContact.isActive,
        updatedAt: newGroupContact.updatedAt,
        lastMessages: [createdMessage],
      },
    });
  } catch (err) {
    console.log("Error creating new group - ", getDate(), "\n---\n", err);
    const errorMessage = err instanceof Error ? err.message : String(err);
    res.status(500).send({ message: "Server error", error: errorMessage });
  }
}

export async function updateGroup(req: Request, res: Response): Promise<void> {
  try {
    const { chatId, name, socials } = req.body;
    if (!chatId || !name) {
      res.status(400).send({ message: "Invalid request" });
      return;
    }

    const group = await Contact.findById(chatId);
    if (!group) {
      res.status(404).send({ message: "Group not found" });
      return;
    }

    if (req.file) {
      // upload the image
      try {
        const data = await uploadFile(req.file, "avatar", 600, 600);
        if (group.publicId) {
          await deleteFile(group.publicId);
        }
        group.image = data.url;
        group.publicId = data.publicId;
      } catch (error) {
        console.log("Error uploading avatar:", error);
        res.status(500).send({ message: "Image upload failed" });
        return;
      }
    }

    const socialLinks = JSON.parse(socials) as { type: string; link: string }[];
    group.name = name;
    group.socialLinks = socialLinks.map((link) => {
      return {
        type: link.type,
        link: link.link,
      };
    });
    await group.save();

    const user = await User.findById(req.userId).select("firstName");
    if (!user) {
      res.status(404).send({ message: "User not found" });
      return;
    }

    const updatedMessage = await Message.create({
      chatId: group._id,
      sender: req.userId,
      messageType: "announcement",
      summary: "updated the group info",
      announcer: user.firstName,
    });

    res.status(200).send({
      updatedContact: {
        _id: group._id.toString(),
        name: group.name,
        image: group.image,
        socialLinks: group.socialLinks,
        updatedMessage: {
          content: updatedMessage.content,
          messageType: updatedMessage.messageType,
          seenBy: updatedMessage.seenBy,
          createdAt: updatedMessage.createdAt,
          summary: updatedMessage.summary,
          announcer: updatedMessage.announcer,
          sender: {
            _id: updatedMessage.sender.toString(),
          },
        },
      },
    });
  } catch (err) {
    console.log("Error updating group - ", getDate(), "\n---\n", err);
    const errorMessage = err instanceof Error ? err.message : String(err);
    res.status(500).send({ message: "Server error", error: errorMessage });
  }
}
