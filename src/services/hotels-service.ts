import { notFoundError, paymentError } from '@/errors';
import { enrollmentRepository, ticketsRepository, hotelsRepository } from '@/repositories';

async function getHotels(userId: number) {
  const hotels = await hotelsRepository.findHotels();
  if (hotels.length === 0) throw notFoundError();

  const enrollment = await enrollmentRepository.findWithAddressByUserId(userId);
  if (!enrollment) throw notFoundError();

  const ticket = await ticketsRepository.findTicketByEnrollmentId(enrollment.id);
  if (!ticket) throw notFoundError();

  if (ticket.status !== 'PAID') throw paymentError('Payment Required');

  if (ticket.TicketType.includesHotel === false) throw paymentError('Ticket does not include hotel');

  if (ticket.TicketType.isRemote === true) throw paymentError('Ticket is remote');

  return hotels;
}

async function getHotelById(userId: number, hotelId: number) {
    const hotel = await hotelsRepository.findHotelById(hotelId);
    if (!hotel) throw notFoundError();

    const enrollment = await enrollmentRepository.findWithAddressByUserId(userId);
    if (!enrollment) throw notFoundError();
  
    const ticket = await ticketsRepository.findTicketByEnrollmentId(enrollment.id);
    if (!ticket) throw notFoundError();
    
    if (ticket.status !== 'PAID') throw paymentError('Payment Required');

    if (ticket.TicketType.includesHotel === false) throw paymentError('Ticket does not include hotel');

    if (ticket.TicketType.isRemote === true) throw paymentError('Ticket is remote');
 
    return hotel;
}
  
  export const hotelsService = { getHotels, getHotelById };
  