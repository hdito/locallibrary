const Genre = require("../models/genre");
const Book = require("../models/book");
const async = require("async");

exports.genreList = (req, res, next) => {
  Genre.find()
    .sort({ name: "ascending" })
    .exec((err, genreList) => {
      if (err) return next(err);
      res.render("genre_list", { title: "Genre List", genreList });
    });
};

exports.genreDetail = (req, res, next) => {
  async.parallel(
    {
      genre(callback) {
        Genre.findById(req.params.id).exec(callback);
      },
      genreBooks(callback) {
        Book.find({ genre: req.params.id }).exec(callback);
      },
    },
    (err, { genre, genreBooks }) => {
      if (err) {
        return next(err);
      }
      if (genre == null) {
        const error = new Error("Genre not found");
        error.status = 404;
        return next(error);
      }
      res.render("genre_detail", {
        title: "Genre Detail",
        genre,
        genreBooks,
      });
    }
  );
};

exports.genreCreateGet = (req, res) => {
  res.send("NOT IMPLEMENTED: Genre create GET");
};

exports.genreCreatePost = (req, res) => {
  res.send("NOT IMPLEMENTED: Genre create POST");
};

exports.genreDeleteGet = (req, res) => {
  res.send("NOT IMPLEMENTED: Genre delete GET");
};

exports.genreDeletePost = (req, res) => {
  res.send("NOT IMPLEMENTED: Genre delete POST");
};

exports.genreUpdateGet = (req, res) => {
  res.send("NOT IMPLEMENTED: Genre update GET");
};

exports.genreUpdatePost = (req, res) => {
  res.send("NOT IMPLEMENTED: Genre update POST");
};
