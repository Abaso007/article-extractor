// utils -> parseFromHtml

import {
  stripTags,
  truncateByChar,
  unique,
  pipe,
  getTTR
} from '@pwshub/bellajs'

import {
  purify,
  cleanify,
  countImages
} from './html.js'

import {
  isValid as isValidUrl,
  purify as purifyUrl,
  absolutify as absolutifyUrl,
  normalize as normalizeUrls,
  chooseBestUrl,
  getDomain
} from './linker.js'

import extractMetaData from './extractMetaData.js'

import extractWithReadability, {
  extractTitleWithReadability
} from './extractWithReadability.js'

import { execPreParser, execPostParser } from './transformation.js'

const summarize = ({ desc, text, threshold, maxlen }) => {
  return desc.length > threshold
    ? desc
    : truncateByChar(text, maxlen).replace(/\n/g, ' ')
}

export default async (inputHtml, inputUrl = '', parserOptions = {}) => {
  const pureHtml = purify(inputHtml)
  const meta = extractMetaData(pureHtml)

  let title = meta.title

  const {
    url,
    shortlink,
    amphtml,
    canonical,
    description: metaDesc,
    image: metaImg,
    author,
    published,
    favicon: metaFav,
    type,
  } = meta

  const {
    wordsPerMinute = 300,
    descriptionTruncateLen = 210,
    descriptionLengthThreshold = 180,
    contentLengthThreshold = 200,
  } = parserOptions

  // gather title
  if (!title) {
    title = extractTitleWithReadability(pureHtml, inputUrl)
  }
  if (!title) {
    return null
  }

  // gather urls to choose the best url later
  const links = unique(
    [url, shortlink, amphtml, canonical, inputUrl]
      .filter(isValidUrl)
      .map(purifyUrl)
  )

  if (!links.length) {
    return null
  }

  // choose the best url, which one looks like title the most
  const bestUrl = chooseBestUrl(links, title)

  const fns = pipe(
    (input) => {
      return normalizeUrls(input, bestUrl)
    },
    (input) => {
      return execPreParser(input, links)
    },
    (input) => {
      return extractWithReadability(input, bestUrl)
    },
    (input) => {
      return input ? execPostParser(input, links) : null
    },
    (input) => {
      return input ? cleanify(input) : null
    }
  )

  const content = fns(inputHtml)

  if (!content) {
    return null
  }

  const textContent = stripTags(content)
  if (textContent.length < contentLengthThreshold) {
    return null
  }

  const description = summarize({
    desc: metaDesc,
    text: textContent,
    threshold: descriptionLengthThreshold,
    maxlen: descriptionTruncateLen,
  })

  const image = metaImg ? absolutifyUrl(bestUrl, metaImg) : ''
  const favicon = metaFav ? absolutifyUrl(bestUrl, metaFav) : ''

  const imgcount = countImages(content)

  return {
    url: bestUrl,
    title,
    description,
    links,
    image,
    content,
    author,
    favicon,
    source: getDomain(bestUrl),
    published,
    ttr: getTTR(textContent, imgcount, wordsPerMinute),
    type,
  }
}
