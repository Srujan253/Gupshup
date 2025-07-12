import { generateToken } from "../lib/util.js";
import User from "../modules/user.model.js";
import bcrypt from "bcryptjs";
export const signup = async (req, res) => {
  const { email, fullname, password } = req.body;

  try {

    if(!email || !fullname || !password) {
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
      fullname: fullname,
      password: hashedPassword,
    });

    if(newUser) {
        //generate jwt token
        generateToken({ id: newUser._id }, res);        
        //save user to database
        await newUser.save();

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
export const login = (req, res) => {
  res.send("login worked");
};
export const logout = (req, res) => {
  res.send("logout worked");
};
