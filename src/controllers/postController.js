import prisma from "../utils/prisma.js";
import responseHandler from "../utils/responseHandle.js";
import jwt from "jsonwebtoken";

export const getPosts = async (req, res) => {
  const query = req.query;

  try {
    const posts = await prisma.post.findMany({
      where: {
        city: query.city || undefined,
        type: query.type || undefined,
        property: query.property || undefined,
        bedroom: parseInt(query.bedroom) || undefined,
        price: {
          gte: parseInt(query.minPrice) || undefined,
          lte: parseInt(query.maxPrice) || undefined,
        },
      },
    });

    responseHandler(res, 200, true, "Posts fetched successfully", posts);
  } catch (err) {
    console.log(err);
    responseHandler(res, 500, false, "Failed to get posts");
  }
};

export const getPost = async (req, res) => {
  const id = req.params.id;
  try {
    const post = await prisma.post.findUnique({
      where: { id },
      include: {
        postDetail: true,
        user: {
          select: {
            username: true,
            avatar: true,
          },
        },
      },
    });

    if (!post) {
      return responseHandler(res, 404, false, "Post not found!");
    }

    let isSaved = false;
    const token = req.cookies?.token;

    if (token) {
      try {
        const payload = jwt.verify(token, process.env.JWT_SECRET);
        const saved = await prisma.savedPost.findUnique({
          where: {
            userId_postId: {
              postId: id,
              userId: payload.id,
            },
          },
        });
        isSaved = !!saved;
      } catch (err) {
        // ignore invalid tokens
      }
    }

    responseHandler(res, 200, true, "Post fetched successfully", { ...post, isSaved });
  } catch (err) {
    console.log(err);
    responseHandler(res, 500, false, "Failed to get post");
  }
};

export const addPost = async (req, res) => {
  const body = req.body;
  const tokenUserId = req.userId;

  try {
    const newPost = await prisma.post.create({
      data: {
        ...body.postData,
        userId: tokenUserId,
        postDetail: {
          create: body.postDetail,
        },
      },
    });
    responseHandler(res, 201, true, "Post created successfully", newPost);
  } catch (err) {
    console.log(err);
    responseHandler(res, 500, false, "Failed to create post");
  }
};

export const updatePost = async (req, res) => {
  const id = req.params.id;
  const tokenUserId = req.userId;
  const body = req.body;

  try {
    const updateResult = await prisma.post.updateMany({
      where: {
        id,
        userId: tokenUserId,
      },
      data: {
        ...body,
      },
    });

    if (updateResult.count === 0) {
      return responseHandler(res, 403, false, "Not Authorized or Post not found!");
    }

    responseHandler(res, 200, true, "Post updated successfully");
  } catch (err) {
    console.log(err);
    responseHandler(res, 500, false, "Failed to update post");
  }
};

export const deletePost = async (req, res) => {
  const id = req.params.id;
  const tokenUserId = req.userId;

  try {
    const post = await prisma.post.findUnique({
      where: { id },
    });

    if (!post) {
      return responseHandler(res, 404, false, "Post not found!");
    }

    if (post.userId !== tokenUserId) {
      return responseHandler(res, 403, false, "Not Authorized!");
    }

    await prisma.$transaction([
      prisma.postDetail.deleteMany({
        where: { postId: id },
      }),
      prisma.post.delete({
        where: { id },
      }),
    ]);

    responseHandler(res, 200, true, "Post deleted successfully");
  } catch (err) {
    console.log(err);
    responseHandler(res, 500, false, "Failed to delete post");
  }
};