import responseHandler from "../utils/responseHandle.js";
import prisma from "../utils/prisma.js";
import { hashPassword } from "../utils/hashPassowrd.js";

export const getUsersController = async (req, res) => {
  try {
    const users = await prisma.user.findMany();
    const formattedUser = users.map(user => {
      const publicUserData = {
        id: user.id,
        username: user.username,
        email: user.email,
        avatar: user.avatar,
        createdAt: user.createdAt
      };
      return publicUserData;
    });
    responseHandler(res, 200, true, "All users fetched successfully", formattedUser);
  } catch (err) {
    console.log(err);
    responseHandler(res, 500, false, "Failed to get users!");
  }
};

export const getUserController = async (req, res) => {
  const id = req.params.id;
  try {
    const user = await prisma.user.findUnique({
      where: { id },
    });
    if (!user) {
      return responseHandler(res, 404, false, "User not found!");
    }
    const { password, ...userData } = user;
    responseHandler(res, 200, true, "User fetched successfully", userData);
  } catch (err) {
    console.log(err);
    responseHandler(res, 500, false, "Failed to get user!");
  }
};

export const adminUpdateUserController = async (req, res) => {
  const id = req.params.id;
  const { password, avatar, ...inputs } = req.body;

  let updatedPassword = null;
  try {
    if (password) {
      updatedPassword = await hashPassword(password);
    }

    const updatedUser = await prisma.user.update({
      where: { id },
      data: {
        ...inputs,
        ...(updatedPassword && { password: updatedPassword }),
        ...(avatar && { avatar }),
      },
    });

    // Audit log: track the admin update action in database
    await prisma.adminAction.create({
      data: {
        adminId: req.admin.id,
        actionType: "UPDATE",
        targetUserId: id
      }
    });

    const { password: userPassword, ...rest } = updatedUser;
    responseHandler(res, 200, true, "User updated successfully by admin", rest);
  } catch (err) {
    console.log(err);
    responseHandler(res, 500, false, "Failed to update user!");
  }
};

export const adminDeleteUserController = async (req, res) => {
  const id = req.params.id;

  try {
    await prisma.user.delete({
      where: { id },
    });

    // Audit log: track the admin delete action in database
    await prisma.adminAction.create({
      data: {
        adminId: req.admin.id,
        actionType: "DELETE",
        targetUserId: id
      }
    });

    responseHandler(res, 200, true, "User deleted successfully by admin");
  } catch (err) {
    console.log(err);
    responseHandler(res, 500, false, "Failed to delete user!");
  }
};
