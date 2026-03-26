import { listAllCities } from '$lib/server/services/cities'
import type { PageServerLoad } from './$types'

export const load: PageServerLoad = async () => {
  const cities = await listAllCities()
  return {
    cities,
    breadcrumbs: [
      { label: 'Nation', href: '/nation' },
      { label: 'Cities' }
    ]
  }
}
