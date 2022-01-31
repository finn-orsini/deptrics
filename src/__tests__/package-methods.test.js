const {
  getPackageVersionMetrics,
  getPackageMetrics,
} = require("../package-methods");

const mockGetPackageVersionInfo = () => ({
  versions: ["0.0.0", "1.2.0", "1.2.4", "1.2.5", "2.0.0"],
  time: {
    "0.0.0": "2020-08-11T01:01:00.000Z",
    "1.2.0": "2020-08-11T01:01:01.000Z",
    "1.2.4": "2020-08-11T01:01:02.000Z",
    "1.2.5": "2020-08-11T01:01:04.000Z", // 1.2.5 patch released after 2.0.0
    "2.0.0": "2020-08-11T01:01:03.000Z",
  },
});

const mockGetPackageVersionInfoNoVersions = () => ({
  time: {},
});

const mockGetPackageVersionInfoNoTime = () => ({
  versions: {},
});

describe("getPackageVersionMetrics", () => {
  it("Returns dependency metrics", () => {
    const {
      mostRecentVersion,
      versionSequenceNumberDistance,
      versionReleaseDateDistance,
      semverDiff,
      timeOutdated,
      timeOutdatedMajor,
    } = getPackageVersionMetrics({
      packageName: "foo",
      version: "1.2.0",
      getPackageVersionInfo: mockGetPackageVersionInfo,
    });

    expect(mostRecentVersion).toBe("2.0.0");
    expect(semverDiff).toBe("major");
    expect(versionSequenceNumberDistance).toBe(3);
    expect(versionReleaseDateDistance).toBe(2000);
    expect(timeOutdated).toBeTruthy();
    expect(timeOutdatedMajor).toBeTruthy();
  });

  it("Returns correct (negative) time for a patch to previous major released AFTER latest current major", () => {
    const {
      mostRecentVersion,
      versionSequenceNumberDistance,
      versionReleaseDateDistance,
      semverDiff,
      timeOutdated,
      timeOutdatedMajor,
    } = getPackageVersionMetrics({
      packageName: "foo",
      version: "1.2.5",
      getPackageVersionInfo: mockGetPackageVersionInfo,
    });

    expect(mostRecentVersion).toBe("2.0.0");
    expect(semverDiff).toBe("major");
    expect(versionSequenceNumberDistance).toBe(1);
    expect(versionReleaseDateDistance).toBe(-1000);
    expect(timeOutdated).toBeTruthy();
    expect(timeOutdatedMajor).toBeTruthy();
  });

  it("Spreads result of additionalMetricCalculation into return", () => {
    const { extraKey } = getPackageVersionMetrics({
      packageName: "foo",
      version: "1.2.0",
      getPackageVersionInfo: mockGetPackageVersionInfo,
      additionalMetricCalculation: () => ({ extraKey: true }),
    });

    expect(extraKey).toBe(true);
  });
  it("Errors when required fields are missing from getPackageVersionInfo", () => {
    expect(() => {
      getPackageVersionMetrics({
        packageName: "foo",
        version: "1.2.0",
        getPackageVersionInfo: mockGetPackageVersionInfoNoTime,
      });
    }).toThrow(
      "`time` property not found when calling `getPackageVersionInfo` from `getPackageVersionMetrics`"
    );
    expect(() => {
      getPackageVersionMetrics({
        packageName: "foo",
        version: "1.2.0",
        getPackageVersionInfo: mockGetPackageVersionInfoNoVersions,
      });
    }).toThrow(
      "`versions` property not found when calling `getPackageVersionInfo` from `getPackageVersionMetrics`"
    );
  });
});

describe("getPackageMetrics", () => {
  it("Returns release date distance metrics", () => {
    const { avgTimeBetweenMajors, avgTimeBetweenReleases, lastReleaseDate } =
      getPackageMetrics({
        packageName: "foo",
        getPackageVersionInfo: mockGetPackageVersionInfo,
      });

    expect(avgTimeBetweenMajors).toBe(1500);
    expect(avgTimeBetweenReleases).toBe(750);
    expect(lastReleaseDate).toBe("2020-08-11T01:01:03.000Z");
  });
});
