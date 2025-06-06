import { Component, h, Prop, Event, EventEmitter, State, Element } from '@stencil/core';

@Component({
  tag: 'common-date-range-picker',
  styleUrl: 'common-date-range-picker.css',
  shadow: false, // Required for Flowbite DOM access
})
export class CommonDateRangePicker {
  @Element() el: HTMLElement;

  @Prop() label: string;
  @Prop() startDate?: string;
  @Prop() endDate?: string;

  @Event() dateRangeChange: EventEmitter<{ start: string; end: string }>;

  @State() showPicker: boolean = false;
  @State() selectedLabel: string = 'Custom Range';

  private presets = [
    { label: 'Today', getRange: () => [new Date(), new Date()] },
    { label: 'Last 7 Days', getRange: () => {
      const end = new Date();
      const start = new Date();
      start.setDate(end.getDate() - 6);
      return [start, end];
    }},
    { label: 'This Month', getRange: () => {
      const now = new Date();
      const start = new Date(now.getFullYear(), now.getMonth(), 1);
      const end = new Date(now.getFullYear(), now.getMonth() + 1, 0);
      return [start, end];
    }},
  ];

  private formatDate(date: Date) {
    return date.toISOString().split('T')[0];
  }

  private handlePresetClick = (label: string, range: [Date, Date]) => {
    this.selectedLabel = label;
    const [start, end] = range;
    this.dateRangeChange.emit({ start: this.formatDate(start), end: this.formatDate(end) });
    this.showPicker = false;
  };

  componentDidLoad() {
    // Lazy load Flowbite date range picker
    import('flowbite/dist/datepicker').then(() => {
      const el = this.el.querySelector('[data-datepicker-range]');
      const input = el?.querySelector('input');

      input?.addEventListener('change', () => {
        const val = input.value; // Ex: "2025-06-01 to 2025-06-07"
        const [start, end] = val.split(' to ');
        this.selectedLabel = 'Custom Range';
        this.dateRangeChange.emit({ start, end });
      });
    });
  }

  render() {
    return (
      <div class="w-full max-w-md">
        {this.label && (
          <label class="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
            {this.label}
          </label>
        )}

        {/* Dropdown Trigger */}
        <button
          class="w-full bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg p-2.5 flex justify-between items-center"
          onClick={() => this.showPicker = !this.showPicker}
        >
          {this.selectedLabel}
          <svg class="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
          </svg>
        </button>

        {/* Dropdown Modal */}
        {this.showPicker && (
          <div class="z-10 bg-white divide-y divide-gray-100 rounded-lg shadow w-full mt-2 border dark:bg-gray-700">
            {this.presets.map(preset => (
              <button
                class="w-full text-left px-4 py-2 text-sm hover:bg-gray-100 dark:text-white dark:hover:bg-gray-600"
                onClick={() => this.handlePresetClick(preset.label, preset.getRange())}
              >
                {preset.label}
              </button>
            ))}

            <div class="p-4 border-t">
              <div data-datepicker-range class="relative">
                <input
                  type="text"
                  class="w-full border border-gray-300 rounded-md p-2 text-sm"
                  placeholder="Select custom range"
                  data-testid="range-picker"
                />
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }
}
