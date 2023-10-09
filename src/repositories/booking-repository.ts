import { prisma } from "@/config";
import { Booking } from "@prisma/client";

async function findById(userId: number) {
    return prisma.booking.findFirst({
        where: {
            userId,
        },
        select: {
            id: true,
            Room: true,
        },
    });
}

async function create(userId: number, roomId: number) {
    return prisma.booking.create({
        data: {
            userId,
            roomId,
        },
    })
}

async function updateByBookindAndRoomId(bookingId: number, roomId: number) {
    return prisma.booking.update({
        where: {
            id: bookingId,
        },
        data: {
            roomId,
        },
    });
}

export const bookingRepository = { findById, create, updateByBookindAndRoomId };