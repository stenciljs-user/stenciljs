import { newSpecPage } from '@stencil/core/testing';
import { OrderSummary } from './order-summary';

const mockOrderSummary = JSON.stringify({
  items: [
    {
      productName: 'Item 1',
      description: 'Desc 1',
      quantity: 2,
      productAmount: 15.0
    },
    {
      productName: 'Item 2',
      description: 'Desc 2',
      quantity: 1,
      productAmount: 10.0
    },
    {
      productName: 'Item 3',
      description: 'Desc 3',
      quantity: 1,
      productAmount: 20.0
    },
    {
      productName: 'Item 4',
      description: 'Desc 4',
      quantity: 3,
      productAmount: 30.0
    },
    {
      productName: 'Item 5',
      description: 'Desc 5',
      quantity: 1,
      productAmount: 25.0
    }
  ],
  currency: 'USD',
  subtotal: 100,
  estimatedShipping: 5,
  total: 105
});

describe('order-summary', () => {
  it('renders nothing if invalid summary', async () => {
    const page = await newSpecPage({
      components: [OrderSummary],
      html: `<order-summary order-summary="{}"></order-summary>`
    });
    expect(page.root).toBeNull();
  });

  it('renders summary if valid input', async () => {
    const page = await newSpecPage({
      components: [OrderSummary],
      html: `<order-summary order-summary='${mockOrderSummary}'></order-summary>`
    });
    expect(page.root).toBeDefined();
    expect(page.root.querySelectorAll('button').length).toBe(1); // Show all items button
    expect(page.root.textContent).toContain('Order Summary');
    expect(page.root.textContent).toContain('Show all 5 items');
    expect(page.root.textContent).toContain('Subtotal');
    expect(page.root.textContent).toContain('Estimated shipping');
    expect(page.root.textContent).toContain('Total');
  });

  it('renders modal with all products if items are present', async () => {
    const page = await newSpecPage({
      components: [OrderSummary],
      html: `<order-summary order-summary='${mockOrderSummary}'></order-summary>`
    });

    const component = page.rootInstance;
    const modalContent = component['getOrderSummaryView'](JSON.parse(mockOrderSummary).items, true);

    expect(modalContent.length).toBe(5);
    expect(modalContent[0].nodeName).toBe('DIV');
  });

  it('renders correctly for fewer than 4 items', async () => {
    const smallSummary = JSON.parse(mockOrderSummary);
    smallSummary.items = smallSummary.items.slice(0, 3);

    const page = await newSpecPage({
      components: [OrderSummary],
      html: `<order-summary order-summary='${JSON.stringify(smallSummary)}'></order-summary>`
    });

    expect(page.root.querySelector('button')).toBeNull(); // No "Show all" button
  });
});
