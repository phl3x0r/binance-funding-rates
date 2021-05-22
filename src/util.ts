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
): MappedFundingRate[] => {
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
  currentList: MappedFundingRate[],
  newList: MappedFundingRate[]
) => {
  // find the current list in the new list for comparison
  const updatedCurrentList = newList.filter((n) =>
    currentList.some((c) => c.symbol === n.symbol)
  );
  if (
    newList
      .slice(0, PORTFOLIO_SIZE)
      .some((n) =>
        updatedCurrentList.some(
          (o) =>
            o.symbol !== n.symbol &&
            n.annualizedRate * THRESHOLD > o.annualizedRate
        )
      )
  ) {
    return assembleList(updatedCurrentList, newList);
  }
  return currentList;
};
