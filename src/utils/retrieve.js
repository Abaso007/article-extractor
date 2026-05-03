// utils -> retrieve

/**
 * Fetch content through a proxy endpoint.
 *
 * @param {string} url - Target URL to fetch
 * @param {Object} [options={}] - Proxy options
 * @param {Object} [options.proxy={}] - Proxy configuration
 * @param {string} options.proxy.target - Proxy endpoint URL
 * @param {Object} [options.proxy.headers={}] - Headers for proxy request
 * @param {AbortSignal} [options.signal] - Optional abort signal
 * @returns {Promise<Response>} Fetch response object
 */
const profetch = async (url, options = {}) => {
  const { proxy = {}, signal = null } = options
  const {
    target,
    headers = {},
  } = proxy
  const res = await fetch(target + encodeURIComponent(url), {
    headers,
    signal,
  })
  return res
}

/**
 * Retrieve raw HTML content from a URL.
 * Supports direct fetch, proxy, custom headers, agent, and abort signal.
 *
 * @param {string} url - URL to fetch
 * @param {FetchOptions} [options={}] - Fetch configuration
 * @returns {Promise<ArrayBuffer|null>} Response body as ArrayBuffer
 */
export default async (url, options = {}) => {
  const {
    headers = {
      'user-agent': 'Mozilla/5.0 (X11; Linux x86_64; rv:109.0) Gecko/20100101 Firefox/115.0',
    },
    proxy = null,
    agent = null,
    signal = null,
  } = options

  const res = proxy ? await profetch(url, { proxy, signal }) : await fetch(url, { headers, agent, signal })

  const status = res.status
  if (status >= 400) {
    throw new Error(`Request failed with error code ${status}`)
  }
  const buffer = await res.arrayBuffer()
  return buffer
}
