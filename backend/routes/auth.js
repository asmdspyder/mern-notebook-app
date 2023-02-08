const express = require("express");
const router = express.Router();
const User = require("../models/User");
const { body, validationResult } = require("express-validator");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const fetchuser = require("../middleware/fetchuser");

const JWT_SECRET = "Harryisagoodb$oy";

// ROUTE 1 -- Create a user using : POST "/api/auth/createuser" . No login required
router.post(
  "/createuser",
  [
    body("name", "Enter a valid name ").isLength({ min: 3 }),
    body("email", "Enter a valid email ").isEmail(),
    body("password", "Password must be atleast 5 characters").isLength({
      min: 5,
    }),
  ],
  async (req, res) => {
    let success = false;
    // if there are errors , return bad request and errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success, errors: errors.array() });
    }

    try {
      // check wether email exists already
      let user = await User.findOne({ email: req.body.email });
      if (user) {
        return res.status(400).json({ success, error: "Sorry user with this email already exists" });
      }
      const salt = await bcrypt.genSalt(10);
      seqPass = await bcrypt.hash(req.body.password, salt);

      user = await User.create({
        name: req.body.name,
        email: req.body.email,
        password: seqPass,
      });
      //   .then((user) => res.json(user))
      //   .catch((err) => res.send({ error: "mail exits" }));
      const data = {
        user: {
          id: user.id,
        },
      };
      console.log(data.user);
      const authToken = jwt.sign(data, JWT_SECRET);

      //res.json({ user });
      success = true;
      res.json({ success, authToken });
    } catch (error) {
      console.log(error);
      res.status(500).send("Some error occured");
    }
  }
);

// ROUTE 2 --  Authenticate a user using : POST "/api/auth/login"
router.post("/login", [body("email", "Enter a valid email ").isEmail(), body("password", "Password cannot be blank ").exists()], async (req, res) => {
  let success = false;

  // if there are errors , return bad request and errors
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { email, password } = req.body;
  try {
    let user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ success, error: "Mail not exists" });
    }
    const passwordCompare = await bcrypt.compare(password, user.password);
    if (!passwordCompare) {
      return res.status(400).json({ success, error: "Please try to login with correct credentials" });
    }
    const data = {
      user: {
        id: user.id,
      },
    };
    const authToken = jwt.sign(data, JWT_SECRET);
    success = true;
    res.json({ success, authToken });
  } catch (error) {
    console.log(error);
    res.status(500).send("Internal error server");
  }
});

// ROUTE 3 -- get logged in user details using POST"/api/auth/getuser" Login required

router.post("/getuser", fetchuser, async (req, res) => {
  try {
    userId = req.user.id;
    const user = await User.findById(userId).select("-password");
    res.send(user);
  } catch (error) {
    console.log(error);
    res.status(500).send("Internal error server");
  }
});
module.exports = router;
