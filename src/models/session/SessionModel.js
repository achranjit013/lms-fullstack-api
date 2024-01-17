import SessionSchema from "./SessionSchema.js";

// create session
export const createSession = (obj) => {
  return SessionSchema(obj).save();
};

// read session
export const getSession = (filter) => {
  return SessionSchema.findOne(filter);
};

// delete session
export const deleteSession = (filter) => {
  return SessionSchema.findOneAndDelete(filter);
};
