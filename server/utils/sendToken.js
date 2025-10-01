// utils/sendToken.js
export const sendToken = (user, statusCode, message, res) => {
  const token = user.getJwtToken();

  const safeUser = user.toJSON();

  res
    .status(statusCode)
    .cookie("token", token, {
      expires: new Date(
        Date.now() +
          Number(process.env.COOKIE_EXPIRE) * 24 * 60 * 60 * 1000 // ✅ ensure number
      ),
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax", // ✅ better for cross-site
    })
    .json({
      success: true,
      message,
      user: safeUser,
      token, // ⚠️ keep only if you want to return in body
    });
};
