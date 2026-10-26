import { parse } from '../middleware/validate.js';
import { idParamSchema } from '../validators/requests.validator.js';
import {
  registerVolunteerSchema,
  availabilitySchema,
  locationSchema,
  listVolunteersQuerySchema,
  nearbyQuerySchema,
} from '../validators/volunteers.validator.js';
import * as volunteersService from '../services/volunteers.service.js';

export const register = async (req, res) => {
  const input = parse(registerVolunteerSchema, req.body);
  const volunteer = await volunteersService.registerVolunteer(input);
  req.log.info({ volunteerId: volunteer.id }, 'volunteer registered');
  res.status(201).json({ data: volunteer });
};

export const list = async (req, res) => {
  const filters = parse(listVolunteersQuerySchema, req.query);
  const volunteers = await volunteersService.listVolunteers(filters);
  res.json({ data: volunteers, count: volunteers.length });
};

export const getById = async (req, res) => {
  const { id } = parse(idParamSchema, req.params);
  res.json({ data: await volunteersService.getVolunteer(id) });
};

export const setAvailability = async (req, res) => {
  const { id } = parse(idParamSchema, req.params);
  const { available } = parse(availabilitySchema, req.body);
  res.json({ data: await volunteersService.setAvailability(id, available) });
};

export const updateLocation = async (req, res) => {
  const { id } = parse(idParamSchema, req.params);
  const { lat, lng } = parse(locationSchema, req.body);
  res.json({ data: await volunteersService.updateLocation(id, lat, lng) });
};

export const nearby = async (req, res) => {
  const query = parse(nearbyQuerySchema, req.query);
  const volunteers = await volunteersService.findNearby(query);
  res.json({ data: volunteers, count: volunteers.length });
};