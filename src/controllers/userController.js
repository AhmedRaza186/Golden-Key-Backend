import responseHandler from "../utils/responseHandle.js";
import { verifyToken } from "../utils/verifyToken.js";
import prisma from "../utils/prisma.js";
import { hashPassword } from "../utils/hashPassowrd.js";


export const getLogginedInUserController = async (req, res) => {
  try {
    const id = req.userId;

    let loggedInUser = await prisma.user.findUnique({
      where: { id },
    });

    let isAdmin = false;

    if (!loggedInUser) {
      loggedInUser = await prisma.admin.findUnique({
        where: { id },
      });
      if (loggedInUser) {
        isAdmin = true;
      }
    }

    if (!loggedInUser) {
      return responseHandler(res, 404, false, "User not found!");
    }

    const { password, ...userData } = loggedInUser;
    responseHandler(res, 200, true, "User fetched successfully", { ...userData, isAdmin });
  } catch (err) {
    console.log(err);
    responseHandler(res, 500, false, "Failed to get logged in user!");
  }
};

export const getUsersController = async (req, res) => {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        username: true,
        email: true,
        avatar: true,
        createdAt: true,
      }
    });
    responseHandler(res, 200, true, "Public users fetched successfully", users);
  } catch (err) {
    console.log(err);
    responseHandler(res, 500, false, "Failed to get users!");
  }
};

export const updateUserController = async (req, res) => {
  const id = req.userId;
  const { password, avatar, ...inputs } = req.body;

  let updatedPassword = null;
  try { 
    if (password) {
      updatedPassword = await hashPassword(password)
    }

    const updatedUser = await prisma.user.update({
      where: { id },
      data: {
        ...inputs,
        ...(updatedPassword && { password: updatedPassword }),
        ...(avatar && { avatar }),
      },
    });

    const { password: userPassword, ...rest } = updatedUser;

    responseHandler(res, 200, true, "User updated successfully", rest);
  } catch (err) {
    console.log(err);
    responseHandler(res, 500, false, "Failed to update user!");
  }
};

export const deleteUserController = async (req, res) => {
  const id = req.userId;

  try {
    await prisma.user.delete({
      where: { id },
    });
    responseHandler(res, 200, true, "User deleted successfully");
  } catch (err) {
    console.log(err);
    responseHandler(res, 500, false, "Failed to delete user!");
  }
};

export const savePost = async (req, res) => {
  const postId = req.body.postId;
  const tokenUserId = req.userId;

  try {
    const savedPost = await prisma.savedPost.findUnique({
      where: {
        userId_postId: {
          userId: tokenUserId,
          postId,
        },
      },
    });

    if (savedPost) {
      await prisma.savedPost.delete({
        where: {
          id: savedPost.id,
        },
      });
      responseHandler(res, 200, true, "Post removed from saved list");
    } else {
      await prisma.savedPost.create({
        data: {
          userId: tokenUserId,
          postId,
        },
      });
      responseHandler(res, 200, true, "Post saved successfully");
    }
  } catch (err) {
    console.log(err);
    responseHandler(res, 500, false, "Failed to save/unsave post!");
  }
};

export const profilePosts = async (req, res) => {
  const tokenUserId = req.userId;
  try {
    const userPosts = await prisma.post.findMany({
      where: { userId: tokenUserId },
    });
    const saved = await prisma.savedPost.findMany({
      where: { userId: tokenUserId },
      include: {
        post: true,
      },
    });

    const savedPosts = saved.map((item) => item.post);
    responseHandler(res, 200, true, "Profile posts fetched successfully", { userPosts, savedPosts });
  } catch (err) {
    console.log(err);
    responseHandler(res, 500, false, "Failed to get profile posts!");
  }
};

export const getNotificationNumber = async (req, res) => {
  const tokenUserId = req.userId;
  try {
    const number = await prisma.chat.count({
      where: {
        userIDs: {
          hasSome: [tokenUserId],
        },
        NOT: {
          seenBy: {
            hasSome: [tokenUserId],
          },
        },
      },
    });
    responseHandler(res, 200, true, "Notification count fetched successfully", number);
  } catch (err) {
    console.log(err);
    responseHandler(res, 500, false, "Failed to get notification count!");
  }
};


