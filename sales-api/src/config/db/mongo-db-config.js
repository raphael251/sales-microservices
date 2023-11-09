import mongoose from 'mongoose';
import { MONGO_DB_URL } from '../constants/secrets.js';

export function connect() {
  mongoose.connect(MONGO_DB_URL);
  
  mongoose.connection.on('connected', () => {
    console.info('The application was connected to MongoDB successfully.')
  });

  mongoose.connection.on('error', () => {
    console.error('Fail to connect the application to MongoDB.')
  });
}