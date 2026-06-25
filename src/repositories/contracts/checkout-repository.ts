export interface AddressFixture {
  id: string;
  label: string;
  recipient: string;
  line1: string;
  line2?: string;
  postalCode: string;
}

export interface PaymentMethodFixture {
  id: string;
  label: string;
  simulationOnly: true;
}

export interface CheckoutFixtureRepository {
  listAddresses(): Promise<AddressFixture[]>;
  listPaymentMethods(): Promise<PaymentMethodFixture[]>;
}
