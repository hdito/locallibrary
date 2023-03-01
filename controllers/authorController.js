const Author = require("../models/author");
const Book = require("../models/book");
const async = require("async");

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
  res.send("NOT IMPLEMENTED: Author create GET");
};

exports.authorCreatePost = (req, res) => {
  res.send("NOT IMPLEMENTED: Author create post");
};

exports.authorDeleteGet = (req, res) => {
  res.send("NOT IMPLEMENTED: Author delete GET");
};

exports.authorDeletePost = (req, res) => {
  res.send("NOT IMPLEMENTED: Author delete POST");
};

exports.authorUpdateGet = (req, res) => {
  res.send("NOT IMPLEMENTED: Author update POST");
};

exports.authorUpdatePost = (req, res) => {
  res.send("NOT IMPLEMENTED: Author update POST");
};
