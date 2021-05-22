import { fromFetch } from "./from-fetch";
import { getBestFundingRates, getMean, getPremium, hoursAgo } from "./util";
import {
  delay,
  map,
  mergeMap,
  pairwise,
  startWith,
  switchMap,
  tap,
} from "rxjs/operators";
import {
  FundingRate,
  MappedFundingRate,
  SymbolPremium,
  Ticker,
} from "./models";
import { forkJoin, timer } from "rxjs";
import { UPDATE_FREQUENCY, FUTURES, SPOT, PORTFOLIO_SIZE } from "./config";
import { sendDiscord } from "./discord";

let currentList: Array<MappedFundingRate> = [];

timer(0, UPDATE_FREQUENCY)
  .pipe(
    mergeMap(() =>
      fromFetch(FUTURES + "/fapi/v1/ticker/bookTicker").pipe(
        switchMap((futuresData) => futuresData.json()),
        switchMap((futureTickers: Ticker[]) =>
          fromFetch(SPOT + "/api/v1/ticker/bookTicker").pipe(
            switchMap((spotData) => spotData.json()),
            map(
              (spotTickers: Ticker[]) =>
                futureTickers
                  .reduce(
                    (acc, cur) =>
                      (spotTickers.some((t) => t.symbol === cur.symbol) && [
                        ...acc,
                        {
                          symbol: cur.symbol,
                          premium: getPremium(
                            spotTickers.find((s) => s.symbol === cur.symbol),
                            cur
                          ),
                        },
                      ]) ||
                      acc,
                    <Array<SymbolPremium>>[]
                  )
                  .filter((symbolPremium) => symbolPremium.premium > 1) // we only want symbols with positive premium
            ),
            switchMap((premiums) =>
              forkJoin(
                premiums.map((p, i) =>
                  fromFetch(
                    FUTURES +
                      `/fapi/v1/fundingRate?symbol=${
                        p.symbol
                      }&startTime=${hoursAgo(
                        24
                      )}&endTime=${new Date().getTime()}`
                  ).pipe(
                    delay(i * 100),
                    switchMap((data) => data.json()),
                    map((fundingRates: FundingRate[]) => {
                      const meanRate = getMean(
                        fundingRates.map((fr) =>
                          Number.parseFloat(fr.fundingRate)
                        )
                      );
                      return <MappedFundingRate>{
                        symbol: p.symbol,
                        meanRate,
                        annualizedRate: Math.pow(1 + meanRate, 3 * 365) - 1,
                      };
                    })
                  )
                )
              ).pipe(
                map((fundingRates) =>
                  fundingRates
                    .sort((a, b) => b.annualizedRate - a.annualizedRate)
                    .slice(0, PORTFOLIO_SIZE)
                )
              )
            )
          )
        )
      )
    )
  )
  .subscribe((newList: MappedFundingRate[]) => {
    const newCurrentList = !currentList.length
      ? newList
      : getBestFundingRates(currentList, newList);
    if (newCurrentList !== currentList) {
      currentList = newCurrentList;
      console.log(currentList);
      sendDiscord(JSON.stringify(currentList, null, "\t"));
    }
  });
