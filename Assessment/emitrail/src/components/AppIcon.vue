<script setup>
// Icon name and size are passed from other pages
defineProps({
  name: {
    type: String,
    required: true,
  },

  size: {
    type: [Number, String],
    default: 24,
  },
})
</script>

<template>
  <svg
    :width="size"
    :height="size"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    stroke-width="1.7"
    stroke-linecap="round"
    stroke-linejoin="round"
    aria-hidden="true"
  >
    <!-- Walking icon -->
    <template v-if="name === 'walk'">
      <circle cx="13" cy="4.5" r="2" />
      <path d="M13 6.8v4.2l-1.6 3" />
      <path d="M11.4 14 14 17.4l-1 3.6" />
      <path d="M11.4 14 8.4 16.4 7.8 20.4" />
      <path d="M12.4 8 15.6 10.2" />
      <path d="M12.7 9.6 9.4 11.2" />
    </template>

    <!-- Bike icon -->
    <template v-else-if="name === 'bike'">
      <circle cx="5.5" cy="17" r="3.5" />
      <circle cx="18.5" cy="17" r="3.5" />
      <path d="M6 17h6l3.5-7H12" />
      <path d="M9.5 6.5H13l3.5 7" />
    </template>

    <!-- Bus icon -->
    <template v-else-if="name === 'bus'">
      <rect x="4" y="4" width="16" height="13" rx="2.5" />
      <path d="M4 12h16" />
      <path d="M8 4v8M16 4v8" />
      <path d="M7 21v-3M17 21v-3" />
    </template>

    <!-- Car icon -->
    <template v-else-if="name === 'car'">
      <path d="M5 12.5 6.6 8A2.5 2.5 0 0 1 9 6.3h6A2.5 2.5 0 0 1 17.4 8L19 12.5" />
      <path
        d="M4 12.5h16v4.5a1 1 0 0 1-1 1h-1.5a1 1 0 0 1-1-1v-1H7.5v1a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1z"
      />
      <circle cx="7.5" cy="15" r="0.6" />
      <circle cx="16.5" cy="15" r="0.6" />
    </template>

    <!-- Leaf icon -->
    <template v-else-if="name === 'leaf'">
      <path
        d="M11 20.5A7.5 7.5 0 0 1 9.5 6C15 5 17 4.5 19.5 2c1 2.5 1.5 5 1.5 8 0 6-4.5 10.5-10 10.5z"
      />
      <path d="M3 21c0-3.5 2-6.5 6-8" />
    </template>

    <!-- Chart icon -->
    <template v-else-if="name === 'chart'">
      <path d="M4 20V4" />
      <path d="M4 20h16" />
      <rect x="7" y="12" width="3" height="5" />
      <rect x="12.5" y="8" width="3" height="9" />
      <rect x="18" y="5" width="3" height="12" />
    </template>

    <!-- Trending icon -->
    <template v-else-if="name === 'trending'">
      <polyline points="3 17 9.5 10.5 13.5 14.5 21 7" />
      <polyline points="15 7 21 7 21 13" />
    </template>

    <!-- Map icon -->
    <template v-else-if="name === 'map'">
      <path d="M9 3 3.5 5.2v15.5L9 18.5l6 2.3 5.5-2.2V3L15 5.3z" />
      <path d="M9 3v15.5M15 5.3v15.5" />
    </template>

    <!-- Route icon -->
    <template v-else-if="name === 'route'">
      <circle cx="6" cy="18.5" r="2.3" />
      <circle cx="18" cy="5.5" r="2.3" />
      <path d="M8.3 18.5H15a3.5 3.5 0 0 0 0-7H9a3.5 3.5 0 0 1 0-7h.7" />
    </template>

    <!-- Award icon -->
    <template v-else-if="name === 'award'">
      <circle cx="12" cy="9" r="6" />
      <polyline points="8.5 14 7 22 12 19 17 22 15.5 14" />
    </template>

    <!-- Star icon -->
    <template v-else-if="name === 'star'">
      <polygon
        points="12 3 14.6 8.6 20.5 9.4 16 13.5 17.2 19.5 12 16.5 6.8 19.5 8 13.5 3.5 9.4 9.4 8.6"
      />
    </template>

    <!-- Download icon -->
    <template v-else-if="name === 'download'">
      <path d="M4 15.5V19a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-3.5" />
      <polyline points="8 10.5 12 14.5 16 10.5" />
      <line x1="12" y1="3" x2="12" y2="14.5" />
    </template>

    <!-- Users icon -->
    <template v-else-if="name === 'users'">
      <path d="M16 20v-1.5a4 4 0 0 0-4-4H7a4 4 0 0 0-4 4V20" />
      <circle cx="9.5" cy="7.5" r="3.5" />
      <path d="M21 20v-1.5a4 4 0 0 0-3-3.85" />
      <path d="M15.5 4.15a3.5 3.5 0 0 1 0 6.7" />
    </template>

    <!-- Clock icon -->
    <template v-else-if="name === 'clock'">
      <circle cx="12" cy="12" r="9" />
      <polyline points="12 6.5 12 12 16 14" />
    </template>

    <!-- Shield icon -->
    <template v-else-if="name === 'shield'">
      <path d="M12 22s7.5-3.8 7.5-9.5V5.2L12 2.5 4.5 5.2v7.3C4.5 18.2 12 22 12 22z" />
      <polyline points="9 12 11 14 15.5 9.5" />
    </template>

    <!-- Check icon -->
    <template v-else-if="name === 'check'">
      <polyline points="20 6.5 9.5 17.5 4 12" />
    </template>

    <!-- Arrow icon -->
    <template v-else-if="name === 'arrow'">
      <line x1="4" y1="12" x2="19" y2="12" />
      <polyline points="12 5 19 12 12 19" />
    </template>

    <!-- Spark icon -->
    <template v-else-if="name === 'spark'">
      <path
        d="M12 3v4M12 17v4M3 12h4M17 12h4M6 6l2.5 2.5M15.5 15.5 18 18M18 6l-2.5 2.5M8.5 15.5 6 18"
      />
    </template>

    <!-- Heart icon -->
    <template v-else-if="name === 'heart'">
      <path d="M12 20s-7-4.3-7-9.5A4.5 4.5 0 0 1 12 7a4.5 4.5 0 0 1 7 3.5C19 15.7 12 20 12 20z" />
    </template>
  </svg>
</template>
