const express = require("express");
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();

const getBooksAsync = () => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      resolve(books);
    }, 1000);
  });
};

public_users.post("/register", (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res
      .status(400)
      .json({ message: "Username and/or password not provided." });
  }

  if (isValid(username)) {
    users.push({ username, password });
    res
      .status(201)
      .json({ message: "Customer registered successfully. You can now login" });
  } else {
    return res.status(400).json({ message: "Username already exists." });
  }
});

// Get the book list available in the shop
public_users.get("/", function (req, res) {
  getBooksAsync().then((books) => {
    return res.status(200).send(JSON.stringify(books, null, 4));
  });
});

// Get book details based on ISBN
public_users.get("/isbn/:isbn", function (req, res) {
  const isbn = parseInt(req.params.isbn);
  getBooksAsync().then((books) => {
    if (books[isbn]) {
      return res.status(200).send(JSON.stringify(books[isbn], null, 4));
    }
    return res.status(404).json({ message: "Book Not found." });
  });
});

// Get book details based on author
public_users.get("/author/:author", function (req, res) {
  const author = req.params.author;
  getBooksAsync().then((books) => {
    let booksByAuthor = Object.values(books).filter(
      (book) => book.author === author
    );

    return res.status(200).send(JSON.stringify(booksByAuthor, null, 4));
  });
});

// Get all books based on title
public_users.get("/title/:title", function (req, res) {
  const title = req.params.title;
  getBooksAsync().then((books) => {
    let booksByTitle = Object.values(books).filter(
      (book) => book.title === title
    );
    return res.status(200).send(JSON.stringify(booksByTitle, null, 4));
  });
});

//  Get book review
public_users.get("/review/:isbn", function (req, res) {
  const isbn = parseInt(req.params.isbn);
  if (books[isbn]) {
    return res.status(200).send(JSON.stringify(books[isbn].reviews, null, 4));
  }
  return res.status(404).json({ message: "Book Not found." });
});

module.exports.general = public_users;
