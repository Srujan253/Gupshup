import { generateToken } from "../lib/util.js";
import User from "../models/user.model.js";
import bcrypt from "bcryptjs";
import cloudinary from "../lib/cloudinary.js";
export const signup = async (req, res) => {
  const { fullName,email, password } = req.body;
console.log(req.body);

  try {

    if(!email || !fullName || !password) {
      return res.status(400).json({ message: "All fields are required" });
    }
    //verify password length
    if (password.length < 6) {
      return res
        .status(400)
        .json({ message: "Password must be at least 6 characters long" });
    }

    // check if user already exists
    const user = await User.findOne({ email: email });
    if (user) {
      return res.status(400).json({ message: "User already exists" });
    }

    //hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    //create new user
    const newUser = new User({
      email: email,
      fullname: fullName,
      password: hashedPassword,
    });

    if(newUser) {
        //save user to database
        await newUser.save();
        //generate jwt token
        generateToken(newUser._id, res);
        res.status(201).json({
          _id: newUser._id,
          email: newUser.email,
          fullname: newUser.fullname,
          profilePic:newUser.profilePic,
        });
    }else{
        res.status(500).json({ message: "Failed to create user" });
    }
  } catch (error) {
    console.error("Error during signup:", error.message);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const login = async(req, res) => {
  const { email, password } = req.body;
  try{
    const user = await User.findOne({ email: email });
    if(!user){
      return res.status(400).json({message:"Invalid Credential"});
    }
    const isPasswordCorrect=await bcrypt.compare(password,user.password);
    if(!isPasswordCorrect){
      return res.status(400).json({message:"Invalid Credential"});
    }
    
        generateToken(user._id, res);
        res.status(200).json({
          _id: user._id,
          email: user.email,
          fullname: user.fullname,
          profilePic:user.profilePic,
        });



  }catch(error) {
    console.error("Error during login:", error.message);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const logout = (req, res) => {
try{
   res.cookie("jwt","",{maxAge: 0})
   res.status(200).json({ message: "Logged out successfully" });
}catch(error){
 console.error("Error during logout:", error.message);
    res.status(500).json({ message: "Internal server error"});
}
};

export const updateProfile = async (req, res) => {
  try {
    // Use consistent field name: profilePic
    const { profilePic } = req.body;
    const userID = req.user._id;

    if (!profilePic) {
      return res.status(400).json({ message: "Profile picture is required" });
    }

    console.log("Uploading to Cloudinary...");
    let uploadResponse;
    try {
      // Check if file is large (base64 string length > ~20MB)
      const base64Length = profilePic.length * (3/4) - (profilePic.endsWith('==') ? 2 : profilePic.endsWith('=') ? 1 : 0);
      let imageBuffer = Buffer.from(profilePic.replace(/^data:image\/(png|jpeg|jpg);base64,/, ''), 'base64');

      // Compress image using sharp
      let compressedBuffer;
      try {
        const sharp = (await import('sharp')).default;
        compressedBuffer = await sharp(imageBuffer)
          .resize({ width: 1000 }) // adjust as needed
          .jpeg({ quality: 80 })
          .toBuffer();
      } catch (err) {
        console.warn('Sharp compression failed, using original image. Reason:', err?.message || err);
        compressedBuffer = imageBuffer;
      }

      // If large, use upload_large
      if (base64Length > 20 * 1024 * 1024) {
        uploadResponse = await cloudinary.uploader.upload_large(`data:image/jpeg;base64,${compressedBuffer.toString('base64')}`,
          {
            resource_type: 'image',
            chunk_size: 6000000,
            timeout: 120000
          }
        );
      } else {
        uploadResponse = await cloudinary.uploader.upload(`data:image/jpeg;base64,${compressedBuffer.toString('base64')}`,
          {
            timeout: 120000
          }
        );
      }
    } catch (uploadErr) {
      console.error("Cloudinary upload failed:", uploadErr?.message || uploadErr);
      return res.status(500).json({ message: "Cloudinary upload failed" });
    }

    const updatedUser = await User.findByIdAndUpdate(
      userID,
      { profilePic: uploadResponse.secure_url },
      { new: true }
    );

    // Return the updated user object directly
    res.status(200).json(updatedUser);
  } catch (error) {
    console.error("Error during profile update:", error?.message || error);
    res.status(500).json({ message: "Internal server error" });
  }

};

export const checkAuth = (req, res) => {
  try {
    res.status(200).json(req.user);
  } catch (error) {
    console.error("Error during authentication check:", error.message);
    res.status(500).json({ message: "Internal server error" });
  }
};
