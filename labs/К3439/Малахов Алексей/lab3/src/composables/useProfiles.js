import { ref } from 'vue'

import { profilesApi } from '@/api'

const profiles = ref(new Map())

export function useProfiles() {
  async function load() {
    const { data } = await profilesApi.getAll()
    profiles.value = new Map(data.map((profile) => [profile.id, profile]))
  }

  function nameOf(userId) {
    return profiles.value.get(userId)?.name || 'Неизвестный автор'
  }

  function remember(profile) {
    profiles.value = new Map(profiles.value).set(profile.id, profile)
  }

  return { profiles, load, nameOf, remember }
}
