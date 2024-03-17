const express = require('express');
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();
 
 

const doesExist = (username)=>{
    let userswithsamename = users.filter((user)=>{
      return user.username === username
    });
    if(userswithsamename.length > 0){
      return true;
    } else {
      return false;
    }
  }
public_users.post("/register", (req,res) => {
    const username = req.body.username;
    const password = req.body.password;
    if (username && password) {
      if (!doesExist(username)) {
        users.push({"username":username,"password":password});
        return res.status(200).json({message: "User successfully registred. Now you can login"});
      } else {
        return res.status(404).json({message: "User already exists!"});
      }
    }
    return res.status(404).json({message: "Unable to register user."});
});

// Get the book list available in the shop
public_users.get('/',function (req, res) {
  res.send(JSON.stringify(books,null,4));
});

// Get book details based on ISBN
public_users.get('/isbn/:isbn',function (req, res) {
    const isbn = req.params.isbn;
    
    // Check if the ISBN exists in the books object
    if (books.hasOwnProperty(isbn)) {
        // Book found, send details as response
        res.json(books[isbn]);
    } else {
        // Book not found, send 404 status
        res.status(404).send('Book not found');
    }
  });
  
// Get book details based on author
public_users.get('/author/:author',function (req, res) {
  const author = req.params.author;
  const matchingBooks = [];
  for (let key in books) {
    if (books.hasOwnProperty(key)) {
        // Check if the author matches the one provided in the request parameters
        if (books[key].author === author) {
            matchingBooks.push(books[key]);
        }
    }
}
if (matchingBooks.length === 0) {
    res.status(404).send('No books found for the provided author.');
} else {
    res.status(200).json(matchingBooks);
}
});

// Get all books based on title
public_users.get('/title/:title',function (req, res) {
  const title = req.params.title;
  const matchingTitle = [];
  for (let key in books){
    if(books.hasOwnProperty(key)){
        if(books[key].title === title){
            matchingTitle.push(books[key]);
        }
    }
  }
  if (matchingTitle.length === 0){
    res.status(400).send('No books found for the provided title.');
  } else {
    res.status(200).json(matchingTitle);
  }
});

//  Get book review
public_users.get('/review/:isbn',function (req, res) {
  const isbn = req.params.isbn;
  if (books[isbn]) {
    const book = books[isbn];
    const reviews = book.reviews;

    // Send the reviews as response
    res.json({ success: true, reviews: reviews });
  } else {
    // If the book with the given ISBN doesn't exist, send an error response
    res.status(404).json({ success: false, message: "Book not found" });
  }
});

module.exports.general = public_users;
