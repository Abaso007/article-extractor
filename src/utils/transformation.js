// utils --> transformation.js

import { isArray, isFunction } from '@pwshub/bellajs'
import { DOMParser } from 'linkedom'

/**
 * Registered transformation rules for per-site HTML pre/post processing.
 *
 * @type {Transformation[]}
 */
const transformations = []

/**
 * Add a single transformation to the registry.
 *
 * @param {Transformation} tn - Transformation object with patterns and handlers
 * @returns {number} 1 if added, 0 if invalid
 */
const add = (tn) => {
  const { patterns } = tn
  if (!patterns || !isArray(patterns) || !patterns.length) {
    return 0
  }
  transformations.push(tn)
  return 1
}

/**
 * Register one or more transformations for per-site HTML processing.
 *
 * @param {Transformation|Transformation[]} tfms - Transformation(s) to add
 * @returns {number} Number of transformations successfully added
 */
export const addTransformations = (tfms) => {
  if (isArray(tfms)) {
    return tfms.map(tfm => add(tfm)).filter(result => result === 1).length
  }
  return add(tfms)
}

/**
 * Remove transformations matching the given patterns.
 * Calling without arguments removes all transformations.
 *
 * @param {RegExp[]} [patterns] - URL patterns to match for removal
 * @returns {number} Number of transformations removed
 */
export const removeTransformations = (patterns) => {
  if (!patterns) {
    const removed = transformations.length
    transformations.length = 0
    return removed
  }
  let removing = 0
  for (let i = transformations.length - 1; i >= 0; i--) {
    const { patterns: ipatterns } = transformations[i]
    const matched = ipatterns.some((ptn) => patterns.some((pattern) => String(pattern) === String(ptn)))
    if (matched) {
      transformations.splice(i, 1)
      removing += 1
    }
  }
  return removing
}

/**
 * Get a copy of all registered transformations.
 *
 * @returns {Transformation[]} Copy of transformations array
 */
export const getTransformations = () => {
  return [...transformations]
}

/**
 * Find all transformations whose patterns match any of the given URLs.
 *
 * @param {string|string[]} links - URL(s) to match against transformation patterns
 * @returns {Transformation[]} Matching transformations
 */
export const findTransformations = (links) => {
  const urls = !isArray(links) ? [links] : links
  const tfms = []
  for (const transformation of transformations) {
    const { patterns } = transformation
    const matched = urls.some((url) => patterns.some((pattern) => pattern.test(url)))
    if (matched) {
      tfms.push({
        ...transformation,
      })
    }
  }
  return tfms
}

/**
 * Run pre-extraction transformations on raw HTML.
 * Mutates the DOM in place through registered pre-processor functions.
 *
 * @param {string} html - Raw HTML content
 * @param {string[]} links - URLs to match against transformation patterns
 * @returns {string} Transformed HTML string
 */
export const execPreParser = (html, links) => {
  const doc = new DOMParser().parseFromString(html, 'text/html')
  findTransformations(links).map(tfm => tfm.pre).filter(fn => isFunction(fn)).forEach(fn => fn(doc))
  return Array.from(doc.childNodes).map(it => it.outerHTML).join('')
}

/**
 * Run post-extraction transformations on extracted article content.
 * Mutates the DOM in place through registered post-processor functions.
 *
 * @param {string} html - Extracted article HTML
 * @param {string[]} links - URLs to match against transformation patterns
 * @returns {string} Transformed HTML string
 */
export const execPostParser = (html, links) => {
  const doc = new DOMParser().parseFromString(html, 'text/html')
  findTransformations(links).map(tfm => tfm.post).filter(fn => isFunction(fn)).forEach(fn => fn(doc))
  return Array.from(doc.childNodes).map(it => it.outerHTML).join('')
}
