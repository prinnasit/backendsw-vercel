const { json } = require("express");
const User = require("../models/User");


//@dese   Register user
//@route    POST  /api/v1/suth/register
//@ts-check     Public
exports.register = async (req, res, next) => {
  try {
    const { name, email, password, role ,tel, userType} = req.body;

    //Create User
    const user = await User.create({
      name,
      email,
      password,
      role,
      userType,
      tel,
    });

    // const token =user.getSignedJwtToken();
    // res.status(200).json({success:true  , token});
    sendTokenResponse(user, 200, res);
  } catch (err) {
    console.log(err.stack);
    if (err.code === 11000) {
      res.status(400).json({ success: false, error: 'Email already exists' });
    } else {
      res.status(400).json({ success: false, error: err.message });
    }
  }
};
//@desc  Login user
//@route  POST /api/auth/login
//@access Public
exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    //Validate  email & password
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        msg: "Please  provide an email and password",
      });
    }

    //Check for user
    const user = await User.findOne({ email }).select("+password");
    if (!user) {
      return res.status(400).json({
        success: false,
        msg: "Invalid credentials",
      });
    }

    //Check if password matches
    const isMatch = await user.matchPassword(password);

    if (!isMatch) {
      return res.status(401).json({
        success: false,
        msg: "Invalid credentials",
      });
    }

    //Create token
    // const token = user.getSignedJwtToken();
    // res.status(200).json({success:true , token});
    sendTokenResponse(user, 200, res);
  } catch (err) {
    return res.status(401).json({
      success: false,
      msg: "Connot convert email or password to string",
    });
  }
};

//Get token from model , create cookie and send response
const sendTokenResponse = (user, statusCode, res) => {
  //Create token
  const token = user.getSignedJwtToken();

  const options = {
    expires: new Date(
      Date.now() + process.env.JWT_COOKIE_EXPIRE * 24 * 60 * 60 * 1000
    ),
    httpOnly: true,
  };

  if (process.env.NODE_ENV === "production") {
    options.secure = true;
  }
  res
    .status(statusCode)
    .cookie("token", token, options)
    .json({ success: true, token, type:user.userType , role:user.role });
};

//@desc  Get current Logged in user
//@route  POST /api/v1/auth/me
//@access Private
exports.getMe = async (req, res, next) => {
  const user = await User.findById(req.user.id);
  res.status(200).json({
    success: true,
    data: user,
  });
};

//@dese   Log user out / clear cookie
//@route    get  /api/v1/auth/logout
//@ts-check     Private
exports.logout = async (req, res, next) => {
  res.cookie("token", "none", {
    expires: new Date(Date.now() + 10 * 100),
    httpOnly: true,
  });

  res.status(200).json({
    success: true,
    data: {},
  });
};
