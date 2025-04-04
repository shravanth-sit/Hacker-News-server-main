import { prisma } from "../../extras/prisma";
import { GetMeError, type GetAllUsersResult, type GetMeResult } from "./users-type";

export const getMe = async (parameters: { userId: string }): Promise<GetMeResult> => {
  const user = await prisma.user.findUnique({
    where: {
      id: parameters.userId,
    },
  });

  if (!user) {
    throw GetMeError.BAD_REQUEST;
  }

  return {
    user,
  };
};


// import { prismaClient } from "../prismaClient"; // Ensure this is correctly imported
// import { GetAllUsersResult } from "./user-types";

export const getAllUsers = async (page: number = 1, limit: number = 10): Promise<GetAllUsersResult> => {
  const skip = (page - 1) * limit;

  const users = await prisma.user.findMany({
    orderBy: { username: "asc" }, // Sort alphabetically
    skip,
    take: limit,
  });

  const totalUsers = await prisma.user.count(); // Get total number of users

  return {
    users,
    totalUsers,
    totalPages: Math.ceil(totalUsers / limit),
    currentPage: page,
  };
};