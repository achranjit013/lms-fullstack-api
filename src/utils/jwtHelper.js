import jwt from "jsonwebtoken";
import { createSession } from "../models/session/SessionModel.js";
import { updateUserRefreshJWT } from "../models/user/UserModel.js";

export const createAccessJWT = (email) => {
  const token = jwt.sign({ email }, process.env.JWT_ACCESS_SECRET, {
    expiresIn: "15m",
  });

  createSession({ token });

  return token;
};

export const createRefreshJWT = (email) => {
  const token = jwt.sign({ email }, process.env.JWT_REFRESH_SECRET, {
    expiresIn: "30d",
  });

  updateUserRefreshJWT(email, token);

  return token;
};

export const decodeAccessJWT = (accessJWT) => {
  return jwt.verify(accessJWT, process.env.JWT_ACCESS_SECRET);
};

export const decodeRefreshJWT = (refreshJWT) => {
  return jwt.verify(refreshJWT, process.env.JWT_REFRESH_SECRET);
};

export const createJWTs = (email) => {
  return {
    accessJWT: createAccessJWT(email),
    refreshJWT: createRefreshJWT(email),
  };
};
