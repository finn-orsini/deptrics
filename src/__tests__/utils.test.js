const {
  calculateAverageTimeBetweenTimestamps,
  calculateVersionSequenceNumberDistance,
  calculateMedian,
  calculateTimeOutdated,
  calculateTimeOutdatedMajor,
} = require("../utils");

const versions = ["1", "2", "3", "4", "5", "6"];

describe("calculateAverageTimeBetweenDates", () => {
  it("Returns zero for an empty array", () => {
    expect(calculateAverageTimeBetweenTimestamps([])).toEqual(0);
  });

  it("Returns zero for a single date", () => {
    expect(
      calculateAverageTimeBetweenTimestamps(["2020-08-11T01:01:01.000Z"])
    ).toEqual(0);
  });

  it("Calculates the time between two dates", () => {
    // a difference of 1000 ms
    const times = ["2020-08-11T01:01:01.000Z", "2020-08-11T01:01:02.000Z"];
    expect(calculateAverageTimeBetweenTimestamps(times)).toEqual(1000);
  });

  it("Calculates the time between multiple dates", () => {
    const times = [
      "2020-08-11T01:01:01.000Z",
      "2020-08-11T01:01:02.000Z", // difference of 1000 ms
      "2020-08-11T01:01:04.000Z", // difference of 2000 ms
    ];
    expect(calculateAverageTimeBetweenTimestamps(times)).toEqual(1500);
  });

  it("Returns -1 if invalid date passed", () => {
    const times = ["2020-08-11", "2020-08-12", "bar"];
    expect(calculateAverageTimeBetweenTimestamps(times)).toEqual(-1);
  });
});

describe("calculateVersionSequenceDistance", () => {
  it("Returns 0 for the most recent version", () => {
    expect(calculateVersionSequenceNumberDistance("6", versions)).toBe(0);
  });

  it("Returns -1 for a version not in the versions array", () => {
    expect(calculateVersionSequenceNumberDistance("foo", versions)).toBe(-1);
  });

  it("Returns 3 for a sequence of 3", () => {
    expect(calculateVersionSequenceNumberDistance("3", versions)).toBe(3);
  });
});

describe("calculateMedian", () => {
  it("Finds the median of a sorted array, odd length", () => {
    expect(calculateMedian([1, 2, 3])).toBe(2);
  });
  it("Finds the median of a sorted array, even length", () => {
    expect(calculateMedian([1, 2, 3, 4])).toBe(2.5);
  });
  it("Finds the median of an unsorted array, even length", () => {
    expect(calculateMedian([3, 1, 4, 2])).toBe(2.5);
  });
  it("Finds the median of a unsorted array, odd length", () => {
    expect(calculateMedian([2, 3, 1])).toBe(2);
  });
});

describe("calculateTimeOutdated", () => {
  it("Returns -1 if no newer version", () => {
    expect(
      calculateTimeOutdated({
        currentVersion: "1",
        versions: ["1"],
        times: {},
        currentTime: 0,
      })
    ).toBe(-1);
  });

  it("Calculates time outdated for single version", () => {
    expect(
      calculateTimeOutdated({
        currentVersion: "1",
        versions: ["1", "2"],
        timestamps: { 2: "2020-08-11T01:01:01.000Z" },
        currentTime: new Date("2020-08-11T01:03:01.000Z"),
      })
    ).toBe(120000);
  });

  it("Calculates time outdated from next version even with multiple versions", () => {
    expect(
      calculateTimeOutdated({
        currentVersion: "1",
        versions: ["1", "2", "3"],
        timestamps: {
          2: "2020-08-11T01:01:01.000Z",
          3: "2020-08-11T01:04:01.000Z",
        },
        currentTime: new Date("2020-08-11T01:03:01.000Z"),
      })
    ).toBe(120000);
  });
});

describe("calculateTimeOutdatedMajor", () => {
  it("Returns -1 if no newer major", () => {
    expect(
      calculateTimeOutdatedMajor({
        currentVersion: "1.0.0",
        versions: ["1.0.0", "1.0.1"],
        timestamps: { "1.0.1": "2020-08-11T01:01:01.000Z" },
      })
    ).toBe(-1);
  });

  it("Returns the time outdated from next major", () => {
    expect(
      calculateTimeOutdatedMajor({
        currentVersion: "1.0.0",
        versions: ["1.0.0", "1.0.1", "2.0.0"],
        timestamps: { "2.0.0": "2020-08-11T01:01:01.000Z" },
        currentTime: new Date("2020-08-11T01:03:01.000Z"),
      })
    ).toBe(120000);
  });

  it("Returns the time outdated from next major, even if multiple majors behind", () => {
    expect(
      calculateTimeOutdatedMajor({
        currentVersion: "1.0.0",
        versions: ["1.0.0", "2.0.0", "3.0.0"],
        timestamps: {
          "2.0.0": "2020-08-11T01:01:01.000Z",
          "3.0.0": "2020-08-11T01:02:01.000Z",
        },
        currentTime: new Date("2020-08-11T01:03:01.000Z"),
      })
    ).toBe(120000);
  });
});
