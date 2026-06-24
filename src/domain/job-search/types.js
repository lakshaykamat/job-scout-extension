/**
 * @typedef {Object} ScannerSettings
 * @property {number} scrollDelayMs
 * @property {string} activeProfileId
 * @property {ScanProfile[]} profiles
 */

/**
 * @typedef {Object} ScanProfile
 * @property {string} id
 * @property {string} name
 * @property {string[]} primaryKeywords
 * @property {string[]} supportingKeywords
 * @property {string[]} locationKeywords
 * @property {string[]} hiringKeywords
 * @property {string[]} exclusionKeywords
 */

/**
 * @typedef {Object} LinkedInPost
 * @property {string} id
 * @property {string} text
 * @property {string} rawText
 * @property {string} html
 * @property {string} author
 * @property {string} authorProfileUrl
 * @property {string} authorHeadline
 * @property {string} authorImageUrl
 * @property {string} connectionDegree
 * @property {string} timestamp
 * @property {string} url
 * @property {string[]} hashtags
 * @property {LinkedInPostLink[]} links
 * @property {LinkedInPostLink[]} externalLinks
 * @property {LinkedInPostMedia[]} media
 * @property {LinkedInPostPreview|null} preview
 * @property {LinkedInPostEngagement} engagement
 * @property {number} foundAt
 */

/**
 * @typedef {Object} LinkedInPostLink
 * @property {string} text
 * @property {string} url
 * @property {string} resolvedUrl
 * @property {string} hostname
 * @property {boolean} isExternal
 * @property {boolean} isProfile
 * @property {boolean} isHashtag
 */

/**
 * @typedef {Object} LinkedInPostMedia
 * @property {string} src
 * @property {string} alt
 */

/**
 * @typedef {Object} LinkedInPostPreview
 * @property {string} title
 * @property {string} url
 * @property {string} resolvedUrl
 * @property {string} hostname
 * @property {string} imageUrl
 */

/**
 * @typedef {Object} LinkedInPostEngagement
 * @property {number} reactions
 * @property {number} comments
 * @property {number} reposts
 */

/**
 * @typedef {Object} ScanRecord
 * @property {string} id
 * @property {string} status
 * @property {string} sourceUrl
 * @property {number} sourceTabId
 * @property {number} startedAt
 * @property {number} updatedAt
 * @property {number} postCount
 * @property {number} seenCount
 * @property {string} lastActivity
 * @property {ScanProfile} profile
 * @property {string} error
 */

export {};
