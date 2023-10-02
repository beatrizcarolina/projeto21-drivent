import { Hotel } from '@prisma/client';
import { prisma } from "@/config";

async function findHotels(): Promise<Hotel[]> {
    return prisma.hotel.findMany();
}

async function findHotelById(hotelId: number): Promise<Hotel> {
    return prisma.hotel.findUnique({
        where: { 
            id: hotelId 
        },
        include: {
            Rooms: true,
        },
    });
}

export const hotelsRepository = { findHotels, findHotelById };