
<script setup>
import { onMounted, onBeforeUnmount, ref, watch } from 'vue'
import mapboxgl from 'mapbox-gl'
import 'mapbox-gl/dist/mapbox-gl.css'

const props = defineProps({
  startCoordinates: {
    type: Array,
    default: null,
  },
  destinationCoordinates: {
    type: Array,
    default: null,
  },
})

const emit = defineEmits(['routes-calculated', 'route-error'])

const mapContainer = ref(null)
const loading = ref(false)
const error = ref('')
const selectedMode = ref('driving')
const routeResults = ref({})

mapboxgl.accessToken = import.meta.env.VITE_MAPBOX_ACCESS_TOKEN

const modes = [
  { id: 'walking', label: 'Walking', color: '#198754' },
  { id: 'cycling', label: 'Cycling', color: '#2563eb' },
  { id: 'driving', label: 'Driving', color: '#dc3545' },
]

let map = null
let startMarker = null
let destinationMarker = null
let requestController = null
let requestId = 0

function validCoordinates(value) {
  return (
    Array.isArray(value) &&
    value.length >= 2 &&
    value.slice(0, 2).every(Number.isFinite)
  )
}

function clearMap() {
  if (!map) return

  if (map.getLayer('journey-route')) {
    map.removeLayer('journey-route')
  }

  if (map.getSource('journey-route')) {
    map.removeSource('journey-route')
  }

  startMarker?.remove()
  destinationMarker?.remove()

  startMarker = null
  destinationMarker = null
}

function showSelectedRoute() {
  if (!map || !map.isStyleLoaded()) return

  clearMap()

  const route = routeResults.value[selectedMode.value]

  if (!route?.geometry) return

  map.addSource('journey-route', {
    type: 'geojson',
    data: {
      type: 'Feature',
      properties: {},
      geometry: route.geometry,
    },
  })

  const mode = modes.find((item) => item.id === selectedMode.value)

  map.addLayer({
    id: 'journey-route',
    type: 'line',
    source: 'journey-route',
    layout: {
      'line-join': 'round',
      'line-cap': 'round',
    },
    paint: {
      'line-color': mode?.color || '#198754',
      'line-width': 5,
    },
  })

  startMarker = new mapboxgl.Marker({ color: '#198754' })
    .setLngLat(props.startCoordinates)
    .addTo(map)

  destinationMarker = new mapboxgl.Marker({ color: '#dc3545' })
    .setLngLat(props.destinationCoordinates)
    .addTo(map)

  const bounds = new mapboxgl.LngLatBounds()

  route.geometry.coordinates.forEach((coordinate) => {
    bounds.extend(coordinate)
  })

  map.fitBounds(bounds, {
    padding: 45,
    maxZoom: 15,
  })
}

async function calculateRoutes() {
  requestController?.abort()
  const id = ++requestId

  clearMap()
  routeResults.value = {}
  error.value = ''

  if (
    !map ||
    !map.isStyleLoaded() ||
    !validCoordinates(props.startCoordinates) ||
    !validCoordinates(props.destinationCoordinates)
  ) {
    loading.value = false
    return
  }

  const controller = new AbortController()
  requestController = controller
  loading.value = true

  try {
    const start = props.startCoordinates.slice(0, 2).join(',')
    const destination = props.destinationCoordinates.slice(0, 2).join(',')

    const results = await Promise.allSettled(
      modes.map(async (mode) => {
        const params = new URLSearchParams({
          access_token: mapboxgl.accessToken,
          geometries: 'geojson',
          overview: 'full',
        })

        const url =
          `https://api.mapbox.com/directions/v5/mapbox/` +
          `${mode.id}/${start};${destination}?${params}`

        const response = await fetch(url, {
          signal: controller.signal,
        })

        if (!response.ok) {
          throw new Error(`${mode.label}: HTTP ${response.status}`)
        }

        const data = await response.json()
        const route = data.routes?.[0]

        if (!route?.geometry) {
          throw new Error(`${mode.label}: no route available`)
        }

        return {
          mode: mode.id,
          distanceKm: Number((route.distance / 1000).toFixed(2)),
          durationMinutes: Math.round(route.duration / 60),
          geometry: route.geometry,
        }
      }),
    )

    if (controller.signal.aborted || id !== requestId) return

    const successfulRoutes = {}
    const failures = []

    results.forEach((result, index) => {
      if (result.status === 'fulfilled') {
        successfulRoutes[result.value.mode] = result.value
      } else {
        failures.push(modes[index].label)
        console.error('Route request failed:', result.reason)
      }
    })

    routeResults.value = successfulRoutes

    if (Object.keys(successfulRoutes).length === 0) {
      throw new Error('No routes could be calculated.')
    }

    if (!successfulRoutes[selectedMode.value]) {
      selectedMode.value = Object.keys(successfulRoutes)[0]
    }

    showSelectedRoute()

    emit('routes-calculated', {
      walking: successfulRoutes.walking
        ? {
            distanceKm: successfulRoutes.walking.distanceKm,
            durationMinutes: successfulRoutes.walking.durationMinutes,
          }
        : null,
      cycling: successfulRoutes.cycling
        ? {
            distanceKm: successfulRoutes.cycling.distanceKm,
            durationMinutes: successfulRoutes.cycling.durationMinutes,
          }
        : null,
      driving: successfulRoutes.driving
        ? {
            distanceKm: successfulRoutes.driving.distanceKm,
            durationMinutes: successfulRoutes.driving.durationMinutes,
          }
        : null,
    })

    if (failures.length) {
      error.value =
        `Routes unavailable for: ${failures.join(', ')}.`
    }
  } catch (err) {
    if (err.name !== 'AbortError' && id === requestId) {
      console.error('Mapbox routing error:', err)
      error.value = 'Unable to calculate routes for these locations.'
      emit('route-error', error.value)
    }
  } finally {
    if (id === requestId) {
      loading.value = false
    }
  }
}

function selectMode(mode) {
  if (!routeResults.value[mode]) return

  selectedMode.value = mode
  showSelectedRoute()
}

onMounted(() => {
  map = new mapboxgl.Map({
    container: mapContainer.value,
    style: 'mapbox://styles/mapbox/streets-v12',
    center: [144.9631, -37.8136],
    zoom: 10,
  })

  map.addControl(new mapboxgl.NavigationControl(), 'top-right')

  map.on('load', calculateRoutes)
})

watch(
  () => [props.startCoordinates, props.destinationCoordinates],
  () => {
    requestController?.abort()
    ++requestId
    routeResults.value = {}
    clearMap()
    emit('routes-calculated', {
      walking: null,
      cycling: null,
      driving: null,
    })

    if (map?.isStyleLoaded()) {
      calculateRoutes()
    }
  },
)

onBeforeUnmount(() => {
  requestController?.abort()
  ++requestId
  clearMap()
  map?.remove()
  map = null
})
</script>

<template>
  <div class="route-map-wrapper">
    <div class="d-flex flex-wrap gap-2 mb-3">
      <button
        v-for="mode in modes"
        :key="mode.id"
        type="button"
        class="btn btn-sm"
        :class="
          selectedMode === mode.id
            ? 'btn-dark'
            : 'btn-outline-dark'
        "
        :disabled="!routeResults[mode.id] || loading"
        @click="selectMode(mode.id)"
      >
        {{ mode.label }}
      </button>
    </div>

    <div ref="mapContainer" class="route-map"></div>

    <p v-if="loading" class="small text-muted mt-2">
      Calculating walking, cycling and driving routes...
    </p>

    <p v-if="error" class="small text-danger mt-2">
      {{ error }}
    </p>

    <div
      v-if="Object.keys(routeResults).length"
      class="row g-2 mt-2"
    >
      <div
        v-for="mode in modes"
        :key="mode.id"
        class="col-12 col-md-4"
      >
        <div class="border rounded p-3 h-100">
          <strong>{{ mode.label }}</strong>

          <template v-if="routeResults[mode.id]">
            <p class="mb-1 mt-2">
              {{ routeResults[mode.id].distanceKm }} km
            </p>

            <p class="small text-muted mb-0">
              Estimated:
              {{ routeResults[mode.id].durationMinutes }} min
            </p>
          </template>

          <p v-else class="small text-muted mt-2 mb-0">
            Route unavailable
          </p>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.route-map {
  width: 100%;
  height: 350px;
  border-radius: 8px;
}

@media (max-width: 575.98px) {
  .route-map {
    height: 280px;
  }
}
</style>
