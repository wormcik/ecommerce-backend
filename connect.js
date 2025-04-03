import dotenv from 'dotenv';
import { MongoClient } from 'mongodb';

dotenv.config();

const uri = "mongodb+srv://fatihkesik:worm12term98@cluster0.r0rwd.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";
if (!uri) {
    throw new Error("MONGO_URI environment variable is missing!");
}

let client;
let database;

export async function connectDB() {
    if (!client) {
        client = new MongoClient(uri, {
            serverSelectionTimeoutMS: 5000,
        });
        if (database) {
            return database; 
          }

        try {
            await client.connect();
            console.log('Connected to MongoDB');
            database = client.db('ecommerce');
        } catch (error) {
            console.error('MongoDB connection error:', error);
            throw error; 
        }
    }
    return database;
}
