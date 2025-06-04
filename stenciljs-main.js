import { newSpecPage } from '@stencil/core/testing';
import { CommonTable } from './common-table';
import { h } from '@stencil/core';

describe('common-table', () => {
  const mockHeader = [
    { field: 'id', label: 'ID', format: 'TEXT' },
    { field: 'status', label: 'Status', format: 'STATUS' }
  ];

  const mockData = [
    { id: '123', status: 'SUCCESS' },
    { id: '456', status: 'FAILED' }
  ];

  it('renders with header and data', async () => {
    const page = await newSpecPage({
      components: [CommonTable],
      template: () => (
        <common-table
          tableHeader={mockHeader}
          tableData={mockData}
          loading={false}
        />
      ),
    });

    // Verify header
    const headers = page.root.shadowRoot.querySelectorAll('thead th');
    expect(headers.length).toBe(2);
    expect(headers[0].textContent).toContain('ID');
    expect(headers[1].textContent).toContain('Status');

    // Verify row data
    const rows = page.root.shadowRoot.querySelectorAll('tbody tr');
    expect(rows.length).toBe(2);
    expect(rows[0].textContent).toContain('123');
    expect(rows[1].textContent).toContain('456');
  });

  it('emits pageRefresh on refresh button click', async () => {
    const page = await newSpecPage({
      components: [CommonTable],
      html: `<common-table></common-table>`,
    });

    const refreshSpy = jest.fn();
    page.root.addEventListener('pageRefresh', refreshSpy);

    const button = page.root.shadowRoot.querySelector('button');
    button?.click();

    expect(refreshSpy).toHaveBeenCalled();
  });

  it('emits showDetails on row click', async () => {
    const page = await newSpecPage({
      components: [CommonTable],
      template: () => (
        <common-table
          tableHeader={mockHeader}
          tableData={mockData}
        />
      ),
    });

    const detailsSpy = jest.fn();
    page.root.addEventListener('showDetails', detailsSpy);

    const row = page.root.shadowRoot.querySelector('[data-testid="transaction-row"]');
    row?.dispatchEvent(new Event('click'));

    expect(detailsSpy).toHaveBeenCalledWith(expect.any(CustomEvent));
    expect(detailsSpy.mock.calls[0][0].detail).toEqual(mockData[0]);
  });

  it('shows loading spinner when loading=true', async () => {
    const page = await newSpecPage({
      components: [CommonTable],
      template: () => (
        <common-table loading={true} />
      ),
    });

    expect(page.root.shadowRoot.textContent).toContain('Loading...');
  });

  it('shows no data message if table is empty and not loading', async () => {
    const page = await newSpecPage({
      components: [CommonTable],
      template: () => (
        <common-table tableData={[]} tableHeader={mockHeader} loading={false} error={false} />
      ),
    });

    expect(page.root.shadowRoot.textContent).toContain('You have no transactions yet');
  });

  it('shows error message if error=true', async () => {
    const page = await newSpecPage({
      components: [CommonTable],
      template: () => (
        <common-table error={true} loading={false} />
      ),
    });

    expect(page.root.shadowRoot.textContent).toContain('An error occurred');
  });
});
