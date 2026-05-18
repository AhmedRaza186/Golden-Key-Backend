import responseHandler from "./responseHandle.js";
import prisma from "./prisma.js";

export const verifyAdmin = async (req, res, next) => {
  const adminToken = req.headers["admin-token"];

  if (!adminToken) {
    return responseHandler(res, 401, false, "Admin token is missing!");
  }

  try {
    const admin = await prisma.admin.findUnique({
      where: { token: adminToken },
    });

    if (!admin) {
      return responseHandler(res, 403, false, "Invalid Admin token!");
    }

    req.admin = admin; // Store admin details for audit tracking
    next();
  } catch (err) {
    console.log(err);
    return responseHandler(res, 500, false, "Internal Server Error during admin verification!");
  }
};
