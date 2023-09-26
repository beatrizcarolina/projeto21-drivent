import { prisma } from '@/config';
import { CreateTicket } from '@/protocols';

async function getTicket() {
  const result = await prisma.ticketType.findMany();
  return result;
};

async function getTicketById(enrollmentId: number) {
  const result = await prisma.ticket.findUnique({
    where: { enrollmentId },
    include: { TicketType: true },
  });

  return result;
};

async function createTicket(ticket: CreateTicket) {
  const result = await prisma.ticket.create({
    data: ticket,
    include: { TicketType: true },
  });

  return result;
};

export const ticketsRepository = {
  getTicket,
  getTicketById,
  createTicket
};