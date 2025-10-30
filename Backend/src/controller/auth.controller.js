import { generateToken } from "../lib/util.js";
import User from "../models/user.model.js";
import bcrypt from "bcryptjs";
import cloudinary from "../lib/cloudinary.js";
import crypto from "crypto";
import nodemailer from "nodemailer";

// In-memory OTP storage (In production, use Redis or database)
const otpStorage = new Map();

// Email transporter configuration
const createEmailTransporter = () => {
  try {
    console.log(`🔐 Email credentials check:`);
    console.log(`   User: ${process.env.EMAIL_USER}`);
    console.log(`   Pass length: ${process.env.EMAIL_PASS?.length} characters`);
    console.log(`   Pass first 4 chars: ${process.env.EMAIL_PASS?.substring(0, 4)}****`);
    
    // Fix: Use nodemailer.createTransporter (correct method name)
    return nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS, // App password from Google
      },
      debug: true, // Enable debug mode
      logger: true // Enable logging
    });
  } catch (error) {
    console.error("❌ Error creating email transporter:", error);
    throw error;
  }
};

// Generate 6-digit OTP
const generateOTP = () => {
  return crypto.randomInt(100000, 999999).toString();
};

// Send OTP email
const sendOTPEmail = async (email, otp, fullName) => {
  try {
    console.log(`📧 Attempting to send email to: ${email}`);
    console.log(`📧 Using email config - User: ${process.env.EMAIL_USER}`);
    
    const transporter = createEmailTransporter();
    
    // Test the connection first
    await transporter.verify();
    console.log('✅ Email transporter verified successfully');
    
    const mailOptions = {
      from: {
        name: 'GupShup Team',
        address: process.env.EMAIL_USER
      },
      to: email, // This will be the user's email address
      subject: '🔐 GupShup - Email Verification Code',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>GupShup Email Verification</title>
        </head>
        <body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f8fafc;">
          <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
            
            <!-- Header -->
            <div style="background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%); padding: 40px 30px; text-align: center;">
              <h1 style="color: #ffffff; font-size: 28px; margin: 0; font-weight: 700;">
                🗣️ GupShup
              </h1>
              <p style="color: #e0e7ff; font-size: 16px; margin: 10px 0 0 0;">
                Secure Chat Application
              </p>
            </div>

            <!-- Content -->
            <div style="padding: 40px 30px;">
              <h2 style="color: #1f2937; font-size: 24px; margin: 0 0 20px 0; font-weight: 600;">
                Welcome to GupShup, ${fullName}! 👋
              </h2>
              
              <p style="color: #4b5563; font-size: 16px; line-height: 1.6; margin: 0 0 30px 0;">
                Thank you for choosing GupShup for secure communication. To complete your account registration and ensure the security of your account, please verify your email address using the verification code below.
              </p>

              <!-- OTP Box -->
              <div style="background: linear-gradient(135deg, #f3f4f6 0%, #e5e7eb 100%); border: 2px dashed #6366f1; border-radius: 12px; padding: 30px; text-align: center; margin: 30px 0;">
                <p style="color: #374151; font-size: 14px; margin: 0 0 15px 0; font-weight: 500; text-transform: uppercase; letter-spacing: 1px;">
                  Your Verification Code
                </p>
                <div style="background-color: #6366f1; color: #ffffff; font-size: 36px; font-weight: 700; letter-spacing: 8px; padding: 20px; border-radius: 8px; font-family: 'Courier New', monospace;">
                  ${otp}
                </div>
                <p style="color: #6b7280; font-size: 14px; margin: 15px 0 0 0;">
                  Valid for 5 minutes only
                </p>
              </div>

              <!-- Instructions -->
              <div style="background-color: #f0f9ff; border-left: 4px solid #0ea5e9; padding: 20px; margin: 30px 0; border-radius: 0 8px 8px 0;">
                <h3 style="color: #0c4a6e; font-size: 16px; margin: 0 0 10px 0; font-weight: 600;">
                  📋 Instructions:
                </h3>
                <ol style="color: #075985; font-size: 14px; margin: 0; padding-left: 20px; line-height: 1.6;">
                  <li>Copy the 6-digit verification code above</li>
                  <li>Return to the GupShup registration page</li>
                  <li>Paste the code in the verification field</li>
                  <li>Click "Verify Account" to complete registration</li>
                </ol>
              </div>

              <!-- Security Note -->
              <div style="background-color: #fef3c7; border: 1px solid #fbbf24; padding: 15px; border-radius: 8px; margin: 20px 0;">
                <p style="color: #92400e; font-size: 14px; margin: 0; font-weight: 500;">
                  🔒 <strong>Security Note:</strong> This code was requested for email: <strong>${email}</strong>. If you didn't request this verification, please ignore this email and ensure your account security.
                </p>
              </div>

              <p style="color: #4b5563; font-size: 16px; line-height: 1.6; margin: 30px 0 0 0;">
                Need help? Our support team is here to assist you with any questions about GupShup.
              </p>
            </div>

            <!-- Footer -->
            <div style="background-color: #f9fafb; padding: 30px; text-align: center; border-top: 1px solid #e5e7eb;">
              <p style="color: #6b7280; font-size: 14px; margin: 0 0 15px 0;">
                Best regards,<br>
                <strong style="color: #374151;">The GupShup Development Team</strong>
              </p>
              
              <div style="margin: 20px 0;">
                <p style="color: #9ca3af; font-size: 12px; margin: 0;">
                  This email was sent to <strong>${email}</strong>
                </p>
                <p style="color: #9ca3af; font-size: 12px; margin: 5px 0 0 0;">
                  Developed by: Srujan H M, S K Thilak Raj, Balaji V Kodle
                </p>
                <p style="color: #9ca3af; font-size: 12px; margin: 5px 0 0 0;">
                  Cyber Security Branch | Secure Full Stack Development Project
                </p>
              </div>
              
              <div style="border-top: 1px solid #e5e7eb; padding-top: 20px; margin-top: 20px;">
                <p style="color: #9ca3af; font-size: 11px; margin: 0; line-height: 1.4;">
                  © 2025 GupShup. This is an automated message from our secure chat application.<br>
                  Please do not reply to this email as this mailbox is not monitored.
                </p>
              </div>
            </div>
          </div>
        </body>
        </html>
      `,
      // Plain text fallback
      text: `
        Welcome to GupShup, ${fullName}!
        
        Your email verification code is: ${otp}
        
        This code will expire in 5 minutes.
        
        Please enter this code on the GupShup registration page to complete your account setup.
        
        If you didn't request this code, please ignore this email.
        
        Best regards,
        The GupShup Team
        
        Developed by: Srujan H M, S K Thilak Raj, Balaji V Kodle
        Cyber Security Branch | Secure Full Stack Development Project
      `
    };

    console.log(`📤 Sending email to: ${email}`);
    const result = await transporter.sendMail(mailOptions);
    console.log(`✅ Email sent successfully. Message ID: ${result.messageId}`);
    
    return result;
  } catch (error) {
    console.error(`❌ Email sending failed:`, error);
    throw new Error(`Email sending failed: ${error.message}`);
  }
};

export const sendOTP = async (req, res) => {
  const { fullName, email, password } = req.body;

  try {
    console.log(`📧 OTP request received for email: ${email}`);

    if (!email || !fullName || !password) {
      return res.status(400).json({ message: "All fields are required" });
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ message: "Invalid email format" });
    }

    // Verify password length
    if (password.length < 6) {
      return res.status(400).json({ 
        message: "Password must be at least 6 characters long" 
      });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email: email });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    // Generate OTP
    const otp = generateOTP();
    const otpExpiry = Date.now() + 5 * 60 * 1000; // 5 minutes

    console.log(`🔢 Generated OTP for ${email}: ${otp} (expires at ${new Date(otpExpiry)})`);

    // Store OTP with user data
    otpStorage.set(email, {
      otp,
      expiry: otpExpiry,
      userData: { fullName, email, password }
    });

    // Send OTP email
    try {
      await sendOTPEmail(email, otp, fullName);
      console.log(`✅ OTP email sent successfully to ${email}`);
    } catch (emailError) {
      console.error(`❌ Failed to send email to ${email}:`, emailError.message);
      
      // Clean up OTP storage if email fails
      otpStorage.delete(email);
      
      return res.status(500).json({ 
        message: "Failed to send verification email. Please check your email address and try again." 
      });
    }

    res.status(200).json({ 
      message: "Verification code sent successfully! Please check your email.",
      email: email 
    });

  } catch (error) {
    console.error("❌ Error in sendOTP:", error.message);
    res.status(500).json({ message: "Internal server error. Please try again later." });
  }
};

export const verifyOTPAndCreateAccount = async (req, res) => {
  const { fullName, email, password, otp } = req.body;

  try {
    console.log(`🔍 OTP verification attempt for email: ${email}, OTP: ${otp}`);

    if (!otp || otp.length !== 6) {
      return res.status(400).json({ message: "Please enter a valid 6-digit OTP" });
    }

    // Get stored OTP data
    const storedData = otpStorage.get(email);
    
    if (!storedData) {
      console.log(`❌ No OTP data found for email: ${email}`);
      return res.status(400).json({ message: "OTP not found or expired. Please request a new code." });
    }

    // Check if OTP is expired
    if (Date.now() > storedData.expiry) {
      console.log(`⏰ OTP expired for email: ${email}`);
      otpStorage.delete(email);
      return res.status(400).json({ message: "OTP has expired. Please request a new code." });
    }

    // Verify OTP
    if (storedData.otp !== otp) {
      console.log(`❌ Invalid OTP for email: ${email}. Expected: ${storedData.otp}, Received: ${otp}`);
      return res.status(400).json({ message: "Invalid verification code. Please check and try again." });
    }

    console.log(`✅ OTP verified successfully for email: ${email}`);

    // OTP is valid, create user account
    const { userData } = storedData;

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(userData.password, salt);

    // Create new user
    const newUser = new User({
      email: userData.email,
      fullname: userData.fullName,
      password: hashedPassword,
    });

    await newUser.save();
    console.log(`👤 User account created successfully for: ${email}`);

    // Clean up OTP storage
    otpStorage.delete(email);

    // Generate JWT token
    generateToken(newUser._id, res);

    res.status(201).json({
      _id: newUser._id,
      email: newUser.email,
      fullname: newUser.fullname,
      profilePic: newUser.profilePic,
    });

  } catch (error) {
    console.error("❌ Error during OTP verification:", error.message);
    res.status(500).json({ message: "Internal server error. Please try again." });
  }
};

export const resendOTP = async (req, res) => {
  const { email } = req.body;

  try {
    console.log(`🔄 Resend OTP request for email: ${email}`);

    if (!email) {
      return res.status(400).json({ message: "Email is required" });
    }

    // Get stored data
    const storedData = otpStorage.get(email);
    
    if (!storedData) {
      console.log(`❌ No pending registration found for email: ${email}`);
      return res.status(400).json({ message: "No pending registration found. Please start registration again." });
    }

    // Generate new OTP
    const otp = generateOTP();
    const otpExpiry = Date.now() + 5 * 60 * 1000; // 5 minutes

    console.log(`🔢 Generated new OTP for ${email}: ${otp}`);

    // Update stored data with new OTP
    otpStorage.set(email, {
      ...storedData,
      otp,
      expiry: otpExpiry
    });

    // Send new OTP email
    try {
      await sendOTPEmail(email, otp, storedData.userData.fullName);
      console.log(`✅ New OTP email sent successfully to ${email}`);
    } catch (emailError) {
      console.error(`❌ Failed to resend email to ${email}:`, emailError.message);
      return res.status(500).json({ 
        message: "Failed to resend verification email. Please try again." 
      });
    }

    res.status(200).json({ 
      message: "New verification code sent successfully! Please check your email." 
    });

  } catch (error) {
    console.error("❌ Error resending OTP:", error.message);
    res.status(500).json({ message: "Internal server error. Please try again." });
  }
};
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

export const updateUsername = async (req, res) => {
  try {
    const { fullname } = req.body;
    const userID = req.user._id;

    if (!fullname || !fullname.trim()) {
      return res.status(400).json({ message: "Full name is required" });
    }

    if (fullname.trim().length < 2) {
      return res.status(400).json({ message: "Full name must be at least 2 characters long" });
    }

    if (fullname.trim().length > 50) {
      return res.status(400).json({ message: "Full name must be less than 50 characters" });
    }

    console.log(`🔄 Updating username for user ${userID} to: ${fullname.trim()}`);

    const updatedUser = await User.findByIdAndUpdate(
      userID,
      { fullname: fullname.trim() },
      { new: true }
    );

    if (!updatedUser) {
      return res.status(404).json({ message: "User not found" });
    }

    console.log(`✅ Username updated successfully for user: ${userID}`);

    // Return the updated user object
    res.status(200).json(updatedUser);
  } catch (error) {
    console.error("Error during username update:", error?.message || error);
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
