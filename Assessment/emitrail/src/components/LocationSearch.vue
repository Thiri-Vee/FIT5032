
<script setup>
import {
  ref,
  computed,
  watch,
  nextTick,
  onBeforeUnmount,
  useId,
} from 'vue'

defineOptions({
  inheritAttrs: false,
})

const props = defineProps({
  modelValue: {
    type: String,
    default: '',
  },
  placeholder: {
    type: String,
    default: 'Search for a location',
  },
})

const emit = defineEmits([
  'update:modelValue',
  'select',
])

// -----------------------------------------
// Mapbox Search Box API
// -----------------------------------------

const mapboxToken = import.meta.env.VITE_MAPBOX_ACCESS_TOKEN

const suggestions = ref([])
const loading = ref(false)
const errorMessage = ref('')

const inputRef = ref(null)
const listboxRef = ref(null)
const activeIndex = ref(-1)

const componentId = useId()
const listboxId = `${componentId}-listbox`
const statusId = `${componentId}-status`

let debounceTimer = null
let abortController = null
let requestId = 0
let sessionToken = createSessionToken()
let selecting = false

function createSessionToken() {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID()
  }

  return `${Date.now()}-${Math.random().toString(36).slice(2)}`
}

const listOpen = computed(() => suggestions.value.length > 0)

const activeOptionId = computed(() => {
  if (!listOpen.value || activeIndex.value < 0) {
    return undefined
  }

  return `${componentId}-option-${activeIndex.value}`
})

// -----------------------------------------
// BR E.3 - Accessibility
// -----------------------------------------

function focusInput() {
  inputRef.value?.focus()
}

defineExpose({
  focus: focusInput,
})

function closeSuggestions() {
  suggestions.value = []
  activeIndex.value = -1
}

function cancelPendingSearch() {
  clearTimeout(debounceTimer)
  debounceTimer = null

  if (abortController) {
    abortController.abort()
    abortController = null
  }

  requestId++
}

// Automatically scroll to the highlighted option
watch(activeIndex, async (index) => {
  if (index < 0) return

  await nextTick()

  const listbox = listboxRef.value
  const option = listbox?.querySelector(
    `[data-option-index="${index}"]`,
  )

  if (!listbox || !option) return

  const optionTop = option.offsetTop
  const optionBottom = optionTop + option.offsetHeight

  if (optionTop < listbox.scrollTop) {
    listbox.scrollTop = optionTop
  } else if (
    optionBottom >
    listbox.scrollTop + listbox.clientHeight
  ) {
    listbox.scrollTop =
      optionBottom - listbox.clientHeight
  }
})

function handleKeydown(event) {
  if (event.key === 'Escape') {
    if (listOpen.value || loading.value) {
      event.preventDefault()
      cancelPendingSearch()
      closeSuggestions()
      loading.value = false
    }
    return
  }

  if (event.key === 'ArrowDown') {
    if (!listOpen.value) return

    event.preventDefault()

    activeIndex.value =
      activeIndex.value < suggestions.value.length - 1
        ? activeIndex.value + 1
        : 0

    return
  }

  if (event.key === 'ArrowUp') {
    if (!listOpen.value) return

    event.preventDefault()

    activeIndex.value =
      activeIndex.value > 0
        ? activeIndex.value - 1
        : suggestions.value.length - 1

    return
  }

  if (event.key === 'Enter') {
    if (!listOpen.value) return

    event.preventDefault()

    const index =
      activeIndex.value >= 0
        ? activeIndex.value
        : 0

    const suggestion = suggestions.value[index]

    if (suggestion) {
      selectLocation(suggestion)
    }
  }
}

// -----------------------------------------
// Mapbox suggestions
// -----------------------------------------

function getSuggestionName(suggestion) {
  return (
    suggestion.full_address ||
    suggestion.place_formatted ||
    suggestion.name ||
    suggestion.address ||
    'Unknown location'
  )
}

async function fetchSuggestions(query) {
  cancelPendingSearch()

  const currentRequest = requestId

  if (!query.trim()) {
    closeSuggestions()
    loading.value = false
    errorMessage.value = ''
    return
  }

  if (!mapboxToken) {
    errorMessage.value = 'Mapbox access token is missing.'
    closeSuggestions()
    return
  }

  loading.value = true
  errorMessage.value = ''

  const controller = new AbortController()
  abortController = controller

  try {
    const params = new URLSearchParams({
      q: query,
      access_token: mapboxToken,
      session_token: sessionToken,
      limit: '8',
      language: 'en',
    })

    const response = await fetch(
      `https://api.mapbox.com/search/searchbox/v1/suggest?${params.toString()}`,
      {
        signal: controller.signal,
      },
    )

    if (!response.ok) {
      throw new Error('Unable to load location suggestions.')
    }

    const data = await response.json()

    if (currentRequest !== requestId) return

    suggestions.value = Array.isArray(data.suggestions)
      ? data.suggestions
      : []

    activeIndex.value = -1
  } catch (error) {
    if (error.name === 'AbortError') return
    if (currentRequest !== requestId) return

    errorMessage.value =
      'Unable to search locations. Please try again.'

    closeSuggestions()
  } finally {
    if (currentRequest === requestId) {
      loading.value = false
      abortController = null
    }
  }
}

// -----------------------------------------
// Input changes
// -----------------------------------------

function handleInput(event) {
  const value = event.target.value

  selecting = false

  emit('update:modelValue', value)

  cancelPendingSearch()
  closeSuggestions()

  if (!value.trim()) {
    loading.value = false
    errorMessage.value = ''
    return
  }

  debounceTimer = setTimeout(() => {
    fetchSuggestions(value)
  }, 300)
}

watch(
  () => props.modelValue,
  (value) => {
    if (selecting) {
      selecting = false
      return
    }

    if (!value.trim()) {
      cancelPendingSearch()
      closeSuggestions()
    }
  },
)

// -----------------------------------------
// Retrieve selected location
// -----------------------------------------

async function selectLocation(suggestion) {
  if (!suggestion?.mapbox_id) return

  selecting = true

  cancelPendingSearch()
  closeSuggestions()

  const name = getSuggestionName(suggestion)

  emit('update:modelValue', name)

  loading.value = true
  errorMessage.value = ''

  const controller = new AbortController()
  abortController = controller

  const currentRequest = requestId

  try {
    const params = new URLSearchParams({
      access_token: mapboxToken,
      session_token: sessionToken,
    })

    const response = await fetch(
      `https://api.mapbox.com/search/searchbox/v1/retrieve/${encodeURIComponent(
        suggestion.mapbox_id,
      )}?${params.toString()}`,
      {
        signal: controller.signal,
      },
    )

    if (!response.ok) {
      throw new Error('Unable to retrieve selected location.')
    }

    const data = await response.json()

    if (currentRequest !== requestId) return

    const feature = data.features?.[0]

    const coordinates = feature?.geometry?.coordinates

    if (
      !Array.isArray(coordinates) ||
      coordinates.length < 2 ||
      !coordinates.every(Number.isFinite)
    ) {
      throw new Error('Selected location has invalid coordinates.')
    }

    emit('select', {
      name,
      coordinates,
    })

    sessionToken = createSessionToken()
  } catch (error) {
    if (error.name === 'AbortError') return
    if (currentRequest !== requestId) return

    errorMessage.value =
      'Unable to retrieve this location. Please choose another suggestion.'
  } finally {
    if (currentRequest === requestId) {
      loading.value = false
      abortController = null
    }
  }
}

function handleFocusOut(event) {
  if (
    event.relatedTarget &&
    event.currentTarget.contains(event.relatedTarget)
  ) {
    return
  }

  cancelPendingSearch()
  closeSuggestions()
  loading.value = false
}

onBeforeUnmount(() => {
  cancelPendingSearch()
})

// -----------------------------------------
// Screen-reader messages
// -----------------------------------------

const statusMessage = computed(() => {
  if (loading.value) {
    return 'Searching for locations.'
  }

  if (suggestions.value.length > 0) {
    return `${suggestions.value.length} location suggestions available. Use the up and down arrow keys to navigate and Enter to select.`
  }

  return ''
})
</script>

<template>
  <div
    class="location-search position-relative"
    @focusout="handleFocusOut"
  >
    <input
      v-bind="$attrs"
      ref="inputRef"
      type="text"
      class="form-control"
      :class="{
        'is-invalid': $attrs['aria-invalid'] === true ||
          $attrs['aria-invalid'] === 'true'
      }"
      :value="modelValue"
      :placeholder="placeholder"
      role="combobox"
      aria-autocomplete="list"
      :aria-expanded="listOpen"
      :aria-controls="listboxId"
      :aria-activedescendant="activeOptionId"
      :aria-describedby="[
        statusId,
        $attrs['aria-describedby']
      ].filter(Boolean).join(' ')"
      autocomplete="off"
      @input="handleInput"
      @keydown="handleKeydown"
    />

    <!-- Mapbox suggestions -->
    <div
      v-if="listOpen"
      :id="listboxId"
      ref="listboxRef"
      class="suggestions"
      role="listbox"
      :aria-label="`${placeholder} suggestions`"
    >
      <div
        v-for="(suggestion, index) in suggestions"
        :id="`${componentId}-option-${index}`"
        :key="suggestion.mapbox_id || index"
        class="suggestion-item"
        :class="{
          'suggestion-active': activeIndex === index
        }"
        :data-option-index="index"
        role="option"
        :aria-selected="activeIndex === index"
        @mousedown.prevent
        @click="selectLocation(suggestion)"
      >
        <span class="suggestion-name">
          {{ suggestion.name || getSuggestionName(suggestion) }}
        </span>

        <span
          v-if="suggestion.place_formatted"
          class="suggestion-description"
        >
          {{ suggestion.place_formatted }}
        </span>
      </div>
    </div>

    <!-- Loading indicator -->
    <p
      v-if="loading"
      class="small text-muted mt-1 mb-0"
      aria-hidden="true"
    >
      Searching locations...
    </p>

    <!-- Screen-reader status -->
    <span
      :id="statusId"
      class="visually-hidden"
      role="status"
      aria-live="polite"
      aria-atomic="true"
    >
      {{ statusMessage }}
    </span>

    <!-- Search errors -->
    <p
      v-if="errorMessage"
      class="small text-danger mt-1 mb-0"
      role="alert"
    >
      {{ errorMessage }}
    </p>
  </div>
</template>

<style scoped>
.location-search {
  width: 100%;
}

.form-control {
  min-height: 48px;
}

.suggestions {
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  z-index: 1000;

  max-height: 240px;
  overflow-y: auto;

  background-color: #ffffff;
  border: 1px solid #ced4da;
  border-radius: 8px;

  box-shadow: 0 6px 18px rgba(0, 0, 0, 0.15);
}

.suggestion-item {
  padding: 10px 12px;
  cursor: pointer;
  border-bottom: 1px solid #e5e7eb;
  color: #1f2937;
}

.suggestion-item:last-child {
  border-bottom: none;
}

.suggestion-item:hover,
.suggestion-active {
  background-color: #d1fae5;
  color: #064e3b;
}

.suggestion-name {
  display: block;
  font-weight: 600;
  font-size: 0.95rem;
}

.suggestion-description {
  display: block;
  font-size: 0.82rem;
  color: #4b5563;
  margin-top: 2px;
}

.form-control:focus-visible {
  outline: 3px solid #14532d;
  outline-offset: 2px;
}

.form-control.is-invalid {
  border-color: #b42318;
}

@media (max-width: 575.98px) {
  .suggestions {
    max-height: 200px;
  }
}
</style>
