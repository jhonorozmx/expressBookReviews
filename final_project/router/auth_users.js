const express = require("express");
const jwt = require("jsonwebtoken");
let books = require("./booksdb.js");
const regd_users = express.Router();

let users = [];

const isValid = (username) => {
  //returns boolean
  const existingUser = users.find((user) => user.username === username);
  return existingUser ? false : true;
};

const authenticatedUser = (username, password) => {
  //returns boolean
  return users.some(
    (user) => user.username === username && user.password === password
  );
};

//only registered users can login
regd_users.post("/login", (req, res) => {
  const username = req.body.username;
  const password = req.body.password;

  if (!username || !password) {
    return res.status(400).json({
      message: "Error logging in. Username or password not provided.",
    });
  }

  if (authenticatedUser(username, password)) {
    const accessToken = jwt.sign(
      {
        data: password,
      },
      "access",
      { expiresIn: 60 * 60 }
    );
    req.session.authorization = { accessToken, username };
    return res.status(200).json({ message: "Customer successfully logged in." });
  }

  return res
    .status(401)
    .json({ message: "Invalid Login. Check username and password." });
});

// Add a book review
regd_users.put("/auth/review/:isbn", (req, res) => {
  const isbn = parseInt(req.params.isbn);
  const book = books[isbn];
  const { review } = req.query;
  const { username } = req.session.authorization;

  if (!book) {
    return res.status(404).json({ message: "Book Not found." });
  }

  if (!review) {
    return res.status(400).json({ message: "Review not provided." });
  }

  //check if the user has reviewed the book before updating the reviews object
  const existingReview = book.reviews.hasOwnProperty(username);
  book.reviews[username] = review;

  if (existingReview) {
    return res.status(200).json({ message: "Review updated successfully." });
  } else {
    return res.status(201).json({ message: "Review created successfully." });
  }
});

// Delete a book review
regd_users.delete("/auth/review/:isbn", (req, res) => {
  const isbn = parseInt(req.params.isbn);
  const book = books[isbn];
  const { username } = req.session.authorization;

  if (!book) {
    return res.status(404).json({ message: "Book Not found." });
  }

  delete book.reviews[username];
  return res.status(200).json({ message: "Review deleted successfully." });
});

module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;
