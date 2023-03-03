const BookInstance = require("../models/bookinstance");
const { body, validationResult } = require("express-validator");
const Book = require("../models/book");
const async = require("async");

exports.bookInstanceList = (req, res, next) => {
  BookInstance.find()
    .populate("book")
    .exec((err, bookInstanceList) => {
      if (err) return next(err);

      res.render("bookinstance_list", {
        title: "Book Instance List",
        bookInstanceList,
      });
    });
};

exports.bookInstanceDetail = (req, res, next) => {
  BookInstance.findById(req.params.id)
    .populate("book")
    .exec((err, bookInstance) => {
      if (err) return next(err);
      if (bookInstance == null) {
        const error = new Error("Book copy not found");
        error.status = 404;
        return next(error);
      }
      res.render("bookinstance_detail", {
        title: `Copy: ${bookInstance.book.title}`,
        bookInstance,
      });
    });
};

exports.bookInstanceCreateGet = (req, res, next) => {
  Book.find({}, "title").exec((err, books) => {
    if (err) return next(err);

    books.sort((a, b) => {
      const textA = a.title.toUpperCase();
      const textB = b.title.toUpperCase();
      return textA < textB ? -1 : textA > textB ? 1 : 0;
    });

    res.render("bookinstance_form", {
      title: "Create book instance",
      books,
    });
  });
};

exports.bookInstanceCreatePost = [
  body("book", "Book must be specified").trim().isLength({ min: 1 }).escape(),
  body("imprint", "Imprint must be specified")
    .trim()
    .isLength({ min: 1 })
    .escape(),
  body("status", "Invalid status").isIn([
    "Maintenance",
    "Available",
    "Loaned",
    "Reserved",
  ]),
  body("due_back", "Invalid date")
    .optional({ checkFalsy: true })
    .isISO8601()
    .toDate(),
  (req, res, next) => {
    const errors = validationResult(req);

    const bookInstance = new BookInstance({
      book: req.body.book,
      imprint: req.body.imprint,
      status: req.body.status,
      due_back: req.body.due_back,
    });

    if (!errors.isEmpty()) {
      Book.find({}, "title").exec((err, books) => {
        if (err) {
          return next(err);
        }

        books.sort((a, b) => {
          const textA = a.title.toUpperCase();
          const textB = b.title.toUpperCase();
          return textA < textB ? -1 : textA > textB ? 1 : 0;
        });

        res.render("bookinstance_form", {
          title: "Create book instance",
          books,
          errors: errors.array(),
          bookInstance,
        });
      });
      return;
    }

    bookInstance.save((err) => {
      if (err) return next(err);

      res.redirect(bookInstance.url);
    });
  },
];

exports.bookInstanceDeleteGet = (req, res, next) => {
  BookInstance.findById(req.params.id)
    .populate("book")
    .exec((err, bookInstance) => {
      if (err) return next(err);

      if (bookInstance == null) res.redirect("/catalog/bookinstances");

      res.render("bookinstance_delete", {
        title: "Delete book instance",
        bookInstance,
      });
    });
};

exports.bookInstanceDeletePost = (req, res, next) => {
  BookInstance.findById(req.body.bookinstanceid)
    .populate("book")
    .exec((err, bookInstance) => {
      if (err) return next(err);

      if (bookInstance == null) res.redirect("/catalog/bookinstances");

      BookInstance.findByIdAndDelete(req.body.bookinstanceid).exec((err) => {
        if (err) return next(err);

        res.redirect("/catalog/bookinstances");
      });
    });
};

exports.bookInstanceUpdateGet = (req, res, next) => {
  async.parallel(
    {
      bookInstance(callback) {
        BookInstance.findById(req.params.id).orFail().exec(callback);
      },
      books(callback) {
        Book.find({}, "title").exec(callback);
      },
    },
    (err, { bookInstance, books }) => {
      if (err) return next(err);

      books.sort((a, b) => {
        const textA = a.title.toUpperCase();
        const textB = b.title.toUpperCase();
        return textA < textB ? -1 : textA > textB ? 1 : 0;
      });

      res.render("bookinstance_form", {
        title: "Update book instance",
        books,
        bookInstance,
      });
    }
  );
};

exports.bookInstanceUpdatePost = [
  body("book", "Book must be specified").trim().isLength({ min: 1 }).escape(),
  body("imprint", "Imprint must be specified")
    .trim()
    .isLength({ min: 1 })
    .escape(),
  body("status", "Invalid status").isIn([
    "Maintenance",
    "Available",
    "Loaned",
    "Reserved",
  ]),
  body("due_back", "Invalid date")
    .optional({ checkFalsy: true })
    .isISO8601()
    .toDate(),
  (req, res, next) => {
    const errors = validationResult(req);

    const bookInstance = new BookInstance({
      book: req.body.book,
      imprint: req.body.imprint,
      status: req.body.status,
      due_back: req.body.due_back,
      _id: req.params.id,
    });

    if (!errors.isEmpty()) {
      Book.find({}, "title").exec((err, books) => {
        if (err) {
          return next(err);
        }

        books.sort((a, b) => {
          const textA = a.title.toUpperCase();
          const textB = b.title.toUpperCase();
          return textA < textB ? -1 : textA > textB ? 1 : 0;
        });

        res.render("bookinstance_form", {
          title: "Update book instance",
          books,
          errors: errors.array(),
          bookInstance,
        });
      });
      return;
    }
    BookInstance.findByIdAndUpdate(
      req.params.id,
      bookInstance,
      {},
      (err, updatedBookInstance) => {
        if (err) return next(err);

        res.redirect(updatedBookInstance.url);
      }
    );
  },
];
