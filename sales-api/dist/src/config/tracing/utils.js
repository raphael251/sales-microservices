"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.extractTracingFieldsFromHeaders = void 0;
function extractTracingFieldsFromHeaders(headers) {
    const { transactionId, serviceId } = headers;
    if (!transactionId || typeof transactionId !== 'string') {
        throw new Error('Transaction ID not found in headers.');
    }
    if (!serviceId || typeof serviceId !== 'string') {
        throw new Error('Service ID not found in headers.');
    }
    return { transactionId, serviceId };
}
exports.extractTracingFieldsFromHeaders = extractTracingFieldsFromHeaders;
