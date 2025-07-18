import jwt from "jsonwebtoken";

export const generateToken = (userID, res) => {
  const token = jwt.sign({ userId: userID }, process.env.JWT_SECRET, {
    expiresIn: "7d",
  });

  res.cookie("jwt", token, {
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    httpOnly: true,
    secure: process.env.NODE_ENV === "production", // 🛡️ Only HTTPS in prod
    sameSite: process.env.NODE_ENV === "production" ? "None" : "Lax", // ✅ Allow cross-site cookies in production
  });

  return token;
};
