const express = require('express');

const app = express();
const PORT = 3000;

app.use(express.json());

// In-memory book data
let books = [
  {
    id: 1,
    title: 'The Great Gatsby',
    author: 'F. Scott Fitzgerald',
    isbn: '9780743273565'
  },
  {
    id: 2,
    title: '1984',
    author: 'George Orwell',
    isbn: '9780451524935'
  }
];

// Basic validation
function validateBook(book) {
  if (!book.title || !book.author || !book.isbn) {
    return 'Title, author and ISBN are required.';
  }

  if (
    typeof book.title !== 'string' ||
    typeof book.author !== 'string' ||
    typeof book.isbn !== 'string'
  ) {
    return 'Title, author and ISBN must be strings.';
  }

  return null;
}

// GET all books
app.get('/api/books', (req, res) => {
  res.status(200).json(books);
});

// GET a book by ID
app.get('/api/books/:id', (req, res) => {
  const id = Number(req.params.id);
  const book = books.find((book) => book.id === id);

  if (!book) {
    return res.status(404).json({
      error: 'Book not found'
    });
  }

  res.status(200).json(book);
});

// POST a new book
app.post('/api/books', (req, res) => {
  const validationError = validateBook(req.body);

  if (validationError) {
    return res.status(400).json({
      error: validationError
    });
  }

  const duplicateBook = books.find(
    (book) => book.isbn === req.body.isbn
  );

  if (duplicateBook) {
    return res.status(409).json({
      error: 'A book with this ISBN already exists.'
    });
  }

  const newBook = {
    id:
      books.length > 0
        ? Math.max(...books.map((book) => book.id)) + 1
        : 1,
    title: req.body.title,
    author: req.body.author,
    isbn: req.body.isbn
  };

  books.push(newBook);

  res.status(201).json(newBook);
});

// PUT an existing book
app.put('/api/books/:id', (req, res) => {
  const id = Number(req.params.id);
  const bookIndex = books.findIndex((book) => book.id === id);

  if (bookIndex === -1) {
    return res.status(404).json({
      error: 'Book not found'
    });
  }

  const validationError = validateBook(req.body);

  if (validationError) {
    return res.status(400).json({
      error: validationError
    });
  }

  const duplicateBook = books.find(
    (book) => book.isbn === req.body.isbn && book.id !== id
  );

  if (duplicateBook) {
    return res.status(409).json({
      error: 'A book with this ISBN already exists.'
    });
  }

  const updatedBook = {
    id: id,
    title: req.body.title,
    author: req.body.author,
    isbn: req.body.isbn
  };

  books[bookIndex] = updatedBook;

  res.status(200).json(updatedBook);
});

// DELETE a book
app.delete('/api/books/:id', (req, res) => {
  const id = Number(req.params.id);
  const bookIndex = books.findIndex((book) => book.id === id);

  if (bookIndex === -1) {
    return res.status(404).json({
      error: 'Book not found'
    });
  }

  books.splice(bookIndex, 1);

  res.status(204).send();
});

// Handle unexpected server errors
app.use((err, req, res, next) => {
  console.error(err);

  res.status(500).json({
    error: 'Internal server error'
  });
});

app.listen(PORT, () => {
  console.log(`Library API running at http://localhost:${PORT}`);
});