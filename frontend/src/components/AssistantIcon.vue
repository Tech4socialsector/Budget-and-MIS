<template>
  <!-- A single clean 4-point sparkle, not the previous busy bar-chart +
  tiny-sparkle + connector-lines mark - reads clearly at the small sizes
  this renders at (navbar icon, mobile nav tab) the way the old glyph's
  fine detail didn't. currentColor so it inherits whatever this instance
  is placed in (an inline gradient def can't be reused safely across
  multiple simultaneous instances - each would need its own unique id -
  so the "AI" signal comes from the shape itself, not a gradient). -->
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none">
    <path
      d="M12 3c.3 0 .56.2.63.5l1.2 5.17a3.5 3.5 0 0 0 2.6 2.6l5.17 1.2a.65.65 0 0 1 0 1.26l-5.17 1.2a3.5 3.5 0 0 0-2.6 2.6l-1.2 5.17a.65.65 0 0 1-1.26 0l-1.2-5.17a3.5 3.5 0 0 0-2.6-2.6l-5.17-1.2a.65.65 0 0 1 0-1.26l5.17-1.2a3.5 3.5 0 0 0 2.6-2.6l1.2-5.17A.65.65 0 0 1 12 3Z"
      fill="currentColor"
    />
  </svg>
</template>
