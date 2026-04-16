import multer from "multer"
import { v4 as uuid } from "uuid"


const storage = multer.diskStorage({
    destination:"uploads/",
    filename:(req,file,cb)=>{
    const fileExtension = file.originalname.split(".").pop();
    cb(null, `${Date.now()}-${uuid()}.${fileExtension}`);   
 }
})

const fileFilter = (req,file,cb)=>{
  if (file.mimetype === "video/mp4") {
    cb(null, true);
  } else {
    cb(new Error("Only MP4 files are allowed"), false);
  }
};

const upload = multer({
    storage,
    fileFilter
})

export default  upload;