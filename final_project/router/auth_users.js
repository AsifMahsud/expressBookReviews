const express = require('express');
const jwt = require('jsonwebtoken');
let books = require("./booksdb.js");
const regd_users = express.Router();

let users = [];

const isValid = (username)=>{ //returns boolean
//write code to check is the username is valid
    let userswithsamename = users.filter((user)=>{
        return user.username === username
    });
    if(userswithsamename.length > 0){
        return true;
    } else {
        return false;
  }
}

const authenticatedUser = (username,password)=>{ //returns boolean
//write code to check if username and password match the one we have in records.
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
  //Write your code here
    const username = req.body.username;
    const password = req.body.password;
    console.log('users:' + users)
    if (!username || !password) {
        return res.status(404).json({message: "Error logging in"});
    }
    if (authenticatedUser(username,password)) {
        let accessToken = jwt.sign({
        data: password
        }, 'access', { expiresIn: 60 * 60 });
        req.session.authorization = {
        accessToken,username
    }
    return res.status(200).send("User successfully logged in");
    } else {
        return res.status(208).json({message: "Invalid Login. Check username and password"});
  }});

// Add a book review
regd_users.put("/auth/review/:isbn", (req, res) => {
  //Write your code here
  const isbn = req.params.isbn;
    const review = req.body.review;
    const username = req.session.authorization.username;
    console.log("add review: ", req.params, req.body, req.session);
    if (books[isbn]) {
        let book = books[isbn];
        book.reviews[username] = review;
        return res.status(200).send(`Review successfully posted, after review added the 
        ISBN ${isbn} book's detail is: `+ JSON.stringify(book, null,4));
    }
    else {
        return res.status(404).json({message: `ISBN ${isbn} not found`});
    }
});

//Deleting a book review
regd_users.delete("/auth/review/:isbn", (req,res) =>{
    const isbn = req.params.isbn;
    const username = req.session.authorization.username;
    
    if (books[isbn]) {
        if(books[isbn].reviews[username]){
        delete books[isbn].reviews[username];
        return res.status(200).send(`The review of the user ${username} is deleted. 
        After deletion the ISBN ${isbn} book is : `+ JSON.stringify(books[isbn], null, 4));
        } else{
            return res.status(400).send('The user has not reviewed this book');
            
        }
        
    }
    else {
        return res.status(404).json({message: `ISBN ${isbn} book is not found in the list`});
    }
    });

module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;
