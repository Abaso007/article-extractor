// utils/extractWithReadability

import { Readability } from '@mozilla/readability'
import { DOMParser } from 'linkedom'
import { isString } from '@pwshub/bellajs'

/**
 * Extract main article content from HTML using Mozilla Readability.
 *
 * @param {string} html - Raw HTML content
 * @param {string} [url=''] - Source URL for resolving relative paths
 * @returns {string|null} Extracted article HTML or null
 */
export default (html, url = '') => {
  if (!isString(html)) {
    return null
  }
  const doc = new DOMParser().parseFromString(html, 'text/html')
  const base = doc.createElement('base')
  base.setAttribute('href', url)
  doc.head.appendChild(base)
  const reader = new Readability(doc, {
    keepClasses: true,
  })
  const result = reader.parse() ?? {}
  return result.textContent ? result.content : null
}

/**
 * Extract article title from HTML using Mozilla Readability.
 *
 * @param {string} html - Raw HTML content
 * @returns {string|null} Extracted title or null
 */
export function extractTitleWithReadability (html) {
  if (!isString(html)) {
    return null
  }
  const doc = new DOMParser().parseFromString(html, 'text/html')
  const reader = new Readability(doc)
  return reader._getArticleTitle() || null
}
