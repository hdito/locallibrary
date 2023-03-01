const BookInstance = require("../models/bookinstance");

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

exports.bookInstanceCreateGet = (req, res) => {
  res.send("NOT IMPLEMENTED: BookInstance create GET");
};

exports.bookInstanceCreatePost = (req, res) => {
  res.send("NOT IMPLEMENTED: BookInstance create POST");
};

exports.bookInstanceDeleteGet = (req, res) => {
  res.send("NOT IMPLEMENTED: BookInstance delete GET");
};

exports.bookInstanceDeletePost = (req, res) => {
  res.send("NOT IMPLEMENTED: BookInstance delete POST");
};

exports.bookInstanceUpdateGet = (req, res) => {
  res.send("NOT IMPLEMENTED: BookInstance update GET");
};

exports.bookInstanceUpdatePost = (req, res) => {
  res.send("NOT IMPLEMENTED: BookInstance update POST");
};
