const Genre = require("../models/genre");
const Book = require("../models/book");
const async = require("async");
const { body, validationResult } = require("express-validator");

exports.genreList = (req, res, next) => {
  Genre.find()
    .sort({ name: "ascending" })
    .exec((err, genreList) => {
      if (err) return next(err);
      res.render("genre_list", { title: "Genre list", genreList });
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
        title: "Genre detail",
        genre,
        genreBooks,
      });
    }
  );
};

exports.genreCreateGet = (req, res) => {
  res.render("genre_form", { title: "Create genre" });
};

exports.genreCreatePost = [
  body("name")
    .trim()
    .isLength({ min: 1 })
    .withMessage("Genre name can't be empty")
    .escape(),
  (req, res, next) => {
    const errors = validationResult(req);
    const genre = new Genre({ name: req.body.name });

    if (!errors.isEmpty()) {
      res.render("genre_form", {
        title: "Create genre",
        genre,
        errors: errors.array(),
      });
      return;
    } else {
      Genre.findOne({ name: req.body.name }).exec((err, foundGenre) => {
        if (err) return next(err);

        if (foundGenre) {
          res.redirect(foundGenre.url);
        } else {
          genre.save((err) => {
            if (err) return next(err);
            res.redirect(genre.url);
          });
        }
      });
    }
  },
];

exports.genreDeleteGet = (req, res, next) => {
  async.parallel(
    {
      genre(callback) {
        Genre.findById(req.params.id).exec(callback);
      },
      books(callback) {
        Book.find({ genre: req.params.id }).exec(callback);
      },
    },
    (err, { genre, books }) => {
      if (err) return next(err);

      if (genre == null) res.redirect("/catalog/genres");

      res.render("genre_delete", { title: "Delete genre", genre, books });
    }
  );
};

exports.genreDeletePost = (req, res, next) => {
  async.parallel(
    {
      genre(callback) {
        Genre.findById(req.params.id).exec(callback);
      },
      books(callback) {
        Book.find({ genre: req.params.id }).exec(callback);
      },
    },
    (err, { genre, books }) => {
      if (err) return next(err);

      if (genre == null) res.redirect("/catalog/genres");

      if (books.length > 0) {
        res.render("genre_delete", { title: "Delete genre", genre, books });
      }

      Genre.findByIdAndDelete(req.body.genreid).exec((err) => {
        if (err) return next(err);
        res.redirect("/catalog/genres");
      });
    }
  );
};

exports.genreUpdateGet = (req, res, next) => {
  Genre.findById(req.params.id).exec((err, genre) => {
    if (err) return next(err);

    res.render("genre_form", { title: "Update genre", genre });
  });
};

exports.genreUpdatePost = [
  body("name")
    .trim()
    .isLength({ min: 1 })
    .withMessage("Genre name can't be empty")
    .escape(),
  (req, res, next) => {
    const errors = validationResult(req);

    const genre = new Genre({
      name: req.body.name,
      _id: req.params.id,
    });

    if (!errors.isEmpty()) {
      res.render("genre_form", {
        title: "Update genre",
        genre,
        errors: errors.array(),
      });
    }

    Genre.findByIdAndUpdate(req.params.id, genre, {}, (err, updatedGenre) => {
      if (err) return next(err);

      res.redirect(updatedGenre.url);
    });
  },
];
