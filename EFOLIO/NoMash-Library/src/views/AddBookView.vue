<template>
  <div>
    <h1>Add Book</h1>

    <form @submit.prevent="addBook">
      <div>
        <label for="isbn">ISBN:</label>
        <input type="text" v-model="isbn" id="isbn" required />
      </div>

      <div>
        <label for="name">Name:</label>
        <input type="text" v-model="name" id="name" required />
      </div>

      <button type="submit">Add Book</button>
    </form>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import axios from 'axios'

const isbn = ref('')
const name = ref('')

const addBook = async () => {
  try {
    const isbnNumber = Number(isbn.value)

    if (isNaN(isbnNumber)) {
      alert('Please enter a valid ISBN number.')
      return
    }

    // Send the book to the Firebase Function
    const response = await axios.post(
      'https://us-central1-fit5032-ba823.cloudfunctions.net/addCapitalizedBook',
      {
        isbn: isbnNumber,
        name: name.value
      }
    )

    console.log('Function response:', response.data)

    isbn.value = ''
    name.value = ''

    alert('Book added and capitalized successfully!')
  } catch (error) {
    console.error('Error adding book:', error)
    alert('Error adding book.')
  }
}
</script>