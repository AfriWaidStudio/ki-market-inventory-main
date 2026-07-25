export type Recommendation = "buy_now" | "wait" | "watch" | "skip";

export interface OpportunityInput {
  buyPrice: number;
  sellPrice: number;
  amount: number;
  estimatedFees: number;
  liquidityScore?: number | null; // 0-100
  merchantCount?: number | null;
  merchantRating?: number | null; // 0-5
}

export interface OpportunityResult {
  spread: number;
  spreadPct: number;
  grossProfit: number;
  netProfit: number;
  confidence: number; // 0-100
  risk: number; // 0-100
  recommendation: Recommendation;
  reasoning: string;
}

export interface CloseAnalysis {
  actualProfit: number;
  expectedProfit: number | null;
  delta: number | null;
  verdict: "accurate" | "underestimated" | "overestimated" | "unknown";
  mistakes: string[];
  lesson: string;
}

export type OperatorAction = "sell_now" | "wait" | "transfer" | "avoid" | "insufficient_data";

export type MarketAd = {
  exchange: string;
  side: "buy" | "sell";
  price: number;
  availableAsset: number;
  minFiat?: number | null;
  maxFiat?: number | null;
  paymentMethods?: string[];
  completionRate?: number | null;
  completedOrders?: number | null;
  observedAt: string;
};

export type ExecutableQuote = {
  exchange: string;
  price: number;
  filledAsset: number;
  proceeds: number;
  adsUsed: number;
  oldestObservation: string;
};

export type PositionInput = {
  tradeId: string;
  remainingAmount: number;
  buyPrice: number;
  totalFiatSpent?: number | null;
  entryFees: number;
  transferFeeAsset: number;
  exitFeesFiat: number;
  openedAt: string;
  horizonHours: number;
  sourceExchange?: string | null;
  destinationExchange?: string | null;
  paymentMethod?: string | null;
};

export type MarketHistory = {
  prices: number[];
  timestamps: string[];
  sampleCount: number;
  feedHealthy: boolean;
};

export type PositionDecision = {
  action: OperatorAction;
  venue: string | null;
  executablePrice: number | null;
  executableAmount: number;
  breakEvenPrice: number;
  targetPrice: number;
  expectedNet: number | null;
  downside: number | null;
  targetWindowHours: number | null;
  confidence: number | null;
  confidenceEligible: boolean;
  regime: string;
  evidence: string[];
  missingData: string[];
  invalidationCondition: string;
  nextEvaluationAt: string;
};
