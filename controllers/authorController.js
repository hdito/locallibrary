const Author = require("../models/author");

exports.authorList = (req, res) => {
  res.send("NOT IMPLEMENTED: Author list");
};

exports.authorDetail = (req, res) => {
  res.send(`NOT IMPLEMENTED: Author detail ${req.params.id}`);
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
