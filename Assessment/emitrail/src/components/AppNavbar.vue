<template>
  <!-- Responsive navigation bar using Bootstrap -->
  <nav class="navbar navbar-expand-lg bg-white border-bottom">
    <div class="container">
      <!-- Logo links back to the home page -->
      <RouterLink class="navbar-brand d-flex align-items-center" to="/">
        <div class="logo-circle">EMITRAIL</div>
      </RouterLink>

      <!--Button appears when the screen becomes smaller -->
      <button
        class="navbar-toggler"
        type="button"
        data-bs-toggle="collapse"
        data-bs-target="#emitrailNavbar"
        aria-controls="emitrailNavbar"
        aria-expanded="false"
        aria-label="Toggle navigation"
      >
        <span class="navbar-toggler-icon"></span>
      </button>

      <!-- Navigation links collapse into the mobile menu -->
      <div id="emitrailNavbar" class="collapse navbar-collapse">
        <ul class="navbar-nav ms-auto gap-lg-4">
          <li class="nav-item">
            <RouterLink class="nav-link" to="/"> Home </RouterLink>
          </li>

          <li class="nav-item">
            <RouterLink class="nav-link" to="/compare"> Compare Travel </RouterLink>
          </li>

          <li class="nav-item">
            <RouterLink class="nav-link" to="/explore"> Explore Places </RouterLink>
          </li>

          <li class="nav-item">
            <RouterLink class="nav-link" to="/impact"> My Impact </RouterLink>
          </li>

          <li class="nav-item">
            <RouterLink class="nav-link" to="/about"> About </RouterLink>
          </li>
        </ul>
      </div>
    </div>
  </nav>
</template>

<style scoped>
/* Circular logo used in the navigation bar */
.logo-circle {
  width: 65px;
  height: 65px;
  border-radius: 50%;
  background: #b8e8ba;
  display: flex;
  align-items: center;
  justify-content: center;
  font-family: Georgia, serif;
  font-weight: 600;
}

/* Basic styling for navigation links */
.nav-link {
  color: #222;
  padding: 10px 15px !important;
  border-radius: 6px;
}

/* Highlight the page that is currently selected */
.router-link-active.nav-link {
  background-color: #b8e8ba;
}
</style>
