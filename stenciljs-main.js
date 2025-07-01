
import {
  Component,
  h,
  Host,
  Prop,
  State,
  Event,
  EventEmitter,
} from '@stencil/core';
import { CONSTANTS } from '../../utils/constant';

/**
 * BillingAddress Component
 * Renders and validates billing address form or shows summary view when submitted.
 */
@Component({
  tag: 'billing-address',
  styleUrl: 'billing-address.css',
  shadow: true,
})
export class BillingAddress {
  /** Serialized billing address JSON string */
  @Prop() billingAddress: string;

  /** Internal form state */
  @State() billingForm: Record<string, string> = {
    billingAddress1: '',
    billingAddress2: '',
    billingEmail: '',
    billingPhone: '',
    billingCity: '',
    billingState: '',
    billingZipcode: '',
  };

  @State() isFormEditable: boolean = true;
  @State() formErrors: Record<string, string> = {};
  @State() isValid: boolean = false;
  @State() isFormSubmitted: boolean = false;

  /** Emits billing form object on successful submission */
  @Event() billingAddressSubmit: EventEmitter<any>;

  private readonly requiredFields = [
    'billingAddress1',
    'billingCity',
    'billingState',
    'billingZipcode',
  ];

  componentWillLoad() {
    if (this.billingAddress) {
      try {
        const parsed = JSON.parse(this.billingAddress);
        if (this.isValidBillingAddress(parsed)) {
          this.billingForm = parsed;
          this.isFormEditable = false;
        }
      } catch (e) {
        console.warn('Invalid billingAddress JSON', e);
      }
    }
  }

  private handleChange(field: keyof typeof this.billingForm, value: string) {
    this.billingForm = { ...this.billingForm, [field]: value };
    this.isFormSubmitted = true;
    this.validateForm();
  }

  private validateForm() {
    const missingFields = this.requiredFields.filter(
      (field) => !this.billingForm[field]
    );
    this.formErrors = {};
    missingFields.forEach((field) => {
      this.formErrors[field] = `${field} is required.`;
    });
    this.isValid = missingFields.length === 0;
  }

  private handleContinue() {
    this.validateForm();
    if (this.isValid) {
      this.isFormEditable = false;
      this.billingAddressSubmit.emit(this.billingForm);
    }
  }

  private handleEdit() {
    this.isFormEditable = true;
  }

  private renderInput(
    label: string,
    field: keyof typeof this.billingForm,
    type = 'text',
    optional = false
  ) {
    const showError =
      !optional && !this.billingForm[field] && this.isFormSubmitted;
    return (
      <div>
        <label class="block text-sm font-medium text-gray-900">
          {label}
        </label>
        <input
          class={`bg-gray-50 border ${
            showError ? 'border-red-500' : 'border-gray-300'
          } text-gray-900 text-sm rounded-md focus:ring-blue-500 focus:border-blue-500 block w-full mb-2`}
          type={type}
          placeholder={label}
          value={this.billingForm[field]}
          disabled={!this.isFormEditable}
          onInput={(e: any) => this.handleChange(field, e.target.value)}
        />
        {showError && (
          <span class="text-xs text-red-600">{label} is required.</span>
        )}
      </div>
    );
  }

  private isValidBillingAddress(data: any): boolean {
    return this.requiredFields.every((key) => typeof data[key] === 'string');
  }

  private renderSummaryView() {
    return (
      <Host>
        <div class="p-5 bg-gray-50 border border-secondary-stroke rounded-lg my-4">
          <h2 class="text-gray-900 font-semibold text-md flex items-center gap-2">
            Billing information <common-icon name="edit" />
          </h2>
          <div class="text-sm text-gray-600 mt-2 space-y-1">
            <p>{this.billingForm.billingEmail}</p>
            <p>{this.billingForm.billingPhone}</p>
            <p>
              {this.billingForm.billingAddress1}{' '}
              {this.billingForm.billingAddress2}
            </p>
            <p>
              {this.billingForm.billingCity}, {this.billingForm.billingState}{' '}
              {this.billingForm.billingZipcode}
            </p>
          </div>
          <common-button
            variant="secondary"
            size="small"
            classNames="mt-4 w-full"
            onClick={() => this.handleEdit()}
          >
            Edit
          </common-button>
        </div>
      </Host>
    );
  }

  render() {
    const shouldShowSummary =
      this.isValidBillingAddress(this.billingForm) && !this.isFormEditable;

    if (shouldShowSummary) return this.renderSummaryView();

    return (
      <div class="my-4">
        <h2 class="text-gray-900 font-semibold text-md pb-4">
          Billing information
        </h2>
        <div class="grid gap-3">
          {this.renderInput('Address', 'billingAddress1')}
          {this.renderInput('Apt, Suite (Optional)', 'billingAddress2', 'text', true)}

          <div class="grid grid-cols-2 gap-4">
            {this.renderInput('City', 'billingCity')}
            {this.renderInput('Zip code', 'billingZipcode')}
          </div>

          <label class="block text-sm font-medium text-gray-900">State</label>
          <select
            class="bg-gray-50 border border-gray-300 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"
            onInput={(e: any) => this.handleChange('billingState', e.target.value)}
            disabled={!this.isFormEditable}
            value={this.billingForm.billingState}
          >
            <option value="">Choose a state</option>
            {CONSTANTS.states.map((state) => (
              <option value={state}>{state}</option>
            ))}
          </select>

          <common-button
            disabled={!this.isValid || !this.isFormSubmitted}
            onClick={() => this.handleContinue()}
          >
            Continue
          </common-button>
        </div>
      </div>
    );
  }

}
