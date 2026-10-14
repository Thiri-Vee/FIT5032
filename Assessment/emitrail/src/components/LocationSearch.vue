
<script setup>
import { ref, watch, onBeforeUnmount } from 'vue'

const props = defineProps({
  modelValue: { type: String, default: '' },
  placeholder: { type: String, default: 'Search for a location' },
})

const emit = defineEmits(['update:modelValue', 'select'])

const suggestions = ref([])
const loading = ref(false)
const error = ref('')
const selecting = ref(false)

let searchTimer = null
let controller = null
let requestId = 0

// One session ID groups search suggestions and selection.
// A fresh ID is created after a successful selection.
const createSessionId = () =>
  globalThis.crypto?.randomUUID?.() ??
  'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = Math.floor(Math.random() * 16)
    return (c === 'x' ? r : (r & 3) | 8).toString(16)
  })

let sessionToken = createSessionId()

const accessToken = import.meta.env.VITE_MAPBOX_ACCESS_TOKEN

watch(
  () => props.modelValue,
  (value) => {
    clearTimeout(searchTimer)
    controller?.abort()
    const id = ++requestId

    suggestions.value = []
    error.value = ''

    if (selecting.value) {
      selecting.value = false
      return
    }

    if (!value || value.trim().length < 3) {
      loading.value = false
      return
    }

    searchTimer = setTimeout(async () => {
      const activeController = new AbortController()
      controller = activeController
      loading.value = true

      try {
        const params = new URLSearchParams({
          q: value.trim(),
          access_token: accessToken,
          session_token: sessionToken,
          limit: '10',
          country: 'AU',
          language: 'en',
          proximity: '145.1340,-37.9105',
        })

        const response = await fetch(
          `https://api.mapbox.com/search/searchbox/v1/suggest?${params}`,
          { signal: activeController.signal },
        )

        if (!response.ok) {
          throw new Error(`Search request failed: ${response.status}`)
        }

        const data = await response.json()

        if (id !== requestId) return

        suggestions.value = data.suggestions || []
      } catch (err) {
        if (err.name !== 'AbortError' && id === requestId) {
          console.error('Mapbox search error:', err)
          error.value = 'Unable to search locations. Please try again.'
        }
      } finally {
        if (id === requestId) loading.value = false
      }
    }, 400)
  },
)

async function selectLocation(suggestion) {
  clearTimeout(searchTimer)
  controller?.abort()
  ++requestId

  suggestions.value = []
  error.value = ''
  loading.value = true

  try {
    const params = new URLSearchParams({
      access_token: accessToken,
      session_token: sessionToken,
    })

    const response = await fetch(
      `https://api.mapbox.com/search/searchbox/v1/retrieve/${encodeURIComponent(suggestion.mapbox_id)}?${params}`,
    )

    if (!response.ok) {
      throw new Error(`Retrieve request failed: ${response.status}`)
    }

    const data = await response.json()
    const feature = data.features?.[0]
    const coordinates = feature?.geometry?.coordinates

    if (!coordinates || coordinates.length < 2) {
      throw new Error('No coordinates returned for this location')
    }

    const locationName =
      feature.properties?.full_address ||
      feature.properties?.name ||
      suggestion.name

    selecting.value = true
    emit('update:modelValue', locationName)

    emit('select', {
      name: locationName,
      coordinates,
    })

    sessionToken = createSessionId()
  } catch (err) {
    console.error('Mapbox retrieve error:', err)
    error.value = 'Unable to select this location. Please try again.'
  } finally {
    loading.value = false
  }
}

onBeforeUnmount(() => {
  clearTimeout(searchTimer)
  controller?.abort()
  ++requestId
})
</script>

<template>
  <div class="location-search position-relative">
    <input
      type="text"
      class="form-control"
      :value="modelValue"
      :placeholder="placeholder"
      autocomplete="off"
      @input="emit('update:modelValue', $event.target.value)"
    />

    <div
      v-if="suggestions.length"
      class="list-group position-absolute w-100 shadow-sm suggestions"
    >
      <button
        v-for="suggestion in suggestions"
        :key="suggestion.mapbox_id"
        type="button"
        class="list-group-item list-group-item-action text-start"
        @click="selectLocation(suggestion)"
      >
        <strong>{{ suggestion.name }}</strong>
        <span
          v-if="suggestion.place_formatted"
          class="d-block small text-muted"
        >
          {{ suggestion.place_formatted }}
        </span>
      </button>
    </div>

    <p v-if="loading" class="small text-muted mt-1 mb-0">
      Searching locations...
    </p>

    <p v-if="error" class="small text-danger mt-1 mb-0">
      {{ error }}
    </p>
  </div>
</template>

<style scoped>
.suggestions {
  z-index: 1000;
  max-height: 240px;
  overflow-y: auto;
}

.location-search {
  width: 100%;
}
</style>
