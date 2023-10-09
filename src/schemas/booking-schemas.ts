import { InputBookingBody } from "@/protocols";
import Joi from "joi";

export const bookingSchema = Joi.object<InputBookingBody>({
    roomId: Joi.number().integer().required(),
})