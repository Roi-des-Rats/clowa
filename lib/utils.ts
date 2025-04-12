import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatDate(date: string | Date) {
  return new Intl.DateTimeFormat("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  }).format(new Date(date))
}

export function getHostname(url: string) {
  try {
    const hostname = new URL(url).hostname
    return hostname.replace(/^www\./, "")
  } catch (error) {
    return url
  }
}

export function truncate(str: string, length: number) {
  if (str.length <= length) {
    return str
  }
  return str.slice(0, length) + "..."
}

/**
 * Capitalizes the first letter of each word in a string
 */
export function capitalizeWords(text: string): string {
  return text
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
}
