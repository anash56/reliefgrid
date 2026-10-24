import { parse } from '../middleware/validate.js';
import {
  createRequestSchema,
  idParamSchema,
  listQuerySchema,
} from '../validators/requests.validator.js';
import * as requestsService from '../services/requests.service.js';

export const create = async (req, res) => {
  const input = parse(createRequestSchema, req.body);
  const request = await requestsService.createRequest(input);
  req.log.info({ helpRequestId: request.id }, 'help request created');
  res.status(201).json({ data: request });
};

export const list = async (req, res) => {
  const filters = parse(listQuerySchema, req.query);
  const requests = await requestsService.listRequests(filters);
  res.json({ data: requests, count: requests.length });
};

export const getById = async (req, res) => {
  const { id } = parse(idParamSchema, req.params);
  const request = await requestsService.getRequest(id);
  res.json({ data: request });
};