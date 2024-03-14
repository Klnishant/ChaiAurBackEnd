import dotenv from "dotenv"
import { connectDb } from "./db/index.js"
import { app } from "./app.js";

dotenv.config({
    path:'./.env',
})

connectDb()
.then( ()=> {
    app.listen(process.env.PORT || 8000, ()=>{
        console.log(`App is listen at ${process.env.PORT}`);
    })
})
.catch((error)=> {
    console.log(`MongoDb connection failed!!`,error);
})