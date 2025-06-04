import { h } from '@stencil/core';
import { TransactionDetails } from './transaction-details';
import { newSpecPage } from '@stencil/core/testing';

describe('TransactionDetails (JSX)', () => {
  const mockTransaction = {
    transactionAmount: 123.45,
    transactionDateTime: '2025-06-04T15:00:00Z',
    transactionStatus: 'SUCCESS',
    transactionType: 'Credit',
    cardInformation: {
      cardLogo: 'visa',
      cardLastFourDigits: '1234',
    },
    ticketNumber: 'REF123456'
  };

  it('renders transaction amount', async () => {
    const page = await newSpecPage({
      components: [],
      template: () => <div>{TransactionDetails(mockTransaction)}</div>,
    });

    expect(page.root.textContent).toContain('123.45');
    expect(page.root.textContent).toContain('USD');
  });

  it('renders formatted date and status', async () => {
    const page = await newSpecPage({
      components: [],
      template: () => <div>{TransactionDetails(mockTransaction)}</div>,
    });

    expect(page.root.textContent).toContain('Date & Time');
    expect(page.root.textContent).toContain('SUCCESS');
  });

  it('renders card information and reference ID', async () => {
    const page = await newSpecPage({
      components: [],
      template: () => <div>{TransactionDetails(mockTransaction)}</div>,
    });

    expect(page.root.textContent).toContain('1234');
    expect(page.root.textContent).toContain('REF123456');
  });

  it('renders fallback for missing ticketNumber', async () => {
    const page = await newSpecPage({
      components: [],
      template: () =>
        <div>
          {TransactionDetails({ ...mockTransaction, ticketNumber: undefined })}
        </div>,
    });

    expect(page.root.textContent).toContain('N/A');
  });

  it('renders nothing if transaction is undefined', async () => {
    const page = await newSpecPage({
      components: [],
      template: () => <div>{TransactionDetails(undefined)}</div>,
    });

    expect(page.root.textContent?.trim()).toBe('');
  });
});
