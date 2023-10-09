import { ApplicationError } from "@/protocols";

export function forbiddenError(details: string): ApplicationError {
    return {
        name: 'forbiddenError',
        message: details,
    };
}