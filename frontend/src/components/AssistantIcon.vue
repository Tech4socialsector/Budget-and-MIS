<template>
  <!-- Distinct mark for this app's assistant: a small upward bar-chart
  trend (ties it to a budget/finance tool, not a generic AI sparkle) with
  a spark at the peak to signal "AI-assisted". Two-tone via currentColor
  fill + a lighter stroke so it still reads clearly at 14-16px. -->
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
  >
    <path d="M4 20V13" stroke="currentColor" stroke-width="2" stroke-linecap="round" />
    <path d="M10 20V9" stroke="currentColor" stroke-width="2" stroke-linecap="round" />
    <path d="M16 20V15.5" stroke="currentColor" stroke-width="2" stroke-linecap="round" />
    <path
      d="M17.5 3.2c.15-.4.75-.4.9 0l.42 1.13a.5.5 0 0 0 .29.29l1.13.42c.4.15.4.75 0 .9l-1.13.42a.5.5 0 0 0-.29.29l-.42 1.13c-.15.4-.75.4-.9 0l-.42-1.13a.5.5 0 0 0-.29-.29l-1.13-.42c-.4-.15-.4-.75 0-.9l1.13-.42a.5.5 0 0 0 .29-.29z"
      fill="currentColor"
    />
    <path d="M4 13l4.5-4.5M10 9l3.2 3.2" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" opacity="0.55" />
  </svg>
</template>
