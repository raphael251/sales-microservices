import { IncomingHttpHeaders } from "http";

export function extractTracingFieldsFromHeaders(headers: IncomingHttpHeaders): { transactionId: string, serviceId: string } {
  const { transactionId, serviceId } = headers;

  if (!transactionId || typeof transactionId !== 'string') {
    throw new Error('Transaction ID not found in headers.');
  }

  if (!serviceId || typeof serviceId !== 'string') {
    throw new Error('Service ID not found in headers.');
  }

  return { transactionId, serviceId }
}