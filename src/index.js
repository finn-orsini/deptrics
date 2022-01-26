const {
  getPackageVersionMetrics,
  getPackageMetrics,
} = require("./package-methods");
const {
  getMetricsForDependencies,
  aggregateMetrics,
} = require("./dependency-methods");

module.exports = {
  getPackageVersionMetrics,
  getPackageMetrics,
  getMetricsForDependencies,
  aggregateMetrics,
};
