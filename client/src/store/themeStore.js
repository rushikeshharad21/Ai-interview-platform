import { create } from "zustand"

const getSystemPreference = () => {
  if (typeof window === "undefined") return "light"
  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light"
}

const applyTheme = (theme) => {
  const root = document.documentElement
  if (theme === "dark") {
    root.classList.add("dark")
  } else {
    root.classList.remove("dark")
  }
}

const storedTheme = localStorage.getItem("theme")
const initialTheme = storedTheme || getSystemPreference()
applyTheme(initialTheme)

const useThemeStore = create((set) => ({
  theme: initialTheme,

  toggleTheme: () => {
    set((state) => {
      const nextTheme = state.theme === "dark" ? "light" : "dark"
      localStorage.setItem("theme", nextTheme)
      applyTheme(nextTheme)
      return { theme: nextTheme }
    })
  }
}))

if (!storedTheme && typeof window !== "undefined") {
  const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)")
  mediaQuery.addEventListener("change", (event) => {
    const currentlyStored = localStorage.getItem("theme")
    if (!currentlyStored) {
      const systemTheme = event.matches ? "dark" : "light"
      applyTheme(systemTheme)
      useThemeStore.setState({ theme: systemTheme })
    }
  })
}

export default useThemeStore