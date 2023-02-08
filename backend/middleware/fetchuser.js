const jwt = require("jsonwebtoken");
const JWT_SECRET = "Harryisagoodb$oy";

const fetchuser = (req, res, next) => {
  // Get the user from jwt token and add id to the req object
  const token = req.header("auth-token");
  if (!token) {
    res.status(401).send({ error: "Please authenticate using valid token" });
  }

  try {
    const string = jwt.verify(token, JWT_SECRET);
    req.user = string.user;
    next();
  } catch (error) {
    res.status(401).send({ error: "Please authenticate using valid token" });
  }
};

module.exports = fetchuser;
