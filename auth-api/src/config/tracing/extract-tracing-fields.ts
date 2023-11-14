import { IncomingHttpHeaders } from "http";

export function extractTracingFields(headers: IncomingHttpHeaders): { transactionId: string, serviceId: string } {
  const { transactionId, serviceId } = headers;

  if (!transactionId || typeof transactionId !== 'string') {
    throw new Error('');
  }

  if (!serviceId || typeof serviceId !== 'string') {
    throw new Error('');
  }

  return { transactionId, serviceId }
}