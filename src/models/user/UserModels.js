import UserSchema from "./UserSchema.js";

// CRUD
// create
export const createUser = (obj) => {
  return UserSchema(obj).save();
};

// read
export const getAllUsersByRole = (filter) => {
  const selectedProperties = {
    _id: 1,
    status: 1,
    role: 1,
    fname: 1,
    lname: 1,
    address: 1,
    phone: 1,
    email: 1,
    createdAt: 1,
  };
  return UserSchema.find(filter, selectedProperties);
};

// update
export const updateUser = (filter, data) => {
  return UserSchema.findOneAndUpdate(filter, { data });
};
