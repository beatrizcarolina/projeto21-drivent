import { Router } from "express";
import { authenticateToken, validateBody } from "@/middlewares";
import { createBooking, getBooking, updateBooking } from "@/controllers/booking-controller";
import { bookingSchema } from "@/schemas";

const bookingRouter = Router();

bookingRouter
    .all('/*',authenticateToken)
    .get('/:bookingId', getBooking)
    .post('/', validateBody(bookingSchema), createBooking)
    .put('/:bookingId', validateBody(bookingSchema), updateBooking)

export { bookingRouter };
