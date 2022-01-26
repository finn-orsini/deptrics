const { aggregateMetrics } = require("../dependency-methods");

const mockMetrics = [
  {
    versionSequenceNumberDistance: 0,
    versionReleaseDateDistance: 2,
    semverDiff: "major",
  },
  {
    versionSequenceNumberDistance: 1,
    versionReleaseDateDistance: 4,
    semverDiff: "major",
  },
  {
    versionSequenceNumberDistance: 5,
    versionReleaseDateDistance: 6,
    semverDiff: "minor",
  },
];

describe("aggregateMetrics", () => {
  it("Counts each semver diff occurance", () => {
    const { countMajor, countMinor, countPatch } =
      aggregateMetrics(mockMetrics);
    expect(countMajor).toBe(2);
    expect(countMinor).toBe(1);
    expect(countPatch).toBe(0);
  });

  it("Calculates an average of version sequence numbers", () => {
    const { averageVersionSequenceDistance } = aggregateMetrics(mockMetrics);
    expect(averageVersionSequenceDistance).toBe(2);
  });

  it("Calculates a median of version sequence numbers", () => {
    const { medianVersionSequenceDistance } = aggregateMetrics(mockMetrics);
    expect(medianVersionSequenceDistance).toBe(1);
  });

  it("Calculates an average of version release date distances", () => {
    const { averageVersionReleaseDateDistance } = aggregateMetrics(mockMetrics);
    expect(averageVersionReleaseDateDistance).toBe(4);
  });

  it("Calculates a median of version release date distances", () => {
    const { medianVersionReleaseDateDistance } = aggregateMetrics(mockMetrics);
    expect(medianVersionReleaseDateDistance).toBe(4);
  });
});
