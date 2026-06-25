export type CurrencyCode = "KRW";
export type KrwAmount = number;

export interface Money {
  amount: KrwAmount;
  currency: CurrencyCode;
}

export function createKrwAmount(amount: number): KrwAmount {
  if (!Number.isInteger(amount) || amount < 0) {
    throw new Error(`KRW amount must be a non-negative integer. Received: ${amount}`);
  }

  return amount;
}

export function createKrwMoney(amount: number): Money {
  return {
    amount: createKrwAmount(amount),
    currency: "KRW",
  };
}
