import { ref } from 'vue'

export function useTabs(initialTab, tabs) {
  const activeTab = ref(initialTab)

  function selectTab(tab) {
    if (tabs.includes(tab)) activeTab.value = tab
  }

  function handleTabKeydown(event, currentTab) {
    if (!['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) return
    event.preventDefault()
    const currentIndex = tabs.indexOf(currentTab)
    let nextIndex = currentIndex
    if (event.key === 'ArrowRight') nextIndex = (currentIndex + 1) % tabs.length
    if (event.key === 'ArrowLeft') nextIndex = (currentIndex - 1 + tabs.length) % tabs.length
    if (event.key === 'Home') nextIndex = 0
    if (event.key === 'End') nextIndex = tabs.length - 1
    activeTab.value = tabs[nextIndex]
    document.querySelector(`[data-tab="${tabs[nextIndex]}"]`)?.focus()
  }

  return { activeTab, selectTab, handleTabKeydown }
}
