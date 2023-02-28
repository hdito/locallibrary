const Genre = require("../models/genre");

exports.genreList = (req, res) => {
  res.send("NOT IMPLEMENTED: Genre list");
};

exports.genreDetail = (req, res) => {
  res.send(`NOT IMPLEMENTED: Genre detail: ${req.params.id}`);
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
