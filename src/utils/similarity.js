// similarity.js

import {
  isString,
  compareTwoStrings,
  isArray
} from '@pwshub/bellajs'

/**
 * Validate arguments for findBestMatch.
 *
 * @param {string} mainString - Reference string
 * @param {string[]} targetStrings - Strings to compare against
 * @returns {boolean} True if arguments are valid
 */
const areArgsValid = (mainString, targetStrings) => {
  return isString(mainString) && isArray(targetStrings)
    && targetStrings.length > 0 && targetStrings.every(s => isString(s))
}

/**
 * Find the best matching string from a list using Dice coefficient.
 *
 * @param {string} mainString - Reference string to match against
 * @param {string[]} targetStrings - Candidate strings
 * @returns {{ratings: Array, bestMatch: {target: string, rating: number}, bestMatchIndex: number}} Match results with rankings
 */
export const findBestMatch = (mainString, targetStrings) => {
  if (!areArgsValid(mainString, targetStrings)) {
    throw new Error('Bad arguments: First argument should be a string, second should be an array of strings')
  }

  const ratings = []
  let bestMatchIndex = 0

  for (let i = 0; i < targetStrings.length; i++) {
    const currentTargetString = targetStrings[i]
    const currentRating = compareTwoStrings(mainString, currentTargetString)
    ratings.push({ target: currentTargetString, rating: currentRating })
    if (currentRating > ratings[bestMatchIndex].rating) {
      bestMatchIndex = i
    }
  }

  const bestMatch = ratings[bestMatchIndex]

  return { ratings: ratings, bestMatch: bestMatch, bestMatchIndex: bestMatchIndex }
}
