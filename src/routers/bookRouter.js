import express from "express";
import {
  adminAuth,
  getUserFromAccessJWT,
} from "../middlewares/authMiddleware.js";
import { newBookValidation } from "../middlewares/joiValidation.js";
import {
  createBook,
  getAllBooks,
  getOneBook,
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
      ? [await getOneBook({ ...filter, _id })]
      : await getAllBooks(filter);

    books?.length > 0
      ? res.json({
          status: "success",
          message: "book list",
          books,
        })
      : res.json({
          status: "error",
          message:
            "Currently, our shelves are awaiting new arrivals. Please stay tuned for exciting additions!",
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

// delete a book

export default router;
