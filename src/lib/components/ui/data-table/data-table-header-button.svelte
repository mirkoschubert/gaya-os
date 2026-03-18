<script lang="ts">
  import ArrowUpDownIcon from '@lucide/svelte/icons/arrow-up-down'
  import { Button } from '$lib/components/ui/button/index.js'
  import type { ComponentProps } from 'svelte'

  let { label, variant = 'ghost', ...restProps }: ComponentProps<typeof Button> & { label: string } = $props()
</script>

<Button {variant} {...restProps}>
  {label}
  <ArrowUpDownIcon class="ms-2 size-4" />
</Button>
