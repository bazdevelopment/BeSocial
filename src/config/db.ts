import mongoose from 'mongoose';

const connectDB = async (): Promise<void> => {
  if (!process.env.MONGO_DB_URI) {
    throw new Error('MongoDB URI not found in environment variables');
  }
  try {
    const mongoConnection = await mongoose.connect(process.env.MONGO_DB_URI);
    console.log(`MongoDB Connected: ${mongoConnection.connection.host}`);
  } catch (error) {
    console.log(`Error connection to mongoDB: ${error}`);
    process.exit(1);
  }
};

export default connectDB;
