<template>
  <div class="container py-5 home-page">
    <div class="row justify-content-center">
      <div class="col-12 col-md-10 col-lg-8 text-center">
        <h1 class="display-5 fw-bold">Emitrail</h1>

        <p class="lead mb-0">Make every journey count.</p>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* Keep the home content comfortably spaced */
.home-page {
  min-height: 60vh;
  display: flex;
  align-items: center;
}

/* Mobile screens */
@media (max-width: 575.98px) {
  .home-page {
    padding-left: 16px;
    padding-right: 16px;
    min-height: 50vh;
  }

  h1 {
    font-size: 2rem;
  }

  p {
    font-size: 1rem;
  }
}
</style>
