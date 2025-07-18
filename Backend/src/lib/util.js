import jwt from "jsonwebtoken";

export const generateToken = (userID, res) => {
  const token = jwt.sign({ userId: userID }, process.env.JWT_SECRET, {
    expiresIn: "7d",
  });

 res.cookie("jwt", token, {
  maxAge: 7 * 24 * 60 * 60 * 1000,
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: process.env.NODE_ENV === "production" ? "None" : "Lax", // ✅ FIXED
});


  return token;
};
