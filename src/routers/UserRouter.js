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
  updateUserRefreshJWT,
} from "../models/user/UserModel.js";
import { createJWTs } from "../utils/jwtHelper.js";
import {
  adminAuth,
  refreshAuth,
  userAuth,
} from "../middlewares/authMiddleware.js";
import { deleteSession } from "../models/session/SessionModel.js";

const router = express.Router();

// create new user (student)
router.post("/", newUserValidation, async (req, res, next) => {
  try {
    // encrypt password
    req.body.password = hashPassword(req.body.password);

    // create new user (admin)
    const user = await createUser(req.body);

    user?._id
      ? res.json({
          status: "success",
          message:
            "Congratulations!!! Your account has been created! Please login to access the library features.",
        })
      : res.json({
          status: "error",
          message:
            "Sorry!!! We're currently unable to create your account. Please try again later or contact admin. Thank you!",
        });
  } catch (error) {
    if (error.message.includes("E11000 duplicate key error collection")) {
      error.message =
        "Uh-oh! It seems there's already a user with this email. Please use a different email or try logging in. Thank you!";
      error.errorCode = 200;
    }
    next(error);
  }
});

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

router.post("/logout", async (req, res, next) => {
  try {
    const { email, accessJWT } = req.body;
    // create new user (admin)
    email && (await updateUserRefreshJWT(email, ""));

    accessJWT && (await deleteSession({ accessJWT }));

    res.json({
      status: "error",
      message: "Please try again. Thank you!",
    });
  } catch (error) {
    next(error);
  }
});

// ======== below this are all private routers ========

// create new user (admin)
router.post(
  "/admin-signup",
  adminAuth,
  newUserValidation,
  async (req, res, next) => {
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
            message: "Congratulations!!! A new admin account has been created!",
          })
        : res.json({
            status: "error",
            message:
              "Sorry!!! We're currently unable to create a new admin account. Please try again later. Thank you!",
          });
    } catch (error) {
      if (error.message.includes("E11000 duplicate key error collection")) {
        error.message =
          "Uh-oh! It seems there's already a user with this email. Please use a different email or try logging in. Thank you!";
        error.errorCode = 200;
      }
      next(error);
    }
  }
);

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
