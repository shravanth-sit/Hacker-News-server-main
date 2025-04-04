import { prisma } from "../../extras/prisma";
import { 
  type CreatePostParameters,
  type CreatePostResult,
  CreatePostError,
  type GetPostsResult,
  GetPostsError,
  DeletePostError
} from "./Post-types";

export const createPost = async (
  parameters: CreatePostParameters & { userId: string }
): Promise<CreatePostResult> => {
  try {
    const post = await prisma.post.create({
      data: {
        title: parameters.title,
        content: parameters.content,
        userId: parameters.userId, // Fixed field name
      },
    });

    return { post };
  } catch (error) {
    console.error("Error creating post:", error);
    throw CreatePostError.UNKNOWN;
  }
};

export const getAllPosts = async (
  page: number = 1, 
  limit: number = 10
): Promise<GetPostsResult> => {
  try {
    const skip = (page - 1) * limit;

    const posts = await prisma.post.findMany({
      orderBy: { createdAt: "desc" },
      skip,
      take: limit,
      include: {
        author: {
          select: {
            id: true,
            username: true,
          },
        },
      },
    });

    const totalPosts = await prisma.post.count();

    return {
      posts,
      totalPosts,
      totalPages: Math.ceil(totalPosts / limit),
      currentPage: page,
    };
  } catch (error) {
    console.error("Error fetching posts:", error);
    throw GetPostsError.UNKNOWN;
  }
};

export const getUserPosts = async (
  userId: string,
  page: number = 1, 
  limit: number = 10
): Promise<GetPostsResult> => {
  try {
    const skip = (page - 1) * limit;

    const posts = await prisma.post.findMany({
      where: { userId }, // Fixed field name
      orderBy: { createdAt: "desc" },
      skip,
      take: limit,
      include: {
        author: {
          select: {
            id: true,
            username: true,
          },
        },
      },
    });

    const totalPosts = await prisma.post.count({
      where: { userId }, // Fixed field name
    });

    return {
      posts,
      totalPosts,
      totalPages: Math.ceil(totalPosts / limit),
      currentPage: page,
    };
  } catch (error) {
    console.error("Error fetching user posts:", error);
    throw GetPostsError.UNKNOWN;
  }
};

export const deletePost = async (
  postId: string, 
  userId: string
): Promise<void> => {
  // First, verify the post exists and belongs to the user
  const post = await prisma.post.findFirst({
    where: { 
      id: postId,
      userId, // Fixed field name
    },
  });

  if (!post) {
    throw DeletePostError.NOT_FOUND;
  }

  // Delete the post
  try {
    await prisma.post.delete({
      where: { id: postId },
    });
  } catch (error) {
    console.error("Error deleting post:", error);
    throw DeletePostError.UNKNOWN;
  }
};