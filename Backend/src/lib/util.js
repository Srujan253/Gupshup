import jwt from "jsonwebtoken";

export const generateToken = (userID, res) => {
  const token = jwt.sign({ userId: userID }, process.env.JWT_SECRET, {
    expiresIn: "7d",
  });

res.cookie("jwt", token, {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production", // ✅ important
  sameSite: "None", // ✅ required for cross-site cookies in production
  maxAge: 24 * 60 * 60 * 1000, // 1 day
});



  return token;
};
