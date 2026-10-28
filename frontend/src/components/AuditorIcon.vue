<template>
  <!-- The assistant's mark: a friendly robot head (antenna + two eyes) with
  a small checked-ledger accent on its "chest", reading as "an automated
  accounting assistant" rather than a generic AI sparkle. Kept to simple
  rounded shapes so it still reads clearly at the ~14-16px size the navbar's
  collapsed badge renders it at. Same indigo-to-pink gradient as before for
  brand continuity with the rest of this app's AI surfaces. The gradient id
  is generated per-instance (useId) rather than hardcoded, since an SVG
  <linearGradient> id is global to the document - a fixed id would silently
  collide (and only one copy would render its gradient) the moment this
  icon appears more than once at the same time (e.g. the desktop nav
  trigger and the side panel's own header both showing it at once). -->
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none">
    <defs>
      <linearGradient :id="gradientId" x1="3" y1="21" x2="21" y2="3" gradientUnits="userSpaceOnUse">
        <stop offset="0" stop-color="#818cf8" />
        <stop offset="0.55" stop-color="#c084fc" />
        <stop offset="1" stop-color="#f472b6" />
      </linearGradient>
    </defs>
    <!-- Antenna -->
    <circle cx="12" cy="2.6" r="1" :fill="`url(#${gradientId})`" />
    <path d="M12 3.6v2" :stroke="`url(#${gradientId})`" stroke-width="1.6" stroke-linecap="round" />
    <!-- Head -->
    <rect x="4" y="5.8" width="16" height="13" rx="4.2" fill="none" :stroke="`url(#${gradientId})`" stroke-width="1.7" />
    <!-- Side "ears" -->
    <path d="M4 10.2h-1M21 10.2h-1" :stroke="`url(#${gradientId})`" stroke-width="1.7" stroke-linecap="round" />
    <!-- Eyes -->
    <circle cx="9" cy="11.6" r="1.15" :fill="`url(#${gradientId})`" />
    <circle cx="15" cy="11.6" r="1.15" :fill="`url(#${gradientId})`" />
    <!-- Ledger-check "mouth": a small checkmark reads as the accounting/
    auditing signal without needing a second separate glyph. -->
    <path d="M9 15.4l1.8 1.6 4.2-3.6" :stroke="`url(#${gradientId})`" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" />
  </svg>
</template>

<script setup>
import { useId } from 'vue'

const gradientId = `ai-assistant-glow-${useId()}`
</script>
