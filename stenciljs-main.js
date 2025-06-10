import { newSpecPage } from '@stencil/core/testing';
import { CommonDatepicker } from './common-datepicker';

describe('common-datepicker', () => {
  it('renders with default placeholder and label', async () => {
    const page = await newSpecPage({
      components: [CommonDatepicker],
      html: `<common-datepicker></common-datepicker>`,
    });

    expect(page.root).toBeTruthy();
    expect(page.root.textContent).toContain('Select Range');
  });

  it('sets range on predefined option click (e.g., "Last 7 Days")', async () => {
    const page = await newSpecPage({
      components: [CommonDatepicker],
      html: `<common-datepicker></common-datepicker>`,
    });

    const instance = page.rootInstance;
    const emitSpy = jest.fn();
    instance.dateRangeChange = { emit: emitSpy } as any;

    const today = new Date();
    const last7 = new Date();
    last7.setDate(today.getDate() - 6);

    const todayStr = today.toISOString().split('T')[0];
    const last7Str = last7.toISOString().split('T')[0];

    instance.setRange(last7Str, todayStr);
    expect(emitSpy).toHaveBeenCalledWith({ startDate: last7Str, endDate: todayStr });
  });

  it('sets custom range on apply button click', async () => {
    const page = await newSpecPage({
      components: [CommonDatepicker],
      html: `<common-datepicker></common-datepicker>`,
    });

    const instance = page.rootInstance;
    const emitSpy = jest.fn();
    instance.dateRangeChange = { emit: emitSpy } as any;

    document.body.innerHTML = `
      <input id="datepicker-range-start" value="2025-06-01" />
      <input id="datepicker-range-end" value="2025-06-07" />
    `;

    instance.applyCustomDate();

    expect(emitSpy).toHaveBeenCalledWith({
      startDate: '2025-06-01',
      endDate: '2025-06-07',
    });
  });

  it('resets values and emits empty dates on Reset', async () => {
    const page = await newSpecPage({
      components: [CommonDatepicker],
      html: `<common-datepicker></common-datepicker>`,
    });

    const instance = page.rootInstance;
    instance.internalStart = '2025-06-01';
    instance.internalEnd = '2025-06-05';
    const emitSpy = jest.fn();
    instance.dateRangeChange = { emit: emitSpy } as any;

    instance.resetDatepicker();

    expect(instance.internalStart).toBe('');
    expect(instance.internalEnd).toBe('');
    expect(instance.rangeLabel).toBe('Select Range');
    expect(emitSpy).toHaveBeenCalledWith({ startDate: '', endDate: '' });
  });

  it('closes dropdown on Apply', async () => {
    const page = await newSpecPage({
      components: [CommonDatepicker],
      html: `<common-datepicker></common-datepicker>`,
    });

    const instance = page.rootInstance;
    const dropdown = document.createElement('div');
    dropdown.id = 'custom-datepicker-dropdown';
    dropdown.classList.add('block');
    document.body.appendChild(dropdown);

    instance['dropdownId'] = 'custom-datepicker-dropdown';
    instance.closeDropdown();

    expect(dropdown.classList.contains('hidden')).toBe(true);
    expect(dropdown.classList.contains('block')).toBe(false);
  });
});
