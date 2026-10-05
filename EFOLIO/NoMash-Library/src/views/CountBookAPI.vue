<template>
  <pre>
    {{ jsondata }}
  </pre>
</template>

<script setup>
import axios from 'axios'
import { ref, onMounted } from 'vue'

const error = ref(null)
const jsondata = ref(null)

const getBookCountAPI = async () => {
  try {
    const response = await axios.get(
      'https://countbooks-ckwxabn72a-uc.a.run.app'
    )

    jsondata.value = JSON.stringify(response.data, null, 2)
    error.value = null
  } catch (err) {
    error.value = 'Error fetching book count'
    jsondata.value = null
  }
}

onMounted(() => {
  getBookCountAPI()
})
</script>