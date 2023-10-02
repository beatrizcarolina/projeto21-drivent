import { ApplicationError } from '@/protocols';

export function paymentError(details: string): ApplicationError {
  return {
    name: 'PaymentError',
    message: details,
  };
}