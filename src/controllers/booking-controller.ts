import { AuthenticatedRequest } from "@/middlewares";
import { bookingService } from "@/services";
import { Response } from "express";
import httpStatus from "http-status";

export async function getBooking(req: AuthenticatedRequest, res: Response) {
    const { userId } = req;
    const booking = await bookingService.getByUserId(userId);
    return res.status(httpStatus.OK).send(booking);
}

export async function createBooking(req: AuthenticatedRequest, res: Response) {
    const { userId } = req;
    const { roomId } = req.body;
    const newBooking = await bookingService.createBooking(userId, Number(roomId));
    return res.status(httpStatus.OK).send(newBooking);
}

export async function updateBooking( req: AuthenticatedRequest, res: Response) {
    const { userId } = req;
    const { roomId } = req.body;
    const { bookingId } = req.params;
    const updateBookingId = await bookingService.updateBooking(userId, Number(bookingId), Number(roomId));
    return res.status(httpStatus.OK).send(updateBookingId);
}