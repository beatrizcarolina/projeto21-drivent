import { forbiddenError, notFoundError } from "@/errors";
import { bookingRepository, enrollmentRepository, ticketsRepository, hotelRepository } from "@/repositories";

async function getByUserId(userId: number) {
    const booking = await bookingRepository.findById(userId);

    if(!booking) throw notFoundError();
    return booking;
}

async function createBooking(userId: number, roomId: number) {
    const enrollment = await enrollmentRepository.findWithAddressByUserId(userId);
    if(!enrollment) throw forbiddenError('User does not have a enrollment');

    const ticket = await ticketsRepository.findTicketByEnrollmentId(enrollment.id);
    if (!ticket) throw forbiddenError('User does not have a ticket');
    if (ticket.TicketType.isRemote) throw forbiddenError('Ticket is remote');
    if (!ticket.TicketType.includesHotel) throw forbiddenError('Ticket does not include hotel');
    if (ticket.status !== 'PAID') throw forbiddenError('Ticket not paid');

    const room = await hotelRepository.findRoomsWithBooking(roomId);
    if (!room) throw notFoundError();
    if (room.capacity === room._count.Booking) throw forbiddenError('Room is full');

    const booking = await bookingRepository.findById(userId);
    if (booking) throw forbiddenError('User already has a booking');

    const newBooking = await bookingRepository.create(userId, roomId);
    return { bookingId: newBooking.id };
}

async function  updateBooking(userId: number, bookingId: number, roomId: number) {
    const booking = await bookingRepository.findById(userId);
    if(!booking) throw forbiddenError('User doesnt have a booking');
    if(booking.id !== bookingId) throw forbiddenError('Booking id doesnt match');

    const room = await hotelRepository.findRoomsWithBooking(roomId);
    if (!room) throw notFoundError();
    if(room.capacity === room._count.Booking) throw forbiddenError('Room is full');

    const updateBooking = await bookingRepository.updateByBookindAndRoomId(bookingId, roomId);
    
    return { bookingId: updateBooking.id };
}

export const bookingService = { getByUserId, createBooking, updateBooking };