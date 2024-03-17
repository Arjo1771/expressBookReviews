const express = require('express');
const jwt = require('jsonwebtoken');
let books = require("./booksdb.js");
const regd_users = express.Router();

let users = [];

const isValid = (username)=>{ 
    const existingUser = users.find(user => user.username === username);
    
    
    return !!existingUser;
}

const authenticatedUser = (username,password)=>{  
        let validusers = users.filter((user)=>{
          return (user.username === username && user.password === password)
        });
        if(validusers.length > 0){
          return true;
        } else {
          return false;
        }
      }


//only registered users can login
regd_users.post("/login", (req,res) => {
    const username = req.body.username;
    const password = req.body.password;
    if (!username || !password) {
        return res.status(400).json({ message: "Error logging in" });
    }
    if (authenticatedUser(username, password)) {
        let accessToken = jwt.sign({
            username: username
        }, 'access', { expiresIn: 60 * 60 });
        req.session.authorization = {
            accessToken: accessToken,
            username: username
        }
        return res.status(200).json({ message: "User successfully logged in" });
    } else {
        return res.status(401).json({ message: "Invalid Login. Check username and password" });
    }

});

// Add a book review
regd_users.put("/auth/review/:isbn", (req, res) => {
    const username = req.params.username;
    const isbn = req.params.isbn;
    const review = req.params.review; // Assuming the review is passed in the request body

    if (!username || !isbn || !review) {
        return res.status(400).json({ message: "Invalid request. Please provide username, ISBN, and review in the request body" });
    }

    let book = books.find(book => book.isbn === isbn);
    if (!book) {
        return res.status(404).json({ message: "Book not found" });
    }

    let existingReviewIndex = book.reviews.findIndex(r => r.username === username);
    if (existingReviewIndex !== -1) {
        // Modify existing review
        book.reviews[existingReviewIndex].review = review;
        return res.status(200).json({ message: "Review updated successfully" });
    } else {
        // Add new review
        book.reviews.push({ username: username, review: review });
        return res.status(200).json({ message: "Review added successfully" });
    }   
});


regd_users.delete("/auth/review/:isbn", (req, res) => {
    const username = req.session.authorization.username;
    const isbn = req.params.isbn;

    if (!username || !isbn) {
        return res.status(400).json({ message: "Invalid request. Please provide username and ISBN" });
    }

    let book = books.find(book => book.isbn === isbn);
    if (!book) {
        return res.status(404).json({ message: "Book not found" });
    }

    let existingReviewIndex = book.reviews.findIndex(r => r.username === username);
    if (existingReviewIndex !== -1) {
        book.reviews.splice(existingReviewIndex, 1);
        return res.status(200).json({ message: "Review deleted successfully" });
    } else {
        return res.status(404).json({ message: "Review not found for deletion" });
    }
  });
module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;
