// Remove characters commonly used in HTML tags
export const sanitizeText = (value) => {
  return value.replace(/</g, '').replace(/>/g, '').trim()
}

// Check whether text contains script-like content
export const containsUnsafeContent = (value) => {
  const unsafePattern = /<script|javascript:|onerror=|onload=/i

  return unsafePattern.test(value)
}
