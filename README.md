# deptrics

`deptrics`, like `metrics`

## Description

A package to report dependency metrics. Currently relies on output from `yarn info` commands directly. See [#2](https://github.com/finn-orsini/deptrics/issues/2).

## API

### `getPackageMetrics`

`getPackageMetrics(obj)`, `getPackageMetrics({packageName})`

#### Parameters

`Object`

- `packageName`: Name of the npm package to retrieve metrics for

#### Return Value

`Object`

- `avgTimeBetweenMajors`: The average time, in milliseconds, between two major
  version releases - a measure of how often breaking changes are made to this
  library
- `avgTimeBetweenReleases`: The average time, in milliseconds, between every
  release of this package - a measure of how often the package is updated
- `lastReleaseDate`: The last time the package was updated

### `getPackageVersionMetrics`

`getPackageVersionMetrics(obj)`,
`getPackageVersionMetrics({packageName, version})`

#### Parameters

`Object`

- `packageName`: Name of the npm package to retrieve metrics for
- `version`: Package version to calculate health metrics for
- `additionalMetricCalculation`: A function which is passed the result of
  `yarn info`, and whose return value is spread into the return value of this
  function. Allows for customization of metrics without needing to call
  `yarn info` again.

#### Return Value

`Object`, `<PackageVersionMetricObject>`

- `mostRecentVersion`: The most recently published version of this package
- `versionSequenceNumberDistance`: The number of versions published between the
  `version` parameter, and the latest version of the package, a measure of how
  outdated a version is. Note: this metric is not ideal for packages which are
  frequently published, as many SF libraries are - so we recommend using in
  conjunction with other metrics provided.
- `versionReleaseDateDistance`: The amount of time, in milliseconds, between the
  time the `version` parameter of the package was published, and the time the
  most recent version was published, another metric of how outdated a particular
  version is.
- `semverDiff`: The semver difference between two versions - `major`, `minor`,
  `patch`. Returns `major` for multiple major differences (i.e. `0.0.1` to
  `3.0.2`), and `null` for equal versions.
- `version`: The version passed into this function
- `timeOutdated`: The amount of time a dependency has been outdated, calculated
  from the time the function is called
- `timeOutdatedMajor`: The amount of time a dependency has been a major version
  out of date, calculated from the time the function is called.

### `getMetricsForDependencies`

`getMetricsForDependencies(dependencies)`

#### Parameters

`Array<DependencyObject>`

- `DependencyObject`: `{packageName: packageVersion}`

#### Return Value

`Array<PackageVersionMetricObject>`: See return value of
`getPackageVersionMetrics`

### `aggregateMetrics`

`aggregateMetrics(packageVersionMetrics)`

#### Parameters

`Array<PackageVersionMetricObject>`

#### Return Value

`Object`

- `countOutdated`: The number of outdated dependencies in the list of package
  metrics
- `countMajor`: The number of dependencies off by at least one major version
- `countMinor`: The number of dependencies off by at least one minor version,
  but not a major.
- `countPatch`: The number of dependencies off by at least one patch version,
  but not a minor or major.
- `dependencyCount`: The total number of dependencies metrics computed for
- `averageVersionSequenceDistance`: The average of all the version sequence
  number distances
- `medianVersionSequenceDistance`: The median of all the version sequence number
  distances
- `averageVersionReleaseDateDistance`: The average of all the version release
  date distances

## Example Uses

#### For a list of dependencies

```js
const { getMetricsForDependencies, aggregateMetrics } = require("deptrics");

// Retrieving metrics for a list of dependencies
// Returns array of package version metrics, described below
const dependencyMetrics = getMetricsForDependencies({
  semver: "7.3.2",
  lib: "10.0.1",
});

// generate a report for all dependencies
const metricsReport = aggregateMetrics(dependencyMetrics);
```

#### For a single package

```js
const { getPackageVersionMetrics, getPackageMetrics } = require("deptrics");

// Get metrics for how outdated a specific dependency is
const packageVersionMetrics = getPackageVersionMetrics({
  packageName: "foo",
  version: "10.0.1",
});

// Get data about the release patterns of a package
const packageVersionMetrics = getPackageMetrics({
  packageName: "foo",
});
```
