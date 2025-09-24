// utils/sendToken.js
export const sendToken = (user, statusCode, message, res) => {
  const token = user.getJwtToken(); // ✅ consistent with userModel.js

  // user.toJSON() already strips sensitive fields like password, reset tokens, OTPs
  const safeUser = user.toJSON();

  res
    .status(statusCode)
    .cookie("token", token, {
      expires: new Date(
        Date.now() + process.env.COOKIE_EXPIRE * 24 * 60 * 60 * 1000
      ),
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
    })
    .json({
      success: true,
      message,
      user: safeUser,
      token,
    });
};
