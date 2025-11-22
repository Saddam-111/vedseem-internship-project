
import { v2 as cloudinary } from 'cloudinary'
import dotenv from 'dotenv'
import fs from 'fs'


dotenv.config()


cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

export const uploadCloudinary = async (file, folder) => {
  try {
    if (!file) throw new Error("No file provided");

    const result = await cloudinary.uploader.upload(file, {
      resource_type: "image",
      folder: `dhanush_ecommerce/${folder}`,
      quality: "100",       // full quality
      fetch_format: "auto", // optimal format without loss
    });

    if (fs.existsSync(file)) fs.unlinkSync(file);
    return result;
  } catch (error) {
    if (fs.existsSync(file)) fs.unlinkSync(file);
    console.error("Cloudinary Upload Error:", error);
    throw new Error("Failed to upload to Cloudinary");
  }
};



// const uploadResult = await uploadCloudinary(req.file.path, "avatars");
// const uploadResult = await uploadCloudinary(req.file.path, "products");
// const uploadResult = await uploadCloudinary(req.file.path, "blogs");




export const deleteCloudinary = async (publicId) => {
  try {
    if (!publicId) throw new Error("No publicId provided");
    const result = await cloudinary.uploader.destroy(publicId);
    return result;
  } catch (error) {
    console.error("Cloudinary Delete Error:", error);
    throw new Error("Failed to delete from Cloudinary");
  }
}