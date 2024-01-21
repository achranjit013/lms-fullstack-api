import express from "express";
import {
  adminAuth,
  getUserFromAccessJWT,
} from "../middlewares/authMiddleware.js";
import {
  newBookValidation,
  updateBookValidation,
} from "../middlewares/joiValidation.js";
import {
  createBook,
  deleteABook,
  getAllBooks,
  getOneBook,
  updateABook,
} from "../models/book/BookModel.js";

const router = express.Router();

// get book according to user status
router.get("/:_id?", async (req, res, next) => {
  try {
    const { authorization } = req.headers;
    const { _id } = req.params; //_id is a book id

    let filter = { status: "active" };

    if (authorization) {
      // get user from authorization headers
      const user = await getUserFromAccessJWT(authorization);

      if (user?.role === "admin") {
        filter = {};
      }
    }

    const books = _id
      ? await getOneBook({ ...filter, _id })
      : await getAllBooks(filter);

    res.json({
      status: "success",
      message: "book list",
      books,
    });
  } catch (error) {
    next(error);
  }
});

// private endpoints below this

// post a book
router.post("/", adminAuth, newBookValidation, async (req, res, next) => {
  try {
    const book = await createBook(req.body);

    book?._id
      ? res.json({
          status: "success",
          message: "Congratulations!!! A new book has been added!",
          book,
        })
      : res.json({
          status: "error",
          message:
            "Sorry!!! We're currently unable to add a new book. Please try again later. Thank you!",
        });
  } catch (error) {
    if (error.message.includes("E11000 duplicate key error collection")) {
      error.message =
        "Uh-oh! It seems there's already a book with the same ISBN. Please use a different ISBN or try accessing the book. Thank you!";
      error.errorCode = 200;
    }
    next(error);
  }
});

// update a book
router.put("/", adminAuth, updateBookValidation, async (req, res, next) => {
  try {
    const { _id, ...rest } = req.body;
    console.log(_id, rest);
    const book = await updateABook({ _id }, rest);

    book?._id
      ? res.json({
          status: "success",
          message: "Congratulations!!! The book has been updated successfully!",
          book,
        })
      : res.json({
          status: "error",
          message:
            "Sorry!!! We're currently unable to update the book. Please try again later. Thank you!",
        });
  } catch (error) {
    next(error);
  }
});

// delete a book
router.delete("/:_id?", adminAuth, async (req, res, next) => {
  try {
    const book = await deleteABook(req.params);

    book?._id
      ? res.json({
          status: "success",
          message: "Congratulations!!! The book has been deleted successfully!",
        })
      : res.json({
          status: "error",
          message:
            "Sorry!!! We're currently unable to delete the book. Please try again later. Thank you!",
        });
  } catch (error) {
    next(error);
  }
});

export default router;
