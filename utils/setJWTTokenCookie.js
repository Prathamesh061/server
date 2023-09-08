const sendJWTTokenCookie = (user, statusCode, res) => {
  const token = user.getJWTToken();
  const expirationDate = new Date();
  expirationDate.setDate(expirationDate.getDate() + process.env.COOKIE_EXPIRE);

  // Options for cookie
  const options = {
    expire: expirationDate.toUTCString(),
    httpOnly: true,
  };

  res.status(statusCode).cookie("token", token, options).json({
    success: true,
    user,
    token,
  });
};

module.exports = sendJWTTokenCookie;
