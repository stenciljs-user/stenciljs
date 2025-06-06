import { Component, h, State, Prop, Event, EventEmitter, Element } from '@stencil/core';
import { Datepicker } from 'flowbite';

@Component({
  tag: 'date-range-picker',
  styleUrl: 'date-range-picker.css',
  shadow: false,
})
export class DateRangePicker {
  @Element() el: HTMLElement;

  @Prop() label: string = 'Select Date Range';

  @State() selectedLabel: string = 'Select Range';
  @State() showDropdown: boolean = false;
  @State() startDate: string = '';
  @State() endDate: string = '';

  @Event() dateRangeChange: EventEmitter<{ label: string; start: string; end: string }>;

  private formatDate(date: Date): string {
    return date.toISOString().split('T')[0];
  }

  private shiftDays(days: number): Date {
    const d = new Date();
    d.setDate(d.getDate() + days);
    return d;
  }

  private presetRanges = {
    'Today': () => {
      const today = new Date();
      return [today, today];
    },
    'Yesterday': () => {
      const y = this.shiftDays(-1);
      return [y, y];
    },
    'Last 7 Days': () => {
      return [this.shiftDays(-6), new Date()];
    },
    'Last 30 Days': () => {
      return [this.shiftDays(-29), new Date()];
    },
  };

  private applyPreset(label: string, start: Date, end: Date) {
    this.selectedLabel = label;
    this.startDate = this.formatDate(start);
    this.endDate = this.formatDate(end);
    this.dateRangeChange.emit({
      label,
      start: this.startDate,
      end: this.endDate,
    });
    this.showDropdown = false;
  }

  private initCustomPickers() {
    const startInput = this.el.querySelector('#start-date') as HTMLInputElement;
    const endInput = this.el.querySelector('#end-date') as HTMLInputElement;

    if (startInput) {
      new Datepicker(startInput, { autohide: true, format: 'yyyy-mm-dd' });
      startInput.addEventListener('change', () => {
        this.startDate = startInput.value;
        this.updateCustomRange();
      });
    }

    if (endInput) {
      new Datepicker(endInput, { autohide: true, format: 'yyyy-mm-dd' });
      endInput.addEventListener('change', () => {
        this.endDate = endInput.value;
        this.updateCustomRange();
      });
    }
  }

  private updateCustomRange() {
    if (this.startDate && this.endDate) {
      this.selectedLabel = 'Custom Range';
      this.dateRangeChange.emit({
        label: 'Custom Range',
        start: this.startDate,
        end: this.endDate,
      });
    }
  }

  componentDidLoad() {
    this.initCustomPickers();
  }

  render() {
    return (
      <div class="w-full max-w-md relative">
        {this.label && (
          <label class="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
            {this.label}
          </label>
        )}

        {/* Dropdown button */}
        <button
          type="button"
          onClick={() => (this.showDropdown = !this.showDropdown)}
          class="w-full bg-white border border-gray-300 text-gray-900 text-sm rounded-lg p-2.5 flex justify-between items-center"
        >
          {this.selectedLabel}
          <svg class="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
          </svg>
        </button>

        {/* Dropdown menu */}
        {this.showDropdown && (
          <div class="absolute bg-white border border-gray-300 mt-2 rounded-lg shadow-md z-50 w-full">
            {Object.entries(this.presetRanges).map(([label, fn]) => (
              <button
                class="w-full px-4 py-2 text-sm text-left hover:bg-gray-100"
                onClick={() => this.applyPreset(label, ...fn())}
              >
                {label}
              </button>
            ))}

            <div class="px-4 pt-4 pb-2 border-t">
              <div class="text-xs mb-2 text-gray-500">Custom Range</div>
              <div class="flex gap-2">
                <input
                  id="start-date"
                  type="text"
                  placeholder="Start date"
                  class="w-full border border-gray-300 rounded-md p-2 text-sm"
                  data-testid="start-date"
                />
                <input
                  id="end-date"
                  type="text"
                  placeholder="End date"
                  class="w-full border border-gray-300 rounded-md p-2 text-sm"
                  data-testid="end-date"
                />
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }
}
