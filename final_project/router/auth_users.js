const express = require('express');
const jwt = require('jsonwebtoken');
let books = require("./booksdb.js");
const regd_users = express.Router();

let users = [];

const isValid = (username) => { 
  // Check if username exists and is not empty
  return username !== undefined && username.trim() !== '';
}

const authenticatedUser = (username, password) => {
  // Find user in our records
  const user = users.find(user => user.username === username && user.password === password);
  return user !== undefined;
}

//only registered users can login
regd_users.post("/login", (req, res) => {
  const { username, password } = req.body;
  //return res.status(401).json({message:users});
  if (!username || !password) {
    return res.status(400).json({message: "Username and password required"});
  }

  console.log(authenticatedUser(username, password));
  
  if (authenticatedUser(username, password)) {
    // Create JWT token
    const token = jwt.sign({username: username}, "fingerprint_customer", {expiresIn: "1h"});
    req.session.authorization = {token: token};
    return res.status(200).json({message: "Login successful", token: "JWT " + token});
  } else {
    return res.status(401).json({message: "Invalid credentials"});
  }
});

// Add a book review
regd_users.put("/auth/review/:isbn", (req, res) => {
  const isbn = req.params.isbn;
  const review = req.query.review; // Get review from query parameter instead of body
  const username = req.user.username;
  
  if (!books[isbn]) {
    return res.status(404).json({message: "Book not found"});
  }
  
  if (!review) {
    return res.status(400).json({message: "Review content required"});
  }
  
  // Add or update the review for this user
  books[isbn].reviews[username] = review;
  
  return res.status(200).json({
    message: "Review added/updated successfully",
    book: books[isbn].title,
    user: username,
    review: review
  });
});

// Delete a book review
regd_users.delete("/auth/review/:isbn", (req, res) => {
  const isbn = req.params.isbn;
  const username = req.user.username; // Get username from JWT token
  
  // Check if the book exists
  if (!books[isbn]) {
    return res.status(404).json({
      message: "Book not found",
      isbn: isbn
    });
  }
  
  // Check if this user has a review for this book
  if (!books[isbn].reviews[username]) {
    return res.status(404).json({
      message: "You have not reviewed this book",
      book: books[isbn].title,
      user: username
    });
  }
  
  // Store the review content before deletion (for confirmation)
  const reviewContent = books[isbn].reviews[username];
  
  // Delete only this user's review
  delete books[isbn].reviews[username];
  
  // Return success message with details
  return res.status(200).json({
    message: "Your review has been deleted successfully",
    book: books[isbn].title,
    isbn: isbn,
    user: username,
    deletedReview: reviewContent
  });
});

module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;
