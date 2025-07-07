import { newSpecPage } from '@stencil/core/testing';
import { PaymentProcessing } from './payment-processing';
import { PaymentStatus } from '../../utils/enums';

describe('payment-processing', () => {
  let component;

  const mockBillingAddress = JSON.stringify({
    billingAddress1: '123 Main St',
    billingCity: 'Denver',
    billingState: 'CO',
    billingZipcode: '80202'
  });

  const mockShippingAddress = JSON.stringify({
    shippingAddress1: '123 Main St',
    shippingCity: 'Denver',
    shippingState: 'CO',
    shippingZipcode: '80202'
  });

  const setup = async (overrides = {}) => {
    const page = await newSpecPage({
      components: [PaymentProcessing],
      html: `<payment-processing></payment-processing>`,
    });
    component = page.rootInstance;
    Object.assign(component, {
      sourceMerchantId: 'merchant123',
      partnerId: 'partner456',
      totalAmount: 50,
      transactionReferenceId: 'ref789',
      primaryColor: '#000',
      buttonTextColor: '#fff',
      borderRadius: '4px',
      orderSummary: '{"item":"Test Item","amount":50}',
      billingAddress: mockBillingAddress,
      shippingAddress: mockShippingAddress,
      ...overrides,
    });
    await page.waitForChanges();
    return page;
  };

  it('renders and initializes with valid billing address', async () => {
    const page = await setup();
    expect(component.hasValidBillingAddress).toBe(true);
    expect(page.root).toBeTruthy();
  });

  it('resets component on error state', async () => {
    const page = await setup();
    component.transactionStatus = PaymentStatus.FAILURE;
    const result = component.getStatusAlertMessage();
    expect(result).not.toBeNull();
    expect(component.transactionStatus).toBeUndefined();
  });

  it('shows success message on payment success', async () => {
    const page = await setup();
    component.transactionStatus = PaymentStatus.SUCCESS;
    await page.waitForChanges();
    const successEl = page.root.querySelector('.text-3xl');
    expect(successEl).toBeTruthy();
    expect(successEl.textContent).toContain('Payment Successful');
  });

  it('handles billing address update', async () => {
    const page = await setup();
    const event = { detail: mockBillingAddress };
    component.onHandleBillingAddressSubmit(event);
    expect(component.billingAddress).toBe(mockBillingAddress);
    expect(component.disabledPaymentMethod).toBe(false);
  });

  it('handles billing address copied', async () => {
    const page = await setup();
    const event = { detail: mockBillingAddress };
    component.onBillingAddressCopied(event);
    expect(component.billingAddress).toBe(mockBillingAddress);
    expect(component.hasSameBillingAddressChecked).toBe(true);
  });

  it('handles edit and reset methods', async () => {
    const page = await setup();
    component.onHandleBillingAddressEdit();
    expect(component.paymentMethod).toBe('');
    expect(component.disabledPaymentMethod).toBe(true);

    component.onBillingAddressCopiedReset();
    expect(component.billingAddress).toBe('');
    expect(component.hasSameBillingAddressChecked).toBe(false);
  });

  it('validates billing and shipping address', async () => {
    const page = await setup();
    expect(component.hasValidShippingAddress).toBe(true);
    expect(component.hasValidBillingAddress).toBe(true);
  });
});
