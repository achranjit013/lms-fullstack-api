import BookSchema from "./BookSchema.js";

// CRUD
// create
export const createBook = (obj) => {
  return BookSchema(obj).save();
};

// read: get all books
export const getAllBooks = (filter) => {
  return BookSchema.find(filter);
};

// read: get one book by id or isbn
export const getOneBook = (filter) => {
  return BookSchema.findOne(filter);
};

// update a book by id or isbn
export const updateABook = (filter, data) => {
  return BookSchema.findOneAndUpdate(filter, data);
};

// delete a book by id or isbn
export const deleteABook = (filter) => {
  return BookSchema.findOneAndDelete(filter);
};
