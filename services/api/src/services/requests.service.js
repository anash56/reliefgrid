import { AppError } from '../middleware/errors.js';
import * as repo from '../repositories/requests.repo.js';

// Placeholder scoring. Week 6 replaces this with the real priority formula.
const calculatePriority = ({ urgency }) => urgency * 20;

export const createRequest = async (input) => {
  const priorityScore = calculatePriority(input);
  return repo.createRequest({ ...input, priorityScore });
};

export const getRequest = async (id) => {
  const request = await repo.getRequestById(id);
  if (!request) {
    throw new AppError(404, 'REQUEST_NOT_FOUND', 'No request with that id');
  }
  return request;
};

export const listRequests = (filters) => repo.listRequests(filters);