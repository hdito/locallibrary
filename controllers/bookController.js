const Book = require("../models/book");
const Author = require("../models/author");
const Genre = require("../models/genre");
const BookInstance = require("../models/bookinstance");

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

exports.bookCreateGet = (req, res) => {
  res.send("NOT IMPLEMENTED: Book create GET");
};

exports.bookCreatePost = (req, res) => {
  res.send("NOT IMPLEMENTED: Book create POST");
};

exports.bookDeleteGet = (req, res) => {
  res.send("NOT IMPLEMENTED: Book delete GET");
};

exports.bookDeletePost = (req, res) => {
  res.send("NOT IMPLEMENTED: Book delete POST");
};

exports.bookUpdateGet = (req, res) => {
  res.send("NOT IMPLEMENTED: Book update GET");
};

exports.bookUpdatePost = (req, res) => {
  res.send("NOT IMPLEMENTED: Book update POST");
};
