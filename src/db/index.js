import mongoose from "mongoose";

const connectDb = async () => {
    try {
        const connectionInstance = await mongoose.connect(`${process.env.MONGO_URI}`);
        console.log(`Connection established with MongoDb DB HOST: ${connectionInstance.Connection.host}`);
    } catch (error) {
        console.log(`MongoDb connection failed`,error);
        exit(1);
    }
}

export {connectDb};