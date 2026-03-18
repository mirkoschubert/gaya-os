<script lang="ts">
  import { Badge, type BadgeVariant } from '$lib/components/ui/badge'
  let { value, variant = 'outline' }: { value: string; variant?: BadgeVariant } = $props()
</script>

<Badge {variant}>{value}</Badge>
