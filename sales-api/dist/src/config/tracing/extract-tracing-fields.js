"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.extractTracingFields = void 0;
function extractTracingFields(headers) {
    const { transactionId, serviceId } = headers;
    if (!transactionId || typeof transactionId !== 'string') {
        throw new Error('Transaction ID not found in headers.');
    }
    if (!serviceId || typeof serviceId !== 'string') {
        throw new Error('Service ID not found in headers.');
    }
    return { transactionId, serviceId };
}
exports.extractTracingFields = extractTracingFields;
