const { getPackageVersionMetrics } = require("./package-methods");
const { calculateMedian } = require("./utils");

const aggregateMetrics = (dependencyMetrics) => {
  const dependencyCount = dependencyMetrics.length;

  const countMajor = dependencyMetrics.filter(
    ({ semverDiff }) => semverDiff === "major"
  ).length;

  const countMinor = dependencyMetrics.filter(
    ({ semverDiff }) => semverDiff === "minor"
  ).length;

  const countPatch = dependencyMetrics.filter(
    ({ semverDiff }) => semverDiff === "patch"
  ).length;

  const { sumVersionSequenceDistance, sumVersionReleaseDateDistance } =
    dependencyMetrics.reduce(
      (acc, { versionSequenceNumberDistance, versionReleaseDateDistance }) => {
        return {
          sumVersionSequenceDistance:
            acc.sumVersionSequenceDistance + versionSequenceNumberDistance,
          sumVersionReleaseDateDistance:
            acc.sumVersionReleaseDateDistance + versionReleaseDateDistance,
        };
      },
      {
        sumVersionSequenceDistance: 0,
        sumVersionReleaseDateDistance: 0,
      }
    );

  const medianVersionSequenceDistance = calculateMedian(
    dependencyMetrics.map(
      ({ versionSequenceNumberDistance }) => versionSequenceNumberDistance
    )
  );

  const medianVersionReleaseDateDistance = calculateMedian(
    dependencyMetrics.map(
      ({ versionReleaseDateDistance }) => versionReleaseDateDistance
    )
  );

  return {
    countOutdated: countMajor + countMinor + countPatch,
    countMajor,
    countMinor,
    countPatch,
    dependencyCount,
    medianVersionSequenceDistance,
    medianVersionReleaseDateDistance,
    averageVersionSequenceDistance:
      sumVersionSequenceDistance / dependencyCount,
    averageVersionReleaseDateDistance:
      sumVersionReleaseDateDistance / dependencyCount,
  };
};

const getMetricsForDependencies = (dependencies = {}) => {
  return Object.keys(dependencies).map((packageName) => {
    return {
      packageName,
      ...getPackageVersionMetrics({
        packageName,
        version: dependencies[packageName],
      }),
    };
  });
};

module.exports = {
  getMetricsForDependencies,
  aggregateMetrics,
};
