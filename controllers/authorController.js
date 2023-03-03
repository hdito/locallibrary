const Author = require("../models/author");
const Book = require("../models/book");
const async = require("async");
const { body, validationResult } = require("express-validator");

exports.authorList = (req, res, next) => {
  Author.find()
    .sort({ family_name: "ascending" })
    .exec((err, authorList) => {
      if (err) return next(err);
      res.render("author_list", { title: "Author List", authorList });
    });
};

exports.authorDetail = (req, res, next) => {
  async.parallel(
    {
      author(callback) {
        Author.findById(req.params.id).exec(callback);
      },
      authorBooks(callback) {
        Book.find({ author: req.params.id }, "title summary").exec(callback);
      },
    },
    (err, { author, authorBooks }) => {
      if (err) return next(err);
      if (author == null) {
        const error = new Error("Author not found");
        error.status = 404;
        return next(error);
      }
      res.render("author_detail", {
        title: "Author Detail",
        author,
        authorBooks,
      });
    }
  );
};

exports.authorCreateGet = (req, res) => {
  res.render("author_form", { title: "Create Author" });
};

exports.authorCreatePost = [
  body("first_name")
    .trim()
    .isLength({ min: 1 })
    .escape()
    .withMessage("First name can't be empty")
    .isAlphanumeric()
    .withMessage("First name should consist only from letters and numbers"),
  body("family_name")
    .trim()
    .isLength({ min: 1 })
    .escape()
    .withMessage("Family name can't be empty")
    .isAlphanumeric()
    .withMessage("Family name should consist only from letters and numbers"),
  body("date_of_birth", "Invalid date of birth")
    .optional({ checkFalsy: true })
    .isISO8601()
    .toDate(),
  body("date_of_death", "Invalid date of death")
    .optional({ checkFalsy: true })
    .isISO8601()
    .toDate(),
  (req, res) => {
    const errors = validationResult(req);

    if (errors.isEmpty()) {
      res.render("author_form", {
        title: "Create author",
        author: req.body,
        errors: errors.array(),
      });
      return;
    }

    const author = new Author({
      first_name: req.body.first_name,
      family_name: req.body.family_name,
      date_of_birth: req.body.date_of_birth,
      date_of_death: req.body.date_of_death,
    });
    author.save((err) => {
      if (err) return next(err);
      res.redirect(author.url);
    });
  },
];

exports.authorDeleteGet = (req, res, next) => {
  async.parallel(
    {
      author(callback) {
        Author.findById(req.params.id).exec(callback);
      },
      authorBooks(callback) {
        Book.find({ author: req.params.id }).exec(callback);
      },
    },
    (err, { author, authorBooks }) => {
      if (err) return next(err);

      if (author == null) res.redirect("/catalog/authors");

      res.render("author_delete", {
        title: "Delete author",
        author,
        authorBooks,
      });
    }
  );
};

exports.authorDeletePost = (req, res, next) => {
  async.parallel(
    {
      author(callback) {
        Author.findById(req.body.authorid).exec(callback);
      },
      authorBooks(callback) {
        Book.find({ author: req.body.authorid }).exec(callback);
      },
    },
    (err, { author, authorBooks }) => {
      if (err) return next(err);
      if (authorBooks.length > 0) {
        res.render("author_delete", {
          title: "Delete author",
          author,
          authorBooks,
        });
        return;
      }

      if (author == null) res.redirect("/catalog/authors");

      Author.findByIdAndDelete(req.body.authorid, (err) => {
        if (err) return next(err);
        res.redirect("/catalog/authors");
      });
    }
  );
};

exports.authorUpdateGet = (req, res, next) => {
  Author.findById(req.params.id)
    .orFail()
    .exec((err, author) => {
      if (err) return next(err);

      res.render("author_form", {
        title: "Update author",
        author,
      });
    });
};

exports.authorUpdatePost = [
  body("first_name")
    .trim()
    .isLength({ min: 1 })
    .escape()
    .withMessage("First name can't be empty")
    .isAlphanumeric()
    .withMessage("First name should consist only from letters and numbers"),
  body("family_name")
    .trim()
    .isLength({ min: 1 })
    .escape()
    .withMessage("Family name can't be empty")
    .isAlphanumeric()
    .withMessage("Family name should consist only from letters and numbers"),
  body("date_of_birth", "Invalid date of birth")
    .optional({ checkFalsy: true })
    .isISO8601()
    .toDate(),
  body("date_of_death", "Invalid date of death")
    .optional({ checkFalsy: true })
    .isISO8601()
    .toDate(),
  (req, res) => {
    const errors = validationResult(req);

    const author = new Author({
      first_name: req.body.first_name,
      family_name: req.body.family_name,
      date_of_birth: req.body.date_of_birth,
      date_of_death: req.body.date_of_death,
      _id: req.params.id,
    });

    if (errors.isEmpty()) {
      res.render("author_form", {
        title: "Update author",
        author,
        errors: errors.array(),
      });
      return;
    }

    Author.findByIdAndUpdate(
      req.params.id,
      author,
      {},
      (err, updatedAuthor) => {
        if (err) {
          return next(err);
        }

        res.redirect(updatedAuthor.url);
      }
    );
  },
];
