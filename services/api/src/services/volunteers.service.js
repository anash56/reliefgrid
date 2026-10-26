import { AppError } from '../middleware/errors.js';
import * as repo from '../repositories/volunteers.repo.js';

const notFound = () => new AppError(404, 'VOLUNTEER_NOT_FOUND', 'No volunteer with that id');

export const registerVolunteer = (input) => repo.createVolunteer(input);

export const getVolunteer = async (id) => {
  const volunteer = await repo.getVolunteerById(id);
  if (!volunteer) throw notFound();
  return volunteer;
};

export const listVolunteers = (filters) => repo.listVolunteers(filters);

export const setAvailability = async (id, available) => {
  const volunteer = await repo.setAvailability(id, available);
  if (!volunteer) throw notFound();
  return volunteer;
};

export const updateLocation = async (id, lat, lng) => {
  const volunteer = await repo.updateLocation(id, lat, lng);
  if (!volunteer) throw notFound();
  return volunteer;
};

export const findNearby = (query) => repo.findNearby(query);