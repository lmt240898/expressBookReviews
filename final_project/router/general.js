const express = require('express');
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();
const axios = require('axios'); // Add axios dependency

public_users.post("/register", (req, res) => {
  const { username, password } = req.body;
  
  if (!username || !password) {
    return res.status(400).json({message: "Username and password are required"});
  }
  
  if (!isValid(username)) {
    return res.status(400).json({message: "Invalid username"});
  }
  
  // Check if user already exists
  if (users.find(user => user.username === username)) {
    return res.status(409).json({message: "Username already exists"});
  }
  
  users.push({username, password});
  return res.status(201).json({message: "User registered successfully"});
});

// Get the book list available in the shop
public_users.get('/', function (req, res) {
  return res.status(200).json(books);
});

// Get the book list available in the shop (using Promises)
public_users.get('/books-promise', function (req, res) {
  // Simulate fetching data with a Promise
  const fetchBooks = new Promise((resolve, reject) => {
    setTimeout(() => {
      if (books) {
        resolve(books);
      } else {
        reject("No books available");
      }
    }, 500); // Simulate network delay
  });

  fetchBooks
    .then(booksList => {
      return res.status(200).json(booksList);
    })
    .catch(error => {
      return res.status(500).json({ message: error });
    });
});

// Get the book list available in the shop (using async/await)
public_users.get('/books-async', async function (req, res) {
  try {
    // Simulate an async API call
    const fetchBooks = () => {
      return new Promise((resolve, reject) => {
        setTimeout(() => {
          if (books) {
            resolve(books);
          } else {
            reject("No books available");
          }
        }, 500); // Simulate network delay
      });
    };

    // Using async/await to handle the Promise
    const booksList = await fetchBooks();
    return res.status(200).json(booksList);
  } catch (error) {
    return res.status(500).json({ message: error });
  }
});

// Simulated external API call to get books (using axios)
public_users.get('/books-axios', async function (req, res) {
  try {
    // In a real-world scenario, this would be an actual API endpoint
    // For this example, we'll simulate it by creating a mock response
    
    // Mock function to simulate axios call
    const mockAxiosGet = async () => {
      return new Promise((resolve) => {
        setTimeout(() => {
          resolve({ data: books });
        }, 500);
      });
    };
    
    // Using axios-like syntax with our mock function
    const response = await mockAxiosGet();
    return res.status(200).json(response.data);
  } catch (error) {
    return res.status(500).json({ 
      message: "Error fetching books", 
      error: error.message 
    });
  }
});

// Get book details based on ISBN
public_users.get('/isbn/:isbn', function (req, res) {
  const isbn = req.params.isbn;
  
  if (books[isbn]) {
    return res.status(200).json(books[isbn]);
  } else {
    return res.status(404).json({message: "Book not found"});
  }
});

// Get book details based on ISBN using Axios with Promise callbacks
public_users.get('/isbn-promise/:isbn', function (req, res) {
  const isbn = req.params.isbn;
  const host = req.get('host');
  const protocol = req.protocol;
  
  // Make a request to our own API endpoint for book details
  axios.get(`${protocol}://${host}/isbn/${isbn}`)
    .then(response => {
      return res.status(200).json(response.data);
    })
    .catch(error => {
      if (error.response && error.response.status === 404) {
        return res.status(404).json({message: "Book not found"});
      }
      return res.status(500).json({ 
        message: "Error fetching book details", 
        error: error.message 
      });
    });
});

// Get book details based on ISBN using Axios with async/await
public_users.get('/isbn-async/:isbn', async function (req, res) {
  try {
    const isbn = req.params.isbn;
    const host = req.get('host');
    const protocol = req.protocol;
    
    // Make a request to our own API endpoint for book details using async/await
    const response = await axios.get(`${protocol}://${host}/isbn/${isbn}`);
    return res.status(200).json(response.data);
  } catch (error) {
    if (error.response && error.response.status === 404) {
      return res.status(404).json({message: "Book not found"});
    }
    return res.status(500).json({ 
      message: "Error fetching book details", 
      error: error.message 
    });
  }
});

// Get book details based on author
public_users.get('/author/:author', function (req, res) {
  const author = req.params.author;
  const booksByAuthor = Object.values(books).filter(book => 
    book.author.toLowerCase() === author.toLowerCase()
  );
  
  if (booksByAuthor.length > 0) {
    return res.status(200).json(booksByAuthor);
  } else {
    return res.status(404).json({message: "No books found by this author"});
  }
});

// Get book details based on author using Axios with Promise callbacks
public_users.get('/author-promise/:author', function (req, res) {
  const author = req.params.author;
  const host = req.get('host');
  const protocol = req.protocol;
  
  // Make a request to our own API endpoint for books by author
  axios.get(`${protocol}://${host}/author/${author}`)
    .then(response => {
      return res.status(200).json(response.data);
    })
    .catch(error => {
      if (error.response && error.response.status === 404) {
        return res.status(404).json({message: "No books found by this author"});
      }
      return res.status(500).json({ 
        message: "Error fetching books by author", 
        error: error.message 
      });
    });
});

// Get book details based on author using Axios with async/await
public_users.get('/author-async/:author', async function (req, res) {
  try {
    const author = req.params.author;
    const host = req.get('host');
    const protocol = req.protocol;
    
    // Make a request to our own API endpoint for books by author using async/await
    const response = await axios.get(`${protocol}://${host}/author/${author}`);
    return res.status(200).json(response.data);
  } catch (error) {
    if (error.response && error.response.status === 404) {
      return res.status(404).json({message: "No books found by this author"});
    }
    return res.status(500).json({ 
      message: "Error fetching books by author", 
      error: error.message 
    });
  }
});

// Get all books based on title
public_users.get('/title/:title', function (req, res) {
  const title = req.params.title;
  const booksByTitle = Object.values(books).filter(book => 
    book.title.toLowerCase().includes(title.toLowerCase())
  );
  
  if (booksByTitle.length > 0) {
    return res.status(200).json(booksByTitle);
  } else {
    return res.status(404).json({message: "No books found with this title"});
  }
});

// Get books based on title using Axios with Promise callbacks
public_users.get('/title-promise/:title', function (req, res) {
  const title = req.params.title;
  const host = req.get('host');
  const protocol = req.protocol;
  
  // Make a request to our own API endpoint for books by title
  axios.get(`${protocol}://${host}/title/${title}`)
    .then(response => {
      return res.status(200).json(response.data);
    })
    .catch(error => {
      if (error.response && error.response.status === 404) {
        return res.status(404).json({message: "No books found with this title"});
      }
      return res.status(500).json({ 
        message: "Error fetching books by title", 
        error: error.message 
      });
    });
});

// Get books based on title using Axios with async/await
public_users.get('/title-async/:title', async function (req, res) {
  try {
    const title = req.params.title;
    const host = req.get('host');
    const protocol = req.protocol;
    
    // Make a request to our own API endpoint for books by title using async/await
    const response = await axios.get(`${protocol}://${host}/title/${title}`);
    return res.status(200).json(response.data);
  } catch (error) {
    if (error.response && error.response.status === 404) {
      return res.status(404).json({message: "No books found with this title"});
    }
    return res.status(500).json({ 
      message: "Error fetching books by title", 
      error: error.message 
    });
  }
});

// Get book review
public_users.get('/review/:isbn', function (req, res) {
  const isbn = req.params.isbn;
  
  if (!books[isbn]) {
    return res.status(404).json({message: "Book not found"});
  }
  
  return res.status(200).json(books[isbn].reviews);
});

// Search by any criteria
public_users.get('/search', function (req, res) {
  const { isbn, title, author } = req.query;
  let results = Object.entries(books).map(([key, value]) => ({isbn: key, ...value}));
  
  if (isbn) {
    results = results.filter(book => book.isbn === isbn);
  }
  if (title) {
    results = results.filter(book => book.title.toLowerCase().includes(title.toLowerCase()));
  }
  if (author) {
    results = results.filter(book => book.author.toLowerCase().includes(author.toLowerCase()));
  }
  
  return res.status(200).json(results);
});

module.exports.general = public_users;
