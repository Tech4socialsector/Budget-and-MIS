import frappeUIPreset from 'frappe-ui/tailwind'

export default {
  presets: [frappeUIPreset],
  content: [
    './index.html',
    './src/**/*.{vue,js,ts,jsx,tsx}',
    './node_modules/frappe-ui/src/components/**/*.{vue,js,jsx,ts,tsx}',
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // Matches BudgetSummaryTable.vue's own palette (the "Budget Summary
        // page table design"), reused as named Tailwind colors so every
        // other table in the app (FoundationConsolidated.vue's tabs,
        // Monthly MIS, ERP Actuals) can look visually consistent with it
        // without redefining the same hex values in every component.
        'fc-blue-mid': '#1E5FA8', // main header / grand-total row background - BudgetSummaryTable's bg-banner
        'fc-blue-dark': '#154784', // darker header-column accent (e.g. a Grand Total header cell) + text-link/text-total-text color - one shade darker than fc-blue-mid, same relationship as BudgetSummaryTable's bg-banner -> bg-banner-hover
        'fc-blue-light': '#EAF1FB', // head-level row background - BudgetSummaryTable's bg-head-row
        'fc-orange': '#E8792A', // sub-header row background - BudgetSummaryTable's bg-subbanner
        'fc-orange-light': '#F5F8FD', // sub-head-level row background - BudgetSummaryTable's bg-subhead-row (blue-tinted, not orange, in that design - name kept for backwards compat with existing usages)
        'fc-stripe': '#FDF3EE', // alternating striped item-row background - BudgetSummaryTable's bg-stripe
        'fc-gt-col': '#DDEAF7', // grand-total column highlight
        'fc-total-row': '#DCEAFD', // non-grand total/subtotal row background - BudgetSummaryTable's bg-total-row
      },
    },
  },
}
