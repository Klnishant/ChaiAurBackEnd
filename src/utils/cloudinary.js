import {v2 as cloudinary} from 'cloudinary';
import fs from "fs";
          
cloudinary.config({ 
    cloud_name: `${process.env.CLOUDINARY_CLOUD_NAME}`,
    api_key: `${process.env.CLOUDINARY_API_KEY}`,
    api_secret: `${process.env.CLOUDINARY_API_SECRET}`,
    secure: true,
});  

const uploadOnCloudinary = async (localFilePath)=>{
    try {
        if(!localFilePath) return null;

    // upload the file on cloudinary
        console.log(localFilePath);

        const response = await cloudinary.uploader.upload(localFilePath, {
            resource_type: "auto"
        });

    console.log("File upload successfully");
    fs.unlinkSync(localFilePath);
    return response;

    } catch (error) {
        fs.unlinkSync(localFilePath);
        console.log("error occured in uploading file!!!"); //Remove the locally saved file
        return null;
    }
}

export {uploadOnCloudinary}