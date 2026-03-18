<script lang="ts">
  import { Checkbox } from '$lib/components/ui/checkbox/index.js'

  let {
    checked = false,
    indeterminate = false,
    onCheckedChange,
    'aria-label': ariaLabel
  }: {
    checked?: boolean
    indeterminate?: boolean
    onCheckedChange?: (v: boolean) => void
    'aria-label'?: string
  } = $props()
</script>

<Checkbox
  {checked}
  {indeterminate}
  onCheckedChange={(v) => onCheckedChange?.(v === true)}
  aria-label={ariaLabel}
/>
