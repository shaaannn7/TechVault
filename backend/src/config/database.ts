import mongoose from 'mongoose';

// Expand Global type definition to support isMockDatabase flag
declare global {
  var isMockDatabase: boolean;
}

export const connectDatabase = async (): Promise<void> => {
  const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/techvault';
  
  try {
    // Set connection timeout to 3 seconds for local checks
    mongoose.set('strictQuery', true);
    await mongoose.connect(mongoUri, {
      serverSelectionTimeoutMS: 3000,
    });
    
    global.isMockDatabase = false;
    console.log('✅ MongoDB Connected successfully.');
  } catch (error) {
    global.isMockDatabase = true;
    console.warn('\n⚠️  [DATABASE WARNING]: Failed to connect to MongoDB server.');
    console.warn('⚠️  [FALLBACK ENABLED]: Server is starting in MEMORY MOCK MODE.');
    console.warn('⚠️  All database interactions will be simulated in memory and will reset on server restart.');
    console.warn('👉 To use a real database, ensure MongoDB is running locally on port 27017 or specify a MONGODB_URI in backend/.env\n');
  }
};
