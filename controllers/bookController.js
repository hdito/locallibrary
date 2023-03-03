const Book = require("../models/book");
const Author = require("../models/author");
const Genre = require("../models/genre");
const BookInstance = require("../models/bookinstance");
const { body, validationResult } = require("express-validator");

const async = require("async");

exports.index = (req, res) => {
  async.parallel(
    {
      bookCount(callback) {
        Book.countDocuments({}, callback);
      },
      bookInstanceCount(callback) {
        BookInstance.countDocuments({}, callback);
      },
      bookInstanceAvailableCount(callback) {
        BookInstance.countDocuments({ status: "Available" }, callback);
      },
      authorCount(callback) {
        Author.countDocuments({}, callback);
      },
      genreCount(callback) {
        Genre.countDocuments({}, callback);
      },
    },
    (err, results) => {
      console.log(results);
      res.render("index", {
        title: "Local Library Home",
        error: err,
        data: results,
      });
    }
  );
};

exports.bookList = (req, res, next) => {
  Book.find({}, "title author")
    .sort({ title: 1 })
    .populate("author")
    .exec((err, bookList) => {
      console.log(bookList);
      if (err) return next(err);
      res.render("book_list", { title: "Book List", bookList });
    });
};

exports.bookDetail = (req, res, next) => {
  async.parallel(
    {
      book(callback) {
        Book.findById(req.params.id)
          .populate("author")
          .populate("genre")
          .exec(callback);
      },
      bookInstances(callback) {
        BookInstance.find({ book: req.params.id }).exec(callback);
      },
    },
    (err, { book, bookInstances }) => {
      if (err) return next(err);
      if (book == null) {
        const error = new Error("Book not found");
        error.status = 404;
        return next(error);
      }
      res.render("book_detail", {
        title: book.title,
        book,
        bookInstances,
      });
    }
  );
};

exports.bookCreateGet = (req, res, next) => {
  async.parallel(
    {
      authors(callback) {
        Author.find(callback);
      },
      genres(callback) {
        Genre.find(callback);
      },
    },
    (err, { authors, genres }) => {
      if (err) return next(err);

      authors.sort((a, b) => {
        const textA = a.family_name.toLowerCase();
        const textB = b.family_name.toLowerCase();
        return textA < textB ? -1 : textA > textB ? 1 : 0;
      });

      res.render("book_form", { title: "Create book", authors, genres });
    }
  );
};

exports.bookCreatePost = [
  (req, res, next) => {
    if (!Array.isArray(req.body.genre))
      req.body.genre =
        typeof req.body.genre === "undefined" ? [] : [req.body.genre];
    next();
  },
  body("title", "Title can't be empty").trim().isLength({ min: 1 }).escape(),
  body("author", "Author can't be empty").trim().isLength({ min: 1 }).escape(),
  body("summary", "Summary can't be empty")
    .trim()
    .isLength({ min: 1 })
    .escape(),
  body("isbn", "ISBN can't be empty").trim().isLength({ min: 1 }).escape(),
  body("genre.*").escape(),
  (req, res, next) => {
    const errors = validationResult(req);
    const book = new Book({
      title: req.body.title,
      author: req.body.author,
      summary: req.body.summary,
      isbn: req.body.isbn,
      genre: req.body.genre,
    });

    if (!errors.isEmpty()) {
      async.parallel(
        {
          authors(callback) {
            Author.find(callback);
          },
          genres(callback) {
            Genre.find(callback);
          },
        },
        (err, { authors, genres }) => {
          if (err) return next(err);

          for (const genre of genres) {
            if (book.genre.includes(genre._id)) genre.checked = "true";
          }

          res.render("book_form", {
            title: "Create book",
            authors,
            genres,
            errors: errors.array(),
          });
        }
      );
      return;
    }

    book.save((err) => {
      if (err) return next(err);
      res.redirect(book.url);
    });
  },
];

exports.bookDeleteGet = (req, res, next) => {
  async.parallel(
    {
      book(callback) {
        Book.findById(req.params.id).exec(callback);
      },
      bookInstances(callback) {
        BookInstance.find({ book: req.params.id }).exec(callback);
      },
    },
    (err, { book, bookInstances }) => {
      if (err) return next(err);

      if (book == null) res.redirect("/catalog/books");

      res.render("book_delete", {
        title: "Delete book",
        book,
        bookInstances,
      });
    }
  );
};

exports.bookDeletePost = (req, res, next) => {
  async.parallel(
    {
      book(callback) {
        Book.findById(req.body.bookid).exec(callback);
      },
      bookInstances(callback) {
        BookInstance.find({ book: req.body.bookid }).exec(callback);
      },
    },
    (err, { book, bookInstances }) => {
      if (err) return next(err);

      if (book == null) res.redirect("/catalog/books");

      if (bookInstances.length > 0) {
        res.render("book_delete", {
          title: "Delete book",
          book,
          bookInstances,
        });
      }

      Book.findByIdAndDelete(req.body.bookid).exec((err) => {
        if (err) return next(err);

        res.redirect("/catalog/books");
      });
    }
  );
};

exports.bookUpdateGet = (req, res, next) => {
  async.parallel(
    {
      book(callback) {
        Book.findById(req.params.id).orFail().exec(callback);
      },
      authors(callback) {
        Author.find(callback);
      },
      genres(callback) {
        Genre.find(callback);
      },
    },
    (err, { book, authors, genres }) => {
      if (err) return next(err);

      genres.forEach((genre) => {
        book.genre.forEach((bookGenre) => {
          if (genre._id.toString() !== bookGenre._id.toString()) return;
          genre.checked = "true";
        });
      });

      res.render("book_form", { title: "Update book", authors, genres, book });
    }
  );
};

exports.bookUpdatePost = [
  (req, res, next) => {
    if (!Array.isArray(req.body.genre)) {
      req.body.genre =
        typeof req.body.genre === "undefined" ? [] : [req.body.genre];
    }
    next();
  },
  body("title", "Title must not be empty.")
    .trim()
    .isLength({ min: 1 })
    .escape(),
  body("author", "Author must not be empty.")
    .trim()
    .isLength({ min: 1 })
    .escape(),
  body("summary", "Summary must not be empty.")
    .trim()
    .isLength({ min: 1 })
    .escape(),
  body("isbn", "ISBN must not be empty").trim().isLength({ min: 1 }).escape(),
  body("genre.*").escape(),
  (req, res, next) => {
    const errors = validationResult(req);

    const book = new Book({
      title: req.body.title,
      author: req.body.author,
      summary: req.body.summary,
      isbn: req.body.isbn,
      genre: typeof req.body.genre === "undefined" ? [] : req.body.genre,
      _id: req.params.id,
    });

    if (!errors.isEmpty()) {
      async.parallel(
        {
          authors(callback) {
            Author.find(callback);
          },
          genres(callback) {
            Genre.find(callback);
          },
        },
        (err, { authors, genres }) => {
          if (err) {
            return next(err);
          }

          for (const genre of genres) {
            if (book.genre.includes(genre._id)) {
              genre.checked = "true";
            }
          }
          res.render("book_form", {
            title: "Update Book",
            authors,
            genres,
            book,
            errors: errors.array(),
          });
        }
      );
      return;
    }
    Book.findByIdAndUpdate(req.params.id, book, {}, (err, updatedBook) => {
      if (err) {
        return next(err);
      }

      res.redirect(updatedBook.url);
    });
  },
];
