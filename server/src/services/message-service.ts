import prisma from '../utils/prisma';

export const getMessages = async (conversationId: number) => {
  return prisma.message.findMany({
    where: { conversationId },
    orderBy: { createdAt: 'asc' },
  });
};

export const createMessage = async (
  conversationId: number,
  senderCognitoId: string,
  content: string,
) => {
  return prisma.message.create({
    data: { conversationId, senderCognitoId, content },
  });
};
