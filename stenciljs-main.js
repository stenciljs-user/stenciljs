import { newSpecPage } from '@stencil/core/testing';
import { ShippingAddress } from './shipping-address';

const validShippingAddress = JSON.stringify({
  shippingName: 'John Doe',
  shippingEmail: 'john@example.com',
  shippingAddress1: '123 Main St',
  shippingCity: 'Denver',
  shippingState: 'CO',
  shippingZipcode: '80202'
});

const invalidShippingAddress = JSON.stringify({
  shippingCity: 'Denver',
  shippingZipcode: 80202
});

describe('shipping-address component', () => {
  it('renders correctly with valid shipping address', async () => {
    const page = await newSpecPage({
      components: [ShippingAddress],
      html: `<shipping-address shipping-address='${validShippingAddress}'></shipping-address>`,
    });

    expect(page.root).toBeTruthy();
    expect(page.root.shadowRoot.textContent).toContain('John Doe');
    expect(page.root.shadowRoot.textContent).toContain('Denver');
  });

  it('does not render with invalid shipping address', async () => {
    const page = await newSpecPage({
      components: [ShippingAddress],
      html: `<shipping-address shipping-address='${invalidShippingAddress}'></shipping-address>`,
    });

    expect(page.root).toBeNull();
  });

  it('does not render with invalid JSON string', async () => {
    const page = await newSpecPage({
      components: [ShippingAddress],
      html: `<shipping-address shipping-address='{invalid_json}'></shipping-address>`,
    });

    expect(page.root).toBeNull();
  });

  it('emits billingAddressCopied on checkbox click with correct converted billing address', async () => {
    const page = await newSpecPage({
      components: [ShippingAddress],
      html: `<shipping-address shipping-address='${validShippingAddress}'></shipping-address>`,
    });

    const checkbox = page.root.shadowRoot.querySelector('input[type="checkbox"]');
    const spy = jest.fn();
    page.root.addEventListener('billingAddressCopied', spy);

    checkbox.click();
    await page.waitForChanges();

    expect(spy).toHaveBeenCalled();
    const eventDetail = spy.mock.calls[0][0].detail;
    expect(eventDetail.billingName).toBe('John Doe');
    expect(eventDetail.billingZipcode).toBe('80202');
  });

  it('does not show checkbox if hasBillingAddress is true', async () => {
    const page = await newSpecPage({
      components: [ShippingAddress],
      html: `<shipping-address shipping-address='${validShippingAddress}' has-billing-address="true"></shipping-address>`,
    });

    const checkbox = page.root.shadowRoot.querySelector('input[type="checkbox"]');
    expect(checkbox).toBeNull();
  });

  it('has accessible label and checkbox attributes', async () => {
    const page = await newSpecPage({
      components: [ShippingAddress],
      html: `<shipping-address shipping-address='${validShippingAddress}'></shipping-address>`,
    });

    const checkbox = page.root.shadowRoot.querySelector('#billing-same-checkbox');
    const label = page.root.shadowRoot.querySelector('label');

    expect(checkbox).toBeTruthy();
    expect(label.getAttribute('for')).toBe('billing-same-checkbox');
    expect(checkbox.getAttribute('aria-checked')).toBe('false');
  });
});
