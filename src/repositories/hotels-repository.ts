import { prisma } from '@/config';

async function findHotels() {
  return prisma.hotel.findMany();
}

async function findRoomsByHotelId(hotelId: number) {
  return prisma.hotel.findFirst({
    where: {
      id: hotelId,
    },
    include: {
      Rooms: true,
    },
  });
}

async function findRoomsWithBooking(roomId: number) {
  return prisma.room.findUnique({
    where: {
      id: roomId,
    },
    select: {
      capacity: true,
      _count:{
        select: {
          Booking: true
        },
      },
    },
  });
}

export const hotelRepository = {
  findHotels,
  findRoomsByHotelId,
  findRoomsWithBooking,
};