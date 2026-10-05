<template>
  <div id="app">
    <h1>Book Count</h1>
    <button @click="getBookCount">Get Book Count</button>
    <p v-if="count !== null">Total number of books: {{ count }}</p>
    <p v-if="error">{{ error }}</p>
  </div>
</template>

<script setup>
import axios from 'axios'
import { ref, onMounted } from 'vue';

//const count = ref(null)
const error = ref(null)
const jsondata = ref(null);

onMounted(() => {
  getBookCountAPI();
});

const getBookCount = async () => {
  try {
    const response = await axios.get('https://countbooks-ckwxabn72a-uc.a.run.app');
    jsondata.value = JSON.stringify(response.data,null,2);
    //count.value = response.data.count
    error.value = null;
  } catch (err) {
    error.value = 'Error fetching book count';
    jsondata.value = null;
    //count.value = null;
  }
};
</script>
