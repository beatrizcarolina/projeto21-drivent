import { TicketStatus } from '@prisma/client';
import { bookingService } from '@/services';
import { bookingRepository, hotelRepository, ticketsRepository, enrollmentRepository } from '@/repositories';

beforeEach(() => {
  jest.clearAllMocks();
  jest.resetAllMocks();
});

describe('getByUserId', () => {
  const booking = {
    id: 1,
    Room: {
      id: 1,
      name: 'name',
      capacity: 10,
      hotelId: 1,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  };

  it('should throw not found error when there is no reservation for given user', async () => {
    jest.spyOn(bookingRepository, 'findById').mockResolvedValueOnce(null);

    const promise = bookingService.getByUserId(1);
    expect(promise).rejects.toEqual({
      name: 'NotFoundError',
      //message: 'Booking not found',
    });
  });

  it('should return booking when successful', async () => {
    jest.spyOn(bookingRepository, 'findById').mockResolvedValueOnce(booking);

    const promise = bookingService.getByUserId(1);
    expect(promise).resolves.toEqual(booking);
  });
});

describe('create', () => {
  const enrollment = {
    id: 1,
    userId: 1,
    name: 'name',
    cpf: 'cpf',
    birthday: new Date(),
    phone: 'phone',
    createdAt: new Date(),
    updatedAt: new Date(),
    Address: [
      {
        id: 1,
        enrollmentId: 1,
        addressDetail: 'detail',
        cep: 'cep',
        city: 'city',
        neighborhood: 'neighborhood',
        number: 'number',
        state: 'state',
        street: 'street',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ],
  };
  const ticket = {
    id: 1,
    ticketTypeId: 1,
    enrollmentId: 1,
    status: TicketStatus.PAID,
    createdAt: new Date(),
    updatedAt: new Date(),
    TicketType: {
      id: 1,
      name: 'name',
      price: 200,
      isRemote: false,
      includesHotel: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  };
  const room = {
    capacity: 5,
    _count: {
      Booking: 0,
    },
  };
  const inputBooking = {
    userId: 1,
    roomId: 1,
  };
  const booking = {
    id: 1,
    userId: 1,
    roomId: 1,
    Room: {
      id: 1,
      name: 'name',
      capacity: 5,
      hotelId: 1,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  it('should throw forbidden error when there is no enrollment for given user', async () => {
    jest.spyOn(enrollmentRepository, 'findWithAddressByUserId').mockResolvedValueOnce(null);
    jest.spyOn(bookingRepository, 'findById').mockResolvedValueOnce(null);
    jest.spyOn(hotelRepository, 'findRoomsWithBooking').mockResolvedValueOnce(room);
    jest.spyOn(ticketsRepository, 'findTicketByEnrollmentId').mockResolvedValueOnce(ticket);

    const promise = bookingService.createBooking(inputBooking.userId, inputBooking.roomId);

    expect(promise).rejects.toEqual({
      name: 'forbiddenError',
      message: 'User does not have enrollment',
    });
  });

  it('should throw forbidden error when there is no ticket for given user', async () => {
    jest.spyOn(enrollmentRepository, 'findWithAddressByUserId').mockResolvedValueOnce(enrollment);
    jest.spyOn(ticketsRepository, 'findTicketByEnrollmentId').mockResolvedValueOnce(null);
    jest.spyOn(bookingRepository, 'findById').mockResolvedValueOnce(null);
    jest.spyOn(hotelRepository, 'findRoomsWithBooking').mockResolvedValueOnce(room);

    const promise = bookingService.createBooking(inputBooking.userId, inputBooking.roomId);

    expect(promise).rejects.toEqual({
      name: 'forbiddenError',
      message: 'User does not have ticket',
    });
  });

  it('should throw forbidden error when ticket is remote', async () => {
    jest.spyOn(enrollmentRepository, 'findWithAddressByUserId').mockResolvedValueOnce(enrollment);
    jest
      .spyOn(ticketsRepository, 'findTicketByEnrollmentId')
      .mockResolvedValueOnce({ ...ticket, TicketType: { ...ticket.TicketType, isRemote: true } });
    jest.spyOn(bookingRepository, 'findById').mockResolvedValueOnce(null);
    jest.spyOn(hotelRepository, 'findRoomsWithBooking').mockResolvedValueOnce(room);

    const promise = bookingService.createBooking(inputBooking.userId, inputBooking.roomId);

    expect(promise).rejects.toEqual({
      name: 'forbiddenError',
      message: 'Ticket is remote',
    });
  });

  it('should throw forbidden error when ticket does not include hotel', async () => {
    jest.spyOn(enrollmentRepository, 'findWithAddressByUserId').mockResolvedValueOnce(enrollment);
    jest
      .spyOn(ticketsRepository, 'findTicketByEnrollmentId')
      .mockResolvedValueOnce({ ...ticket, TicketType: { ...ticket.TicketType, includesHotel: false } });
    jest.spyOn(bookingRepository, 'findById').mockResolvedValueOnce(null);
    jest.spyOn(hotelRepository, 'findRoomsWithBooking').mockResolvedValueOnce(room);

    const promise = bookingService.createBooking(inputBooking.userId, inputBooking.roomId);

    expect(promise).rejects.toEqual({
      name: 'forbiddenError',
      message: 'Ticket does not include hotel',
    });
  });

  it('should throw forbidden error when ticket is not paid', async () => {
    jest.spyOn(enrollmentRepository, 'findWithAddressByUserId').mockResolvedValueOnce(enrollment);
    jest
      .spyOn(ticketsRepository, 'findTicketByEnrollmentId')
      .mockResolvedValueOnce({ ...ticket, status: TicketStatus.RESERVED });
    jest.spyOn(bookingRepository, 'findById').mockResolvedValueOnce(null);
    jest.spyOn(hotelRepository, 'findRoomsWithBooking').mockResolvedValueOnce(room);

    const promise = bookingService.createBooking(inputBooking.userId, inputBooking.roomId);

    expect(promise).rejects.toEqual({
      name: 'forbiddenError',
      message: 'Ticket not paid',
    });
  });

  it('should throw not found error when room does not exist', async () => {
    jest.spyOn(hotelRepository, 'findRoomsWithBooking').mockResolvedValueOnce(null);
    jest.spyOn(enrollmentRepository, 'findWithAddressByUserId').mockResolvedValueOnce(enrollment);
    jest.spyOn(ticketsRepository, 'findTicketByEnrollmentId').mockResolvedValueOnce(ticket);
    jest.spyOn(bookingRepository, 'findById').mockResolvedValueOnce(null);

    const promise = bookingService.createBooking(inputBooking.userId, inputBooking.roomId);

    expect(promise).rejects.toEqual({
      name: 'NotFoundError',
      //message: 'Room not found',
    });
  });

  it('should throw forbidden error when room is at full capacity', async () => {
    jest.spyOn(enrollmentRepository, 'findWithAddressByUserId').mockResolvedValueOnce(enrollment);
    jest.spyOn(ticketsRepository, 'findTicketByEnrollmentId').mockResolvedValueOnce(ticket);
    jest.spyOn(bookingRepository, 'findById').mockResolvedValueOnce(null);
    jest.spyOn(hotelRepository, 'findRoomsWithBooking').mockResolvedValueOnce({
      capacity: 5,
      _count: {
        Booking: 5,
      },
    });

    const promise = bookingService.createBooking(inputBooking.userId, inputBooking.roomId);

    expect(promise).rejects.toEqual({
      name: 'forbiddenError',
      message: 'Room is full',
    });
  });

  it('should throw forbidden error when there is already a booking for given user', async () => {
    jest.spyOn(enrollmentRepository, 'findWithAddressByUserId').mockResolvedValueOnce(enrollment);
    jest.spyOn(ticketsRepository, 'findTicketByEnrollmentId').mockResolvedValueOnce(ticket);
    jest.spyOn(hotelRepository, 'findRoomsWithBooking').mockResolvedValueOnce(room);
    jest.spyOn(bookingRepository, 'findById').mockResolvedValueOnce(booking);

    const promise = bookingService.createBooking(inputBooking.userId, inputBooking.roomId);

    expect(promise).rejects.toEqual({
      name: 'forbiddenError',
      message: 'User already has a booking',
    });
  });

  it('should return booking id when successful', async () => {
    jest.spyOn(enrollmentRepository, 'findWithAddressByUserId').mockResolvedValueOnce(enrollment);
    jest.spyOn(bookingRepository, 'findById').mockResolvedValueOnce(null);
    jest.spyOn(ticketsRepository, 'findTicketByEnrollmentId').mockResolvedValueOnce(ticket);
    jest.spyOn(hotelRepository, 'findRoomsWithBooking').mockResolvedValueOnce(room);
    jest.spyOn(bookingRepository, 'create').mockResolvedValueOnce(booking);

    const promise = bookingService.createBooking(inputBooking.userId, inputBooking.roomId);

    expect(promise).resolves.toEqual({
      bookingId: booking.id,
    });
  });
});

describe('updateBooking', () => {
  const inputBooking = {
    userId: 1,
    roomId: 2,
  };
  const room = {
    capacity: 5,
    _count: {
      Booking: 0,
    },
  };
  const booking = {
    id: 1,
    userId: 1,
    roomId: 1,
    Room: {
      id: 1,
      name: 'name',
      capacity: 5,
      hotelId: 1,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  it('should throw forbidden error when there is no booking for given user', async () => {
    jest.spyOn(bookingRepository, 'findById').mockResolvedValueOnce(null);
    jest.spyOn(hotelRepository, 'findRoomsWithBooking').mockResolvedValueOnce(room);

    const promise = bookingService.updateBooking(inputBooking.userId, booking.id, inputBooking.roomId);

    expect(promise).rejects.toEqual({
      name: 'forbiddenError',
      message: 'User does not have booking',
    });
  });

  it('should throw forbidden error when booking id does not match user booking id', async () => {
    jest.spyOn(bookingRepository, 'findById').mockResolvedValueOnce(booking);
    jest.spyOn(hotelRepository, 'findRoomsWithBooking').mockResolvedValueOnce(room);

    const promise = bookingService.updateBooking(inputBooking.userId, booking.id + 1, inputBooking.roomId);

    expect(promise).rejects.toEqual({
      name: 'forbiddenError',
      message: 'Booking id does not match',
    });
  });

  it('should throw not found error when room does not exist', async () => {
    jest.spyOn(bookingRepository, 'findById').mockResolvedValueOnce(booking);
    jest.spyOn(hotelRepository, 'findRoomsWithBooking').mockResolvedValueOnce(null);

    const promise = bookingService.updateBooking(inputBooking.userId, booking.id, inputBooking.roomId);

    expect(promise).rejects.toEqual({
      name: 'NotFoundError',
      //message: 'Room not found',
    });
  });

  it('should throw forbidden error when room is at full capacity', async () => {
    jest.spyOn(bookingRepository, 'findById').mockResolvedValueOnce(booking);
    jest.spyOn(hotelRepository, 'findRoomsWithBooking').mockResolvedValueOnce({
      capacity: 5,
      _count: {
        Booking: 5,
      },
    });

    const promise = bookingService.updateBooking(inputBooking.userId, booking.id, inputBooking.roomId);

    expect(promise).rejects.toEqual({
      name: 'forbiddenError',
      message: 'Room is full',
    });
  });

  it('should return booking id when successful', async () => {
    jest.spyOn(bookingRepository, 'findById').mockResolvedValueOnce(booking);
    jest.spyOn(hotelRepository, 'findRoomsWithBooking').mockResolvedValueOnce(room);
    jest.spyOn(bookingRepository, 'updateByBookindAndRoomId').mockResolvedValueOnce(booking);

    const promise = bookingService.updateBooking(inputBooking.userId, booking.id, inputBooking.roomId);

    expect(promise).resolves.toEqual({ bookingId: booking.id });
  });
});