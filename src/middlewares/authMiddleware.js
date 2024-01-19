import { getSession } from "../models/session/SessionModel.js";
import { getOneAdmin, getUserByEmail } from "../models/user/UserModel.js";
import {
  createAccessJWT,
  decodeAccessJWT,
  decodeRefreshJWT,
} from "../utils/jwtHelper.js";

export const getUserFromAccessJWT = async (accessJWT) => {
  // verify access jwt
  const decoded = decodeAccessJWT(accessJWT);

  // if verified
  if (decoded?.email) {
    // check if token exist in session table
    const tokenExist = await getSession({ token: accessJWT });

    // if token exist, get user from email
    if (tokenExist?._id) {
      const user = await getUserByEmail(decoded.email);

      // if user exist
      if (user?._id) {
        user.password = undefined;
        return user;
      }
    }
  }

  return false;
};

export const adminAuth = async (req, res, next) => {
  try {
    const { authorization } = req.headers; //authorization is accessJWT

    const user = await getUserFromAccessJWT(authorization);

    if (user?.role === "admin") {
      req.userInfo = user;
      return next();
    }

    throw new Error("Invalid token, unauthorized!");
  } catch (error) {
    error.errorCode = 401;
    if (error.message.includes("jwt expired")) {
      error.errorCode = 403;
    }
    next(error);
  }
};

export const userAuth = async (req, res, next) => {
  try {
    const { authorization } = req.headers; //authorization is accessJWT

    const user = await getUserFromAccessJWT(authorization);

    if (user?._id) {
      req.userInfo = user;
      return next();
    }

    throw new Error("Invalid token, unauthorized!");
  } catch (error) {
    error.errorCode = 401;
    if (error.message.includes("jwt expired")) {
      error.errorCode = 403;
    }
    next(error);
  }
};

export const refreshAuth = async (req, res, next) => {
  try {
    const { authorization } = req.headers;

    // validate refresh token
    const decoded = decodeRefreshJWT(authorization);

    if (decoded?.email) {
      // get admin by email and refreshJWT
      const user = await getOneAdmin({
        email: decoded.email,
        refreshJWT: authorization,
      });

      if (user?._id) {
        // create new access jwt
        const accessJWT = createAccessJWT(user.email);

        return res.json({
          status: "success",
          accessJWT,
        });
      }
    }

    throw new Error("Invalid token, unauthorized!");
  } catch (error) {
    error.errorCode = 401;
    if (error.message.includes("jwt expired")) {
      error.errorCode = 403;
    }
    next(error);
  }
};
