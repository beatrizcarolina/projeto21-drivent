import { TicketStatus } from '@prisma/client';
import { invalidDataError, notFoundError } from '@/errors';
import { CreateTicket } from '@/protocols';
import { enrollmentRepository, ticketsRepository } from '@/repositories';

async function getTicketTypes() {
  const ticketTypes = await ticketsRepository.getTicket();
  return ticketTypes;
}

async function getTicketByUserId(userId: number) {
  const enrollment = await enrollmentRepository.findWithAddressByUserId(userId);
  if (!enrollment) throw notFoundError();

  const ticket = await ticketsRepository.getTicketById(enrollment.id);
  if (!ticket) throw notFoundError();

  return ticket;
}

async function createTicket(userId: number, ticketTypeId: number) {
  if (!ticketTypeId) throw invalidDataError('ticketTypeId');

  const enrollment = await enrollmentRepository.findWithAddressByUserId(userId);
  if (!enrollment) throw notFoundError();

  const ticketData: CreateTicket = {
    enrollmentId: enrollment.id,
    ticketTypeId,
    status: TicketStatus.RESERVED,
  };

  const ticket = await ticketsRepository.createTicket(ticketData);
  return ticket;
}

export const ticketsService = {
  getTicketTypes,
  getTicketByUserId,
  createTicket
};