import app, { init } from "@/app"
import { cleanDb, generateValidToken } from "../helpers";
import supertest from "supertest";
import httpStatus from "http-status";
import * as jwt from 'jsonwebtoken';
import { createBooking, createEnrollmentWithAddress, createHotel, createRoomWithHotelId, createTicket, createTicketType, createUser } from "../factories";
import faker from "@faker-js/faker";
import { TicketStatus } from "@prisma/client";

beforeAll(async () => {
    await init();
    await cleanDb();
});

const server = supertest(app);

describe('GET /booking', () => {
    it('should respond with status 401 if no token is given', async () => {
        const response = await server.get('/booking');
    
        expect(response.status).toBe(httpStatus.UNAUTHORIZED);
      });
    
    it('should respond with status 401 if given token is not valid', async () => {
        const token = faker.lorem.word();

        const response = await server.get('/booking').set('Authorization', `Bearer ${token}`);

        expect(response.status).toBe(httpStatus.UNAUTHORIZED);
    });

    it('should respond with status 401 if there is no session for given token', async () => {
        const userWithoutSession = await createUser();
        const token = jwt.sign({ userId: userWithoutSession.id }, process.env.JWT_SECRET);

        const response = await server.get('/booking').set('Authorization', `Bearer ${token}`);

        expect(response.status).toBe(httpStatus.UNAUTHORIZED);
    });
    
    describe('when token is valid', () => {
        it('should respond with status 404 when there is no booking for given user', async () => {
          const user = await createUser();
          const token = await generateValidToken(user);
    
          const response = await server.get('/booking').set('Authorization', `Bearer ${token}`);
    
          expect(response.status).toEqual(httpStatus.NOT_FOUND);
        });
    
        it('should respond with status 200 and with booking', async () => {
          const user = await createUser();
          const token = await generateValidToken(user);
          const enrollment = await createEnrollmentWithAddress(user);
          const ticketType = await createTicketType(false, true);
          await createTicket(enrollment.id, ticketType.id, TicketStatus.PAID);
          const hotel = await createHotel();
          const room = await createRoomWithHotelId(hotel.id);
          const booking = await createBooking(user.id, room.id);
    
          const response = await server.get('/booking').set('Authorization', `Bearer ${token}`);
    
          expect(response.status).toEqual(httpStatus.OK);
          expect(response.body).toEqual({
            ...booking,
            Room: {
              ...booking.Room,
              createdAt: booking.Room.createdAt.toISOString(),
              updatedAt: booking.Room.updatedAt.toISOString(),
            },
          });
        });
      });
    });
    
describe('POST /booking', () => {
    it('should respond with status 401 if no token is given', async () => {
        const response = await server.post('/booking');

        expect(response.status).toBe(httpStatus.UNAUTHORIZED);
    });

    it('should respond with status 401 if given token is not valid', async () => {
        const token = faker.lorem.word();

        const response = await server.post('/booking').set('Authorization', `Bearer ${token}`);

        expect(response.status).toBe(httpStatus.UNAUTHORIZED);
    });

    it('should respond with status 401 if there is no session for given token', async () => {
        const userWithoutSession = await createUser();
        const token = jwt.sign({ userId: userWithoutSession.id }, process.env.JWT_SECRET);

        const response = await server.post('/booking').set('Authorization', `Bearer ${token}`);

        expect(response.status).toBe(httpStatus.UNAUTHORIZED);
    });
    
    describe('when token is valid', () => {
        it('should respond with status 400 when roomId is not present in body', async () => {
          const user = await createUser();
          const token = await generateValidToken(user);
    
          const response = await server.post('/booking').set('Authorization', `Bearer ${token}`).send({});
    
          expect(response.status).toEqual(httpStatus.BAD_REQUEST);
        });
    
        it('should respond with status 403 when there is no enrollment for given user', async () => {
          const user = await createUser();
          const token = await generateValidToken(user);
          const hotel = await createHotel();
          const room = await createRoomWithHotelId(hotel.id);
    
          const response = await server.post('/booking').set('Authorization', `Bearer ${token}`).send({ roomId: room.id });
    
          expect(response.status).toEqual(httpStatus.FORBIDDEN);
        });
    
        it('should respond with status 403 when there is no ticket for given user', async () => {
          const user = await createUser();
          const token = await generateValidToken(user);
          await createEnrollmentWithAddress(user);
          await createTicketType(false, true);
          const hotel = await createHotel();
          const room = await createRoomWithHotelId(hotel.id);
    
          const response = await server.post('/booking').set('Authorization', `Bearer ${token}`).send({ roomId: room.id });
    
          expect(response.status).toEqual(httpStatus.FORBIDDEN);
        });
    
        it('should respond with status 403 when ticket is remote', async () => {
          const user = await createUser();
          const token = await generateValidToken(user);
          const enrollment = await createEnrollmentWithAddress(user);
          const ticketType = await createTicketType(true, true);
          await createTicket(enrollment.id, ticketType.id, TicketStatus.PAID);
          const hotel = await createHotel();
          const room = await createRoomWithHotelId(hotel.id);
    
          const response = await server.post('/booking').set('Authorization', `Bearer ${token}`).send({ roomId: room.id });
    
          expect(response.status).toEqual(httpStatus.FORBIDDEN);
        });
    
        it('should respond with status 403 when ticket does not include hotel', async () => {
          const user = await createUser();
          const token = await generateValidToken(user);
          const enrollment = await createEnrollmentWithAddress(user);
          const ticketType = await createTicketType(false, false);
          await createTicket(enrollment.id, ticketType.id, TicketStatus.PAID);
          const hotel = await createHotel();
          const room = await createRoomWithHotelId(hotel.id);
    
          const response = await server.post('/booking').set('Authorization', `Bearer ${token}`).send({ roomId: room.id });
    
          expect(response.status).toEqual(httpStatus.FORBIDDEN);
        });
    
        it('should respond with status 403 when ticket is not paid', async () => {
          const user = await createUser();
          const token = await generateValidToken(user);
          const enrollment = await createEnrollmentWithAddress(user);
          const ticketType = await createTicketType(false, true);
          await createTicket(enrollment.id, ticketType.id, TicketStatus.RESERVED);
          const hotel = await createHotel();
          const room = await createRoomWithHotelId(hotel.id);
    
          const response = await server.post('/booking').set('Authorization', `Bearer ${token}`).send({ roomId: room.id });
    
          expect(response.status).toEqual(httpStatus.FORBIDDEN);
        });
    
        it('should respond with status 404 when room does not exist', async () => {
          const user = await createUser();
          const token = await generateValidToken(user);
          const enrollment = await createEnrollmentWithAddress(user);
          const ticketType = await createTicketType(false, true);
          await createTicket(enrollment.id, ticketType.id, TicketStatus.PAID);
          const hotel = await createHotel();
          const room = await createRoomWithHotelId(hotel.id);
    
          const response = await server
            .post('/booking')
            .set('Authorization', `Bearer ${token}`)
            .send({ roomId: room.id + 1 });
    
          expect(response.status).toEqual(httpStatus.NOT_FOUND);
        });
    
        it('should respond with status 403 when the room is at full capacity', async () => {
          const user = await createUser();
          const token = await generateValidToken(user);
          const enrollment = await createEnrollmentWithAddress(user);
          const ticketType = await createTicketType(false, true);
          await createTicket(enrollment.id, ticketType.id, TicketStatus.PAID);
          const hotel = await createHotel();
          const room = await createRoomWithHotelId(hotel.id);
    
          for (let i = 0; i < room.capacity; i++) {
            const randomUser = await createUser();
            await createBooking(randomUser.id, room.id);
          }
    
          const response = await server.post('/booking').set('Authorization', `Bearer ${token}`).send({ roomId: room.id });
    
          expect(response.status).toEqual(httpStatus.FORBIDDEN);
        });
    
        it('should respond with status 403 when there is a booking for the same user', async () => {
          const user = await createUser();
          const token = await generateValidToken(user);
          const enrollment = await createEnrollmentWithAddress(user);
          const ticketType = await createTicketType(false, true);
          await createTicket(enrollment.id, ticketType.id, TicketStatus.PAID);
          const hotel = await createHotel();
          const room = await createRoomWithHotelId(hotel.id);
          await server.post('/booking').set('Authorization', `Bearer ${token}`).send({ roomId: room.id });
    
          const response = await server.post('/booking').set('Authorization', `Bearer ${token}`).send({ roomId: room.id });
    
          expect(response.status).toEqual(httpStatus.FORBIDDEN);
        });
    
        it('should respond with status 200 and with bookingId', async () => {
          const user = await createUser();
          const token = await generateValidToken(user);
          const enrollment = await createEnrollmentWithAddress(user);
          const ticketType = await createTicketType(false, true);
          await createTicket(enrollment.id, ticketType.id, TicketStatus.PAID);
          const hotel = await createHotel();
          const room = await createRoomWithHotelId(hotel.id);
    
          const response = await server.post('/booking').set('Authorization', `Bearer ${token}`).send({ roomId: room.id });
    
          expect(response.status).toEqual(httpStatus.OK);
          expect(response.body).toEqual({ bookingId: expect.any(Number) });
        });
      });
    });
    
describe('PUT /booking/:bookingId', () => {
    it('should respond with status 401 if no token is given', async () => {
        const response = await server.put('/booking/0');
    
        expect(response.status).toBe(httpStatus.UNAUTHORIZED);
    });
    
    it('should respond with status 401 if given token is not valid', async () => {
        const token = faker.lorem.word();
    
        const response = await server.put('/booking/0').set('Authorization', `Bearer ${token}`);
    
        expect(response.status).toBe(httpStatus.UNAUTHORIZED);
    });
    
    it('should respond with status 401 if there is no session for given token', async () => {
        const userWithoutSession = await createUser();
        const token = jwt.sign({ userId: userWithoutSession.id }, process.env.JWT_SECRET);
    
        const response = await server.put('/booking/0').set('Authorization', `Bearer ${token}`);
    
        expect(response.status).toBe(httpStatus.UNAUTHORIZED);
    });
    
    describe('when token is valid', () => {
        it('should respond with status 400 when roomId is not present in body', async () => {
          const user = await createUser();
          const token = await generateValidToken(user);
    
          const response = await server.put('/booking/0').set('Authorization', `Bearer ${token}`).send({});
    
          expect(response.status).toEqual(httpStatus.BAD_REQUEST);
        });
    
        it('should respond with status 403 when there is no booking for given user', async () => {
          const user = await createUser();
          const token = await generateValidToken(user);
    
          const response = await server.put('/booking/0').set('Authorization', `Bearer ${token}`).send({ roomId: 0 });
    
          expect(response.status).toEqual(httpStatus.FORBIDDEN);
        });
    
        it('should respond with status 403 when booking id does not match user booking id', async () => {
          const user = await createUser();
          const token = await generateValidToken(user);
          const enrollment = await createEnrollmentWithAddress(user);
          const ticketType = await createTicketType(false, true);
          await createTicket(enrollment.id, ticketType.id, TicketStatus.PAID);
          const hotel = await createHotel();
          const firstRoom = await createRoomWithHotelId(hotel.id);
          const secondRoom = await createRoomWithHotelId(hotel.id);
          const booking = await createBooking(user.id, firstRoom.id);
    
          const response = await server
            .put(`/booking/${booking.id + 1}`)
            .set('Authorization', `Bearer ${token}`)
            .send({ roomId: secondRoom.id });
    
          expect(response.status).toEqual(httpStatus.FORBIDDEN);
        });
    
        it('should respond with status 404 when room does not exist', async () => {
          const user = await createUser();
          const token = await generateValidToken(user);
          const enrollment = await createEnrollmentWithAddress(user);
          const ticketType = await createTicketType(false, true);
          await createTicket(enrollment.id, ticketType.id, TicketStatus.PAID);
          const hotel = await createHotel();
          const room = await createRoomWithHotelId(hotel.id);
          const booking = await createBooking(user.id, room.id);
    
          const response = await server
            .put(`/booking/${booking.id}`)
            .set('Authorization', `Bearer ${token}`)
            .send({ roomId: room.id + 1 });
    
          expect(response.status).toEqual(httpStatus.NOT_FOUND);
        });
    
        it('should respond with status 403 when room is at full capacity', async () => {
          const user = await createUser();
          const token = await generateValidToken(user);
          const enrollment = await createEnrollmentWithAddress(user);
          const ticketType = await createTicketType(false, true);
          await createTicket(enrollment.id, ticketType.id, TicketStatus.PAID);
          const hotel = await createHotel();
          const firstRoom = await createRoomWithHotelId(hotel.id);
          const secondRoom = await createRoomWithHotelId(hotel.id);
          const booking = await createBooking(user.id, firstRoom.id);
    
          for (let i = 0; i < secondRoom.capacity; i++) {
            const randomUser = await createUser();
            await createBooking(randomUser.id, secondRoom.id);
          }
    
          const response = await server
            .put(`/booking/${booking.id}`)
            .set('Authorization', `Bearer ${token}`)
            .send({ roomId: secondRoom.id });
    
          expect(response.status).toEqual(httpStatus.FORBIDDEN);
        });
    
        it('should respond with status 200 and with bookingId', async () => {
          const user = await createUser();
          const token = await generateValidToken(user);
          const enrollment = await createEnrollmentWithAddress(user);
          const ticketType = await createTicketType(false, true);
          await createTicket(enrollment.id, ticketType.id, TicketStatus.PAID);
          const hotel = await createHotel();
          const firstRoom = await createRoomWithHotelId(hotel.id);
          const secondRoom = await createRoomWithHotelId(hotel.id);
          const booking = await createBooking(user.id, firstRoom.id);
    
          const response = await server
            .put(`/booking/${booking.id}`)
            .set('Authorization', `Bearer ${token}`)
            .send({ roomId: secondRoom.id });
    
          expect(response.status).toEqual(httpStatus.OK);
          expect(response.body).toEqual({ bookingId: booking.id });
        });
    });
});