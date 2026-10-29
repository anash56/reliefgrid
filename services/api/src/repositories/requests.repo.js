import { prisma } from '../db.js';

export const createRequest = (data) =>
  prisma.$transaction(async (tx) => {
    const request = await tx.helpRequest.create({
      data: {
        type: data.type,
        description: data.description,
        lat: data.lat,
        lng: data.lng,
        urgency: data.urgency,
        priority_score: data.priorityScore,
        contact: data.contact ?? null,
      },
    });

    await tx.requestHistory.create({
      data: {
        request_id: request.id,
        from_status: null,
        to_status: request.status,
        actor: data.actor ?? 'anonymous',
      },
    });

    return request;
  });

export const getRequestById = (id) => prisma.helpRequest.findUnique({ where: { id } });

export const listRequests = ({ status, limit, offset }) =>
  prisma.helpRequest.findMany({
    where: status ? { status } : {},
    orderBy: { created_at: 'desc' },
    take: limit,
    skip: offset,
  });