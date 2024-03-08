import dotenv from "dotenv";
import { connectDb } from "./db";
import { app } from "./app";

dotenv.config({
    path: './.env',
});

connectDb()
.then( ()=> {
    app.listen(process.env.PORT || 8000, ()=>{
        console.log(`App is listen at ${process.env.PORT}`);
    })
})
.catch((error)=> {
    console.log(`MongoDb connection failed!!`,eroor);
})