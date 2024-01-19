import express from "express";
import {
  newUserValidation,
  userLoginValidation,
} from "../middlewares/joiValidation.js";
import { comparePassword, hashPassword } from "../utils/bcryptHelper.js";
import {
  createUser,
  getAllUsersByRole,
  getUserByEmail,
} from "../models/user/UserModel.js";
import { createJWTs } from "../utils/jwtHelper.js";
import {
  adminAuth,
  refreshAuth,
  userAuth,
} from "../middlewares/authMiddleware.js";

const router = express.Router();

// login user
router.post("/login", userLoginValidation, async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // get user by email
    const user = await getUserByEmail(email);

    // if user exists
    if (user?._id) {
      // compare db password with the user input password
      const isMatched = comparePassword(password, user.password);

      // if passwords match, create tokens (jwts)
      if (isMatched) {
        const jwts = createJWTs(email);

        res.json({
          status: "success",
          message: "Login successfull",
          jwts,
        });
      }
    }

    res.json({
      status: "error",
      message:
        "Oops! It seems like there was an issue with your login credentials. Please double-check your username and/or password and try again. If you need assistance, contact support. Thank you!",
    });
  } catch (error) {
    next(error);
  }
});

// ======== below this are all private routers ========

// create new user (admin)
router.post("/admin-signup", newUserValidation, async (req, res, next) => {
  try {
    // encrypt password
    req.body.password = hashPassword(req.body.password);

    // define role "admin"
    req.body.role = "admin";

    // create new user (admin)
    const user = await createUser(req.body);

    user?._id
      ? res.json({
          status: "success",
          message:
            "Congratulations!!! Your account has been created! Welcome to the admin panel, where you can manage and optimize your library system. Let the seamless administration begin!",
        })
      : res.json({
          status: "error",
          message:
            "Sorry!!! We're currently unable to create your account. Please double-check your information or try again later. If you need assistance, contact support. Thank you!",
        });
  } catch (error) {
    if (error.message.includes("E11000 duplicate key error collection")) {
      error.message =
        "Uh-oh! It seems there's already a user with this email. Please use a different email or try logging in. If you need assistance, contact support. Thank you!";
      error.errorCode = 200;
    }
    next(error);
  }
});

// get user info after login
router.get("/", userAuth, async (req, res, next) => {
  try {
    res.json({
      status: "success",
      message: "user info",
      user: req.userInfo,
    });
  } catch (error) {
    next(error);
  }
});

// read user (all admins)
router.get("/admin-list", adminAuth, async (req, res, next) => {
  try {
    const userList = await getAllUsersByRole({ role: "admin" });

    res.json({
      status: "success",
      message: "Admin list",
      userList,
    });
  } catch (error) {
    next(error);
  }
});

// read user (all students)
router.get("/student-list", adminAuth, async (req, res, next) => {
  try {
    const userList = await getAllUsersByRole({ role: "student" });

    res.json({
      status: "success",
      message: "Student list",
      userList,
    });
  } catch (error) {
    next(error);
  }
});

router.get("/get-accessjwt", refreshAuth);

export default router;
