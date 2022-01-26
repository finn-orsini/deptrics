const semver = require("semver");

/**
 *
 * Calculate the average time elapsed between a list of timestamps
 *
 * @param {Array} releaseTimes - An array containing release times
 * @return {number} average time between releases, in ms
 */
const calculateAverageTimeBetweenTimestamps = (timestamps) => {
  if (timestamps.length === 0 || timestamps.length === 1) {
    return 0;
  }

  const dates = timestamps.map((ts) => new Date(ts));
  if (dates.some((date) => date.toString() === "Invalid Date")) {
    return -1;
  }

  const sumOfTimeDifferences = dates.reduce((differenceSum, date, index) => {
    // if the current index is the last in the array, don't do anything
    // because we've already computed the difference in the previous iteration
    if (index === timestamps.length - 1) {
      return differenceSum;
    }
    // compute the difference between this time and the next time in the array
    // the last iteration will short circut above
    const nextDate = dates[index + 1];
    const timeDifference = nextDate - date;
    return differenceSum + timeDifference;
  }, 0);

  return sumOfTimeDifferences / (timestamps.length - 1);
};

/**
 * Calculate version sequence number distance from the current version to the most recent,
 * where version sequence distance is the number of versions released between the two
 *
 * @param {String} currentVersion - the current version to calculate seq dist for
 * @param {Array} versions - a sorted array of versions, where the last item is the most recently released
 * @returns {number} the version sequence distance
 */
const calculateVersionSequenceNumberDistance = (currentVersion, versions) => {
  const mostRecentVersionSequence = versions.length - 1;
  const currentVersionSequence = versions.indexOf(currentVersion);
  return currentVersionSequence === -1
    ? -1
    : mostRecentVersionSequence - currentVersionSequence;
};

/**
 * Get the median value in an array of numeric values.
 * Assumes the values can be sorted using a numeric sorting fn
 *
 */
const calculateMedian = (arr) => {
  const sorted = arr.sort((a, b) => a - b);
  const middleIndex = Math.floor(arr.length / 2);
  return arr.length % 2 !== 0
    ? sorted[middleIndex]
    : (sorted[middleIndex - 1] + sorted[middleIndex]) / 2;
};

/**
 * Calculates how long a dependency has been out of date, from 'now'
 *
 * Inject current time for ease of unit testing
 */
const calculateTimeOutdated = ({
  currentVersion,
  versions,
  timestamps,
  currentTime,
}) => {
  const nextVersionIndex = versions.indexOf(currentVersion) + 1;
  // this should always be true b.c. we do a semver comparison
  // before calling this function, but just to be safe
  if (nextVersionIndex <= versions.length - 1) {
    const nextVersion = versions[nextVersionIndex];
    const nextVersionTimestamp = timestamps[nextVersion];

    // return the difference in the time from when this function was called
    // and when the next version was released. This will get larger the longer
    // a dependency remains out of date
    return currentTime - new Date(nextVersionTimestamp);
  }
  return -1;
};

/**
 * Calculates how long a dependency has been a major version out of date, from 'now'
 *
 * Inject current time for ease of unit testing
 */
const calculateTimeOutdatedMajor = ({
  currentVersion,
  versions,
  timestamps,
  currentTime,
}) => {
  const versionIndex = versions.indexOf(currentVersion);
  const newerVersions = versions.slice(versionIndex);

  const nextMajorIndex = newerVersions.findIndex(
    (version) => semver.diff(currentVersion, version) === "major"
  );

  // this should always be true b.c. we do a semver comparison
  // before calling this function, but just to be safe
  if (nextMajorIndex !== -1 && nextMajorIndex <= newerVersions.length - 1) {
    const nextMajor = newerVersions[nextMajorIndex];
    const nextMajorTimestamp = timestamps[nextMajor];

    // return the difference in the time from when this function was called
    // and when the next version was released. This will get larger the longer
    // a dependency remains out of date
    return currentTime - new Date(nextMajorTimestamp);
  }
  return -1;
};

module.exports = {
  calculateAverageTimeBetweenTimestamps,
  calculateVersionSequenceNumberDistance,
  calculateMedian,
  calculateTimeOutdated,
  calculateTimeOutdatedMajor,
};
