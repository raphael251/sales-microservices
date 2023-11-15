"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Order = void 0;
const mongoose_1 = require("mongoose");
const OrderSchema = new mongoose_1.Schema({
    products: {
        type: [Object],
        required: true,
    },
    user: {
        type: Object,
        required: true,
    },
    status: {
        type: String,
        required: true,
    },
    transactionId: {
        type: String,
        required: true
    },
    serviceId: {
        type: String,
        required: true
    }
}, {
    timestamps: true
});
exports.Order = (0, mongoose_1.model)('Order', OrderSchema);
