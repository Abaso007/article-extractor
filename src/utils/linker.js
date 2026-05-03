// utils -> linker

import { DOMParser } from 'linkedom'

import { findBestMatch } from './similarity.js'

/**
 * Check if a string is a valid HTTP or HTTPS URL.
 *
 * @param {string} [url=''] - URL string to validate
 * @returns {boolean} True if valid HTTP(S) URL
 */
export const isValid = (url = '') => {
  try {
    const ourl = new URL(url)
    return ourl !== null && ourl.protocol.startsWith('http')
  } catch {
    return false
  }
}

/**
 * Pick the URL that best matches the article title using string similarity.
 *
 * @param {string[]} [candidates=[]] - Candidate URLs
 * @param {string} [title=''] - Article title for comparison
 * @returns {string} Best matching URL
 */
export const chooseBestUrl = (candidates = [], title = '') => {
  const ranking = findBestMatch(title, candidates)
  return ranking.bestMatch.target
}

/**
 * Resolve a relative URL against a base URL.
 *
 * @param {string} [fullUrl=''] - Base URL
 * @param {string} [relativeUrl=''] - Relative URL to resolve
 * @returns {string} Absolute URL or empty string on failure
 */
export const absolutify = (fullUrl = '', relativeUrl = '') => {
  try {
    const result = new URL(relativeUrl, fullUrl)
    return result.toString()
  } catch {
    return ''
  }
}

/**
 * Tracking and analytics query parameters to strip from URLs.
 *
 * @type {string[]}
 */
const blacklistKeys = [
  'CNDID',
  '__twitter_impression',
  '_hsenc',
  '_openstat',
  'action_object_map',
  'action_ref_map',
  'action_type_map',
  'amp',
  'fb_action_ids',
  'fb_action_types',
  'fb_ref',
  'fb_source',
  'fbclid',
  'ga_campaign',
  'ga_content',
  'ga_medium',
  'ga_place',
  'ga_source',
  'ga_term',
  'gs_l',
  'hmb_campaign',
  'hmb_medium',
  'hmb_source',
  'mbid',
  'mc_cid',
  'mc_eid',
  'mkt_tok',
  'referrer',
  'spJobID',
  'spMailingID',
  'spReportId',
  'spUserID',
  'utm_brand',
  'utm_campaign',
  'utm_cid',
  'utm_content',
  'utm_int',
  'utm_mailing',
  'utm_medium',
  'utm_name',
  'utm_place',
  'utm_pubreferrer',
  'utm_reader',
  'utm_social',
  'utm_source',
  'utm_swu',
  'utm_term',
  'utm_userid',
  'utm_viz_id',
  'wt_mc_o',
  'yclid',
  'WT.mc_id',
  'WT.mc_ev',
  'WT.srch',
  'pk_source',
  'pk_medium',
  'pk_campaign',
]

/**
 * Remove tracking parameters and hash fragment from a URL.
 *
 * @param {string} url - URL to clean
 * @returns {string|null} Cleaned URL or null if invalid
 */
export const purify = (url) => {
  try {
    const pureUrl = new URL(url)

    blacklistKeys.forEach((key) => {
      pureUrl.searchParams.delete(key)
    })

    return pureUrl.toString().replace(pureUrl.hash, '')
  } catch {
    return null
  }
}

/**
 * @param inputHtml {string}
 * @param url {string}
 * @returns article {string}
 */
/**
 * Normalize all links, images, and source elements in HTML
 * by resolving relative URLs to absolute and adding target=_blank to links.
 *
 * @param {string} html - HTML content to normalize
 * @param {string} url - Base URL for resolving relative paths
 * @returns {string} Normalized HTML string
 */
export const normalize = (html, url) => {
  const doc = new DOMParser().parseFromString(html, 'text/html')

  Array.from(doc.getElementsByTagName('a')).forEach((element) => {
    const href = element.getAttribute('href')
    if (href) {
      element.setAttribute('href', absolutify(url, href))
      element.setAttribute('target', '_blank')
    }
  })

  Array.from(doc.getElementsByTagName('img')).forEach((element) => {
    const src = element.getAttribute('data-src') ?? element.getAttribute('src')
    if (src) {
      element.setAttribute('src', absolutify(url, src))
    }
  })

  Array.from(doc.getElementsByTagName('source')).forEach((element) => {
    const src = element.getAttribute('src')
    if (src) {
      element.setAttribute('src', absolutify(url, src))
    }
  })

  return Array.from(doc.childNodes).map(element => element.outerHTML).join('')
}

/**
 * Extract the domain from a URL, stripping the www. prefix.
 *
 * @param {string} url - Full URL
 * @returns {string} Domain name
 */
export const getDomain = (url) => {
  const host = (new URL(url)).host
  return host.replace('www.', '')
}
