const { execSync } = require("child_process");
const semver = require("semver");
const {
  calculateAverageTimeBetweenTimestamps,
  calculateVersionSequenceNumberDistance,
  calculateTimeOutdated,
  calculateTimeOutdatedMajor,
} = require("./utils");

const getYarnPackageInfo = ({ packageName }) => {
  const info = execSync(`yarn info ${packageName} --json`, {
    encoding: "utf8",
  });
  const {
    data: { versions, time, ...others },
  } = JSON.parse(info);

  return {
    // eventually lets make this configurable to allow folks to decide
    // what versions not to include themselves
    versions: versions.filter((version) => !semver.prerelease(version)),
    // We don't care about filtering time object b.c. we will access @ specific versions
    time,
    ...others,
  };
};

const getAverageTimeBetweenAllReleases = (versions, times) => {
  // retrieve only the times related to these versions
  const allReleaseTimes = versions.map((version) => times[version]);
  return calculateAverageTimeBetweenTimestamps(allReleaseTimes);
};

const getAverageTimeBetweenMajorReleases = (versions, times) => {
  // get a list of the times when a new major was released
  // note that semver does not include a `isMajor` function, so
  // record the time associated with the first time we see a new major number
  let previousMajor;
  const majorReleaseTimes = versions.reduce((acc, version) => {
    const curMajor = semver.major(version);
    if (previousMajor !== curMajor) {
      previousMajor = curMajor;
      return acc.concat(times[version]);
    }
    return acc;
  }, []);

  return calculateAverageTimeBetweenTimestamps(majorReleaseTimes);
};

// validate the date returned from this callback has required fields in expected format
const validatePackageVersionInfo = (info) => {
  if (!info.versions || info.versions.length === 0) {
    throw new Error(
      "`versions` property not found when calling `getPackageVersionInfo` from `getPackageVersionMetrics`"
    );
  }
  if (!info.time) {
    throw new Error(
      "`time` property not found when calling `getPackageVersionInfo` from `getPackageVersionMetrics`"
    );
  }
};

// function designed to be called for a consuming app / library
// i.e. what does using this version of this package
// mean for our dependency health
const getPackageVersionMetrics = ({
  packageName,
  version,
  additionalMetricCalculation = () => {},
  getPackageVersionInfo = getYarnPackageInfo,
}) => {
  const packageVersionInfo = getPackageVersionInfo({ packageName });
  validatePackageVersionInfo(packageVersionInfo);

  const { versions, time, ...others } = packageVersionInfo;
  const mostRecentVersion = versions[versions.length - 1];

  const versionSequenceNumberDistance = calculateVersionSequenceNumberDistance(
    version,
    versions
  );

  const mostRecentVersionReleaseDate = new Date(time[mostRecentVersion]);
  const currentVersionReleaseDate = new Date(time[version]);

  const versionReleaseDateDistance =
    mostRecentVersionReleaseDate - currentVersionReleaseDate;

  const semverDiff = semver.diff(version, mostRecentVersion);

  const timeOutdated = semverDiff
    ? calculateTimeOutdated({
        currentVersion: version,
        versions,
        timestamps: time,
        currentTime: new Date(),
      })
    : 0;
  const timeOutdatedMajor =
    semverDiff === "major"
      ? calculateTimeOutdatedMajor({
          currentVersion: version,
          versions,
          timestamps: time,
          currentTime: new Date(),
        })
      : 0;

  return {
    ...additionalMetricCalculation({ versions, time, ...others }),
    version,
    mostRecentVersion,
    versionSequenceNumberDistance,
    versionReleaseDateDistance,
    semverDiff,
    timeOutdated,
    timeOutdatedMajor,
  };
};

// function designed to (mainly) be called by library owners,
// or people interested in seeing metrics about a library itself,
// not a specific version of it
const getPackageMetrics = ({
  packageName,
  getPackageVersionInfo = getYarnPackageInfo,
}) => {
  const { versions, time } = getPackageVersionInfo({ packageName });
  const avgTimeBetweenMajors = getAverageTimeBetweenMajorReleases(
    versions,
    time
  );
  const avgTimeBetweenReleases = getAverageTimeBetweenAllReleases(
    versions,
    time
  );
  const lastReleaseDate = time[versions[versions.length - 1]];
  return {
    packageName,
    avgTimeBetweenMajors,
    avgTimeBetweenReleases,
    lastReleaseDate,
  };
};

module.exports = {
  getPackageVersionMetrics,
  getPackageMetrics,
};
