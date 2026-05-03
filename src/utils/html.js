// utils -> html

import { DOMParser } from 'linkedom'
import sanitize from 'sanitize-html'
import { pipe } from '@pwshub/bellajs'

import { getSanitizeHtmlOptions } from '../config.js'

/**
 * Lightweight HTML sanitization that fixes structural issues
 * without stripping any tags or attributes.
 *
 * @param {string} html - Raw HTML input
 * @returns {string} Sanitized HTML (all tags/attributes preserved)
 */
export const purify = (html) => {
  return sanitize(html, {
    allowedTags: false,
    allowedAttributes: false,
    allowVulnerableTags: true,
  })
}

/**
 * Regex matching strings that consist entirely of whitespace characters.
 *
 * @type {RegExp}
 */
const WS_REGEXP = /^[\s\f\n\r\t\u1680\u180e\u2000\u2001\u2002\u2003\u2004\u2005\u2006\u2007\u2008\u2009\u200a\u2028\u2029\u202f\u205f\u3000\ufeff\x09\x0a\x0b\x0c\x0d\x20\xa0]+$/ // eslint-disable-line

/**
 * Collapse multiple consecutive line breaks into single newlines,
 * and remove lines that are entirely whitespace.
 *
 * @param {string} str - Input string
 * @returns {string} Cleaned string
 */
const stripMultiLinebreaks = (str) => {
  return str.replace(/(\r\n|\n|\u2424){2,}/g, '\n').split('\n').map((line) => {
    return WS_REGEXP.test(line) ? line.trim() : line
  }).filter((line) => {
    return line.length > 0
  }).join('\n')
}

/**
 * Replace all-whitespace sequences with a single space.
 *
 * @param {string} str - Input string
 * @returns {string} Cleaned string
 */
const stripMultispaces = (str) => {
  return str.replace(WS_REGEXP, ' ').trim()
}

/**
 * Detect HTML character encoding from meta tags.
 *
 * @param {string} html - Raw HTML content
 * @returns {string} Charset name (defaults to 'utf8')
 */
export const getCharset = (html) => {
  const doc = new DOMParser().parseFromString(html, 'text/html')
  const m = doc.querySelector('meta[charset]') || null
  let charset = m ? m.getAttribute('charset') : ''
  if (!charset) {
    const h = doc.querySelector('meta[http-equiv="content-type"]') || null
    charset = h ? h.getAttribute('content')?.split(';')[1]?.replace('charset=', '')?.trim() : ''
  }
  return charset?.toLowerCase() || 'utf8'
}

/**
 * Final cleanup of extracted article content:
 * sanitize to allowed tags, collapse whitespace.
 *
 * @param {string} inputHtml - Extracted article HTML
 * @returns {string} Cleaned HTML string
 */
export const cleanify = (inputHtml) => {
  const doc = new DOMParser().parseFromString(inputHtml, 'text/html')
  const html = doc.documentElement.innerHTML
  return pipe(
    input => sanitize(input, getSanitizeHtmlOptions()),
    input => stripMultiLinebreaks(input),
    input => stripMultispaces(input)
  )(html)
}

/**
 * Count the number of img tags in HTML content.
 *
 * @param {string} html - HTML content
 * @returns {number} Number of img elements
 */
export const countImages = (html) => {
  const doc = new DOMParser().parseFromString(html, 'text/html')
  const imgTags = doc.querySelectorAll('img') || []
  return imgTags.length
}
