import Joi from "joi";

const SHORTSTR = Joi.string().max(100);
const SHORTSTRREQ = SHORTSTR.required();
const LONGSTR = Joi.string().max(5000);
const LONGSTRREQ = LONGSTR.required();
const SHORTNUM = Joi.number();
const SHORTNUMREQ = SHORTNUM.required();
const EMAIL = Joi.string().email({ minDomainSegments: 2 });
const EMAILREQ = EMAIL.required();
const BOOLTRUE = Joi.boolean();

const validationProcessor = ({ schemaObj, req, res, next }) => {
  try {
    const schema = Joi.object(schemaObj);
    const { error } = schema.validate(req.body);

    // if error, return error message
    if (error) {
      return res.json({
        status: "error",
        message: error.message,
      });
    }

    // if no error, go to next middleware
    next();
  } catch (error) {
    console.log(error);
  }
};

// validate new user
export const newUserValidation = (req, res, next) => {
  const schemaObj = {
    fname: SHORTSTRREQ,
    lname: SHORTSTRREQ,
    address: SHORTSTRREQ.allow("", null),
    phone: SHORTSTRREQ.allow("", null),
    email: EMAILREQ,
    password: SHORTSTRREQ,
  };

  validationProcessor({ schemaObj, req, res, next });
};

// validate login user
export const userLoginValidation = (req, res, next) => {
  const schemaObj = {
    email: EMAILREQ,
    password: SHORTSTRREQ,
  };

  validationProcessor({ schemaObj, req, res, next });
};

// validate new book
export const newBookValidation = (req, res, next) => {
  const schemaObj = {
    thumbnail: LONGSTRREQ,
    name: SHORTSTRREQ,
    author: SHORTSTRREQ,
    publishYear: SHORTNUMREQ,
    isbn: SHORTSTRREQ,
    description: LONGSTRREQ,
  };

  validationProcessor({ schemaObj, req, res, next });
};
// validate update book
export const updateBookValidation = (req, res, next) => {
  const schemaObj = {
    _id: SHORTSTR,
    status: SHORTSTR,
    thumbnail: LONGSTRREQ,
    name: SHORTSTRREQ,
    author: SHORTSTRREQ,
    publishYear: SHORTNUMREQ,
    description: LONGSTRREQ,
    isAvailable: BOOLTRUE,
    dueDate: null,
  };

  validationProcessor({ schemaObj, req, res, next });
};
