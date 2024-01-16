import express from "express";
import { newUserValidation } from "../middlewares/joiValidation.js";
import { hashPassword } from "../utils/bcryptHelper.js";
import { createUser } from "../models/user/UserModels.js";

const router = express.Router();

// create new user
router.post("/admin", newUserValidation, async (req, res, next) => {
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
          user,
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

// read user

// update user

export default router;
