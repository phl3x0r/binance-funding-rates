import { PORTFOLIO_SIZE, THRESHOLD } from "./config";
import { MappedFundingRate } from "./models";

export const getMean = (numbers: Array<number>) =>
  numbers.length && numbers.reduce((a, b) => a + b) / numbers.length;

export const hoursAgo = (hours: number): number => {
  const time = new Date();
  time.setHours(time.getHours() - hours);
  return time.getTime();
};

export const getPremium = (spot, perp) =>
  getMean([
    Number.parseFloat(perp["askPrice"]),
    Number.parseFloat(perp["bidPrice"]),
  ]) /
  getMean([
    Number.parseFloat(spot["askPrice"]),
    Number.parseFloat(spot["bidPrice"]),
  ]);

export const assembleList = (
  aList: MappedFundingRate[],
  bList: MappedFundingRate[]
) => {
  const b = bList.shift();
  if (
    b &&
    (!aList ||
      aList.length < PORTFOLIO_SIZE ||
      aList.some((a) => b.annualizedRate > a.annualizedRate * (1 + THRESHOLD)))
  ) {
    return assembleList([...(aList || []), b], bList);
  }
  return aList
    .sort((a, b) => b.annualizedRate - a.annualizedRate)
    .slice(0, PORTFOLIO_SIZE);
};

export const getBestFundingRates = (
  x: [MappedFundingRate[], MappedFundingRate[]]
): MappedFundingRate[] => {
  const oldList = x[0].slice(0, 5);
  const newList = x[1].filter(
    (n) => !oldList.some((o) => o.symbol === n.symbol)
  );
  return assembleList(oldList, newList);
};
