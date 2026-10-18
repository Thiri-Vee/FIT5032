
<script setup>
import { computed, ref, watch, useId } from 'vue'

const props = defineProps({
  rows: {
    type: Array,
    default: () => [],
  },
  columns: {
    type: Array,
    required: true,
  },
})

const search = ref('')
const filters = ref({})
const sortKey = ref('')
const sortDirection = ref('asc')
const currentPage = ref(1)

const pageSize = 10

// BR E.3 - Unique IDs for accessible labels
const tableId = useId()
const searchId = `${tableId}-search`
const tableCaptionId = `${tableId}-caption`
const resultStatusId = `${tableId}-results`

const filteredRows = computed(() => {
  const keyword = search.value.trim().toLowerCase()

  return props.rows.filter((row) => {
    const matchesSearch =
      !keyword ||
      props.columns.some((column) =>
        String(row[column.key] ?? '')
          .toLowerCase()
          .includes(keyword),
      )

    const matchesFilters = props.columns.every((column) => {
      const filterValue = String(
        filters.value[column.key] ?? '',
      )
        .trim()
        .toLowerCase()

      return (
        !filterValue ||
        String(row[column.key] ?? '')
          .toLowerCase()
          .includes(filterValue)
      )
    })

    return matchesSearch && matchesFilters
  })
})

const sortedRows = computed(() => {
  if (!sortKey.value) return filteredRows.value

  return [...filteredRows.value].sort((a, b) => {
    const first = a[sortKey.value]
    const second = b[sortKey.value]

    const comparison =
      typeof first === 'number' &&
      typeof second === 'number'
        ? first - second
        : String(first ?? '').localeCompare(
            String(second ?? ''),
            undefined,
            { numeric: true },
          )

    return sortDirection.value === 'asc'
      ? comparison
      : -comparison
  })
})

const totalPages = computed(() =>
  Math.max(1, Math.ceil(sortedRows.value.length / pageSize)),
)

const paginatedRows = computed(() => {
  const start = (currentPage.value - 1) * pageSize
  return sortedRows.value.slice(start, start + pageSize)
})

const firstVisibleRecord = computed(() =>
  sortedRows.value.length === 0
    ? 0
    : (currentPage.value - 1) * pageSize + 1,
)

const lastVisibleRecord = computed(() =>
  Math.min(currentPage.value * pageSize, sortedRows.value.length),
)

// Screen-reader announcements
const resultAnnouncement = computed(() => {
  const count = sortedRows.value.length

  if (count === 0) {
    return 'No matching records found.'
  }

  return `Showing records ${firstVisibleRecord.value} to ${lastVisibleRecord.value} of ${count}. Page ${currentPage.value} of ${totalPages.value}.`
})

const sortAnnouncement = computed(() => {
  if (!sortKey.value) {
    return ''
  }

  const column = props.columns.find(
    (item) => item.key === sortKey.value,
  )

  const label = column?.label ?? sortKey.value

  return `Sorted by ${label}, ${
    sortDirection.value === 'asc' ? 'ascending' : 'descending'
  }.`
})

function sortBy(key) {
  if (sortKey.value === key) {
    sortDirection.value =
      sortDirection.value === 'asc' ? 'desc' : 'asc'
  } else {
    sortKey.value = key
    sortDirection.value = 'asc'
  }
}

function getSortState(key) {
  if (sortKey.value !== key) {
    return 'none'
  }

  return sortDirection.value === 'asc'
    ? 'ascending'
    : 'descending'
}

function getSortButtonLabel(column) {
  if (sortKey.value !== column.key) {
    return `Sort by ${column.label}, ascending`
  }

  return `Sort by ${column.label}, ${
    sortDirection.value === 'asc'
      ? 'descending'
      : 'ascending'
  }`
}

function previousPage() {
  if (currentPage.value > 1) {
    currentPage.value--
  }
}

function nextPage() {
  if (currentPage.value < totalPages.value) {
    currentPage.value++
  }
}

// Reset pagination when search, filters or sorting change
watch(
  [search, filters, sortKey, sortDirection],
  () => {
    currentPage.value = 1
  },
  { deep: true },
)

// Keep current page valid if data changes
watch(totalPages, (pages) => {
  if (currentPage.value > pages) {
    currentPage.value = pages
  }
})
</script>

<template>
  <div class="interactive-table">

    <!-- BR E.3 - Accessible search -->
    <div class="mb-3">
      <label
        :for="searchId"
        class="form-label fw-semibold"
      >
        Search all records
      </label>

      <input
        :id="searchId"
        v-model="search"
        type="search"
        class="form-control"
        placeholder="Search..."
        :aria-describedby="resultStatusId"
      />
    </div>

    <!-- BR E.3 - Screen-reader announcements -->
    <div class="visually-hidden">
      <p
        :id="resultStatusId"
        role="status"
        aria-live="polite"
        aria-atomic="true"
      >
        {{ resultAnnouncement }}
      </p>

      <p
        role="status"
        aria-live="polite"
        aria-atomic="true"
      >
        {{ sortAnnouncement }}
      </p>
    </div>

    <!-- Interactive data table -->
    <div
      class="table-responsive"
      role="region"
      aria-label="Travel history data table"
      tabindex="0"
    >
      <table class="table table-striped table-hover align-middle">

        <!-- BR E.3 - Accessible table caption -->
        <caption
          :id="tableCaptionId"
          class="visually-hidden"
        >
          Travel records. Use the column heading buttons
          to sort the table. Use the search fields
          to filter records.
        </caption>

        <thead>
          <!-- Sorting row -->
          <tr>
            <th
              v-for="column in columns"
              :key="column.key"
              scope="col"
              :aria-sort="getSortState(column.key)"
            >
              <button
                type="button"
                class="btn btn-link text-dark text-decoration-none fw-bold p-0 sort-button"
                :aria-label="getSortButtonLabel(column)"
                @click="sortBy(column.key)"
              >
                <span>{{ column.label }}</span>

                <span
                  class="sort-icon"
                  aria-hidden="true"
                >
                  <template v-if="sortKey === column.key">
                    {{ sortDirection === 'asc' ? '▲' : '▼' }}
                  </template>

                  <template v-else>
                    ↕
                  </template>
                </span>
              </button>
            </th>
          </tr>

          <!-- Column filters -->
          <tr>
            <th
              v-for="column in columns"
              :key="column.key"
              scope="col"
            >
              <label
                :for="`${tableId}-filter-${column.key}`"
                class="visually-hidden"
              >
                Filter {{ column.label }}
              </label>

              <input
                :id="`${tableId}-filter-${column.key}`"
                v-model="filters[column.key]"
                type="search"
                class="form-control form-control-sm"
                :placeholder="`Filter ${column.label}`"
                :aria-describedby="resultStatusId"
              />
            </th>
          </tr>
        </thead>

        <tbody>
          <tr
            v-for="(row, index) in paginatedRows"
            :key="row.id ?? index"
          >
            <td
              v-for="column in columns"
              :key="column.key"
            >
              {{ row[column.key] }}
            </td>
          </tr>

          <!-- Empty state -->
          <tr v-if="paginatedRows.length === 0">
            <td
              :colspan="columns.length"
              class="text-center text-muted py-4"
            >
              No matching records found.
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Pagination -->
    <nav
      class="d-flex flex-wrap justify-content-between align-items-center gap-3 mt-3"
      aria-label="Table pagination"
    >
      <span class="text-muted small">
        Showing
        {{ firstVisibleRecord }}
        –
        {{ lastVisibleRecord }}
        of {{ sortedRows.length }} records
      </span>

      <div class="d-flex align-items-center gap-2">

        <button
          type="button"
          class="btn btn-outline-secondary btn-sm"
          :disabled="currentPage === 1"
          aria-label="Go to previous page"
          @click="previousPage"
        >
          Previous
        </button>

        <span
          class="small"
          aria-live="off"
        >
          Page {{ currentPage }} of {{ totalPages }}
        </span>

        <button
          type="button"
          class="btn btn-outline-secondary btn-sm"
          :disabled="currentPage === totalPages"
          aria-label="Go to next page"
          @click="nextPage"
        >
          Next
        </button>

      </div>
    </nav>

  </div>
</template>

<style scoped>
.interactive-table {
  background: #ffffff;
  border: 1px solid #e2eae4;
  border-radius: 16px;
  padding: 24px;
  box-shadow: 0 4px 16px rgba(25, 65, 40, 0.06);
}

.form-label {
  color: #244b35;
}

.form-control {
  border: 1px solid #d7e3d9;
  border-radius: 10px;
  padding: 10px 12px;
}

.form-control:focus {
  border-color: #43865c;
  box-shadow: 0 0 0 0.2rem rgba(67, 134, 92, 0.14);
}

/* BR E.3 - Keyboard focus visibility */
.interactive-table button:focus-visible,
.interactive-table input:focus-visible {
  outline: 3px solid #14532d;
  outline-offset: 3px;
}

.table-responsive:focus-visible {
  outline: 3px solid #14532d;
  outline-offset: 3px;
}

.table {
  margin-bottom: 0;
  --bs-table-striped-bg: #f5f9f6;
  --bs-table-hover-bg: #edf5ef;
}

.table thead th {
  background-color: #edf5ef;
  color: #244b35;
  border-bottom: 1px solid #dce9df;
  padding: 14px 12px;
  white-space: nowrap;
}

.table tbody td {
  padding: 14px 12px;
  vertical-align: middle;
  color: #35483c;
}

.table thead .btn-link {
  color: #244b35 !important;
  font-size: 0.9rem;
}

.table thead .btn-link:hover {
  color: #287849 !important;
}

.table thead .form-control {
  min-width: 110px;
  padding: 7px 10px;
  font-size: 0.85rem;
  background-color: #ffffff;
}

.sort-button {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  text-align: left;
}

.sort-icon {
  font-size: 0.85rem;
}

.btn-outline-secondary {
  border-color: #43865c;
  color: #287849;
  border-radius: 9px;
}

.btn-outline-secondary:hover:not(:disabled) {
  background-color: #287849;
  border-color: #287849;
  color: #ffffff;
}

.btn-outline-secondary:disabled {
  opacity: 0.45;
}

@media (max-width: 575.98px) {
  .interactive-table {
    padding: 14px;
    border-radius: 12px;
  }

  .table thead th,
  .table tbody td {
    padding: 10px 8px;
  }
}
</style>
