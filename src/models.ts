export interface Ticker {
  symbol: string;
  bidPrice: string;
  bidQty: string;
  askPrice: string;
  askQty: string;
  time: number;
}

export interface FundingRate {
  symbol: string;
  fundingTime: number;
  fundingRate: string;
}

export interface SymbolPremium {
  symbol: string;
  premium: number;
}

export interface MappedFundingRate {
  symbol: string;
  meanRate: number;
  annualizedRate: number;
}
