import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();

import RoleAccess from '../models/roleAccess.js';

async function check() {
  try {
    await mongoose.connect('mongodb://localhost:27017/AiImageEditor');
    console.log("Connected to DB");

    const docs = await RoleAccess.find({}).lean();
    console.log("ALL ROLE ACCESS DOCUMENTS IN DB:");
    console.log(JSON.stringify(docs, null, 2));
  } catch (error) {
    console.error(error);
  } finally {
    mongoose.disconnect();
    process.exit(0);
  }
}

check();
