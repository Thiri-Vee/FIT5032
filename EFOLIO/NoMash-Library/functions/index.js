const {onRequest} = require("firebase-functions/v2/https");
const admin = require("firebase-admin");
const cors = require("cors")({origin: true});

admin.initializeApp();
// EFOLIO 9.1 - Count Books
exports.countBooks = onRequest((req, res) => {
  cors(req, res, async () => {
    try {
      const booksCollection = await admin.firestore().collection("books");
      const snapshot = await booksCollection.get();
      const count = snapshot.size;
      res.status(200).json({count});
    } catch (error) {
      console.error("Error counting books:", error.message);
      res.status(500).send("Error counting books");
    }
  });
});
// EFOLIO 9.2 - Add and Capitalise Book
exports.addCapitalizedBook = onRequest((req, res) => {
  cors(req, res, async () => {
    try {
      const {isbn, name} = req.body;

      if (!isbn || !name) {
        return res.status(400).json({
          error: "ISBN and name are required",
        });
      }

      // Capitalise the book name using Firebase Function
      const capitalizedName = name.toUpperCase();

      // Add the processed book to Firestore
      const docRef = await admin.firestore().collection("books").add({
        isbn: Number(isbn),
        name: capitalizedName,
      });

      return res.status(200).json({
        message: "Book added successfully",
        id: docRef.id,
        isbn: Number(isbn),
        name: capitalizedName,
      });
    } catch (error) {
      console.error("Error adding book:", error.message);

      return res.status(500).json({
        error: "Error adding book",
      });
    }
  });
});
// EFOLIO 10.2 - Get All Books
exports.getAllBooks = onRequest((req, res) => {
  cors(req, res, async () => {
    try {
      const booksCollection = admin.firestore().collection("books");
      const snapshot = await booksCollection.get();

      const books = [];

      snapshot.forEach((doc) => {
        books.push({
          id: doc.id,
          ...doc.data(),
        });
      });

      return res.status(200).json(books);
    } catch (error) {
      console.error("Error fetching books:", error.message);

      return res.status(500).json({
        error: "Error fetching books",
      });
    }
  });
});
