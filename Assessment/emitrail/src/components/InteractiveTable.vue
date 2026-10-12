<script setup>
import { computed, ref, watch } from 'vue'

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
      ).trim().toLowerCase()

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

function sortBy(key) {
  if (sortKey.value === key) {
    sortDirection.value =
      sortDirection.value === 'asc' ? 'desc' : 'asc'
  } else {
    sortKey.value = key
    sortDirection.value = 'asc'
  }
}

watch([search, filters, sortKey, sortDirection], () => {
  currentPage.value = 1
}, { deep: true })

watch(totalPages, (pages) => {
  if (currentPage.value > pages) {
    currentPage.value = pages
  }
})
</script>

<template>
  <div class="interactive-table">
    <div class="mb-3">
      <label class="form-label fw-semibold">
        Search all records
      </label>
      <input
        v-model="search"
        type="search"
        class="form-control"
        placeholder="Search..."
      />
    </div>

    <div class="table-responsive">
      <table class="table table-striped table-hover align-middle">
        <thead>
          <tr>
            <th
              v-for="column in columns"
              :key="column.key"
              scope="col"
            >
              <button
                type="button"
                class="btn btn-link text-dark text-decoration-none fw-bold p-0"
                @click="sortBy(column.key)"
              >
                {{ column.label }}
                <span v-if="sortKey === column.key">
                  {{ sortDirection === 'asc' ? '▲' : '▼' }}
                </span>
                <span v-else>↕</span>
              </button>
            </th>
          </tr>

          <tr>
            <th
              v-for="column in columns"
              :key="column.key"
            >
              <input
                v-model="filters[column.key]"
                type="search"
                class="form-control form-control-sm"
                :aria-label="`Filter ${column.label}`"
                :placeholder="`Filter ${column.label}`"
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

    <div
      class="d-flex flex-wrap justify-content-between align-items-center gap-3 mt-3"
    >
      <span class="text-muted small">
        Showing
        {{ sortedRows.length === 0 ? 0 : (currentPage - 1) * pageSize + 1 }}
        –
        {{ Math.min(currentPage * pageSize, sortedRows.length) }}
        of {{ sortedRows.length }} records
      </span>

      <div class="d-flex align-items-center gap-2">
        <button
          class="btn btn-outline-secondary btn-sm"
          :disabled="currentPage === 1"
          @click="currentPage--"
        >
          Previous
        </button>

        <span class="small">
          Page {{ currentPage }} of {{ totalPages }}
        </span>

        <button
          class="btn btn-outline-secondary btn-sm"
          :disabled="currentPage === totalPages"
          @click="currentPage++"
        >
          Next
        </button>
      </div>
    </div>
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
