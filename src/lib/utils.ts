import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function removeUrls(text: string): string {
  if (!text) return text;
  // Regex to match URLs
  const urlRegex = /(https?:\/\/[^\s]+)/g;
  return text.replace(urlRegex, '');
}
