import { newSpecPage } from '@stencil/core/testing';
import { BillingAddress } from '../billing-address';

const mockProps = {
  billingAddress1: '123 Main St',
  billingAddress2: 'Apt 4B',
  billingCity: 'Denver',
  billingState: 'CO',
  billingZipcode: '80202',
  billingEmail: 'john.doe@example.com',
  billingPhone: '1234567890',
};

const mockBillingAddressString = JSON.stringify(mockProps);

describe('billing-address', () => {
  it('renders empty form if no props passed', async () => {
    const page = await newSpecPage({
      components: [BillingAddress],
      html: '<billing-address></billing-address>',
    });
    expect(page.root).toBeTruthy();
    expect(page.root.shadowRoot.querySelector('input')).toBeTruthy();
  });

  it('renders summary view when valid billingAddress is passed', async () => {
    const page = await newSpecPage({
      components: [BillingAddress],
      html: `<billing-address billing-address='${mockBillingAddressString}'></billing-address>`,
    });
    expect(page.root.shadowRoot.textContent).toContain('Billing information');
    expect(page.root.shadowRoot.textContent).toContain('123 Main St');
  });

  it('renders form view when no billingAddress passed', async () => {
    const page = await newSpecPage({
      components: [BillingAddress],
      html: '<billing-address></billing-address>',
    });
    expect(page.root.shadowRoot.querySelector('input[placeholder="Address"]')).toBeTruthy();
  });

  it('marks required fields invalid on empty submit', async () => {
    const page = await newSpecPage({
      components: [BillingAddress],
      html: '<billing-address></billing-address>',
    });
    const instance = page.rootInstance;
    instance.handleContinue();
    await page.waitForChanges();
    expect(instance.isValid).toBe(false);
    expect(Object.keys(instance.formErrors).length).toBeGreaterThan(0);
  });

  it('emits billingAddressSubmit event on valid submit', async () => {
    const page = await newSpecPage({
      components: [BillingAddress],
      html: '<billing-address></billing-address>',
    });
    const instance = page.rootInstance;
    Object.assign(instance.billingForm, mockProps);
    instance.isFormSubmitted = true;
    instance.handleContinue();
    await page.waitForChanges();

    const eventSpy = jest.fn();
    page.root.addEventListener('billingAddressSubmit', eventSpy);

    instance.handleContinue();
    await page.waitForChanges();
    expect(eventSpy).toHaveBeenCalled();
  });

  it('allows editing after clicking Edit', async () => {
    const page = await newSpecPage({
      components: [BillingAddress],
      html: `<billing-address billing-address='${mockBillingAddressString}'></billing-address>`,
    });
    const editBtn = page.root.shadowRoot.querySelector('common-button');
    editBtn.click();
    await page.waitForChanges();
    expect(page.rootInstance.isFormEditable).toBe(true);
  });
});
