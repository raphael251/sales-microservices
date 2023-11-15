"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.connectMongoDB = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const secrets_1 = require("../constants/secrets");
function connectMongoDB() {
    return __awaiter(this, void 0, void 0, function* () {
        mongoose_1.default.connect(secrets_1.MONGO_DB_URL, {
            serverSelectionTimeoutMS: 180000
        });
        mongoose_1.default.connection.on('connected', () => {
            console.info('The application was connected to MongoDB successfully.');
        });
        mongoose_1.default.connection.on('error', () => {
            console.error('Fail to connect the application to MongoDB.');
        });
    });
}
exports.connectMongoDB = connectMongoDB;
