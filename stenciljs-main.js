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

@Component({
  tag: 'billing-address',
  styleUrl: 'billing-address.css',
  shadow: true,
})
export class BillingAddress {
  @Prop() billingAddress: any;
  @State() billingForm: any = {
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
  @State() isValid = false;
  @State() isFormSubmitted: boolean = false;

  /**
   * Fires when the continue button is clicked
   */
  @Event() handleBillingAddressSubmit: EventEmitter<any>;

  private requiredFields = [
    'billingAddress1',
    'billingCity',
    'billingState',
    'billingZipcode',
  ];

  componentWillLoad() {
    if (this.billingAddress) {
      const billing = JSON.parse(this.billingAddress);
      const isComplete = this.requiredFields.every((field) => billing[field]);

      if (isComplete) {
        this.billingForm = billing;
        this.isFormEditable = false;
      }
    }
  }

  private handleChange(field: string, value: string) {
    this.billingForm = { ...this.billingForm, [field]: value };
    this.validateForm();
    this.isFormSubmitted = true;
  }

  private validateForm() {
    const { billingAddress1, billingCity, billingState, billingZipcode } =
      this.billingForm;
    const isValid =
      billingAddress1 && billingCity && billingState && billingZipcode;
    this.isValid = !!isValid;
  }

  private handleContinue() {
    this.validateForm();
    if (Object.keys(this.formErrors).length === 0) {
      this.isFormEditable = false;
      this.handleBillingAddressSubmit.emit(this.billingForm);
      // this.sendToAPI(this.billingForm); // Integrate API call here
    }
  }

  private handleEdit() {
    this.isFormEditable = true;
  }

  private renderInput(
    label: string,
    name: keyof typeof this.billingForm,
    type = 'text'
  ) {
    const isFieldEmpty =
      !this.billingForm[name] &&
      this.requiredFields.includes(name as string) &&
      !this.isValid &&
      this.isFormSubmitted;
    return (
      <div>
        <input
          class={`bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-md focus:ring-blue-500 focus:border-blue-500 block w-full ${
            isFieldEmpty ? 'border-red-500' : 'mb-5'
          }`}
          type={type}
          placeholder={label}
          value={this.billingForm[name]}
          disabled={!this.isFormEditable}
          onInput={(e: any) => this.handleChange(name as any, e.target.value)}
        />
        {isFieldEmpty && (
          <div class="mb-1">
            <span class="text-xs text-red-600 font-medium">
              {label} must be filled out.
            </span>
          </div>
        )}
      </div>
    );
  }

  private isValidBillingAddress(obj: any) {
    return (
      obj &&
      typeof obj?.billingAddress1 === 'string' &&
      typeof obj?.billingCity === 'string' &&
      typeof obj?.billingState === 'string' &&
      typeof obj?.billingZipcode === 'string'
    );
  }

  render() {
    const isPassedAddressIsValid =
      this.billingAddress &&
      JSON.parse(this.billingAddress) &&
      this.isValidBillingAddress(JSON.parse(this.billingAddress));
    const isSubmittedAddressValid =
      this.billingForm &&
      this.isValidBillingAddress(this.billingForm) &&
      !this.isFormEditable;

    if (isPassedAddressIsValid || isSubmittedAddressValid) {
      return (
        <Host>
          <div class="p-5 bg-gray-50 border border-secondary-stroke rounded-lg my-4">
            <h2 class="text-gray-900 font-semibold text-md">
              Billing information{' '}
              <span>
                <common-icon name="edit"></common-icon>
              </span>
            </h2>
            <div>
              <h5 class="text-gray-600 text-sm">
                {this.billingForm.billingName}
              </h5>
              <h5 class="text-gray-600 text-sm">
                {this.billingForm.billingEmail}
              </h5>
              <h5 class="text-gray-600 text-sm">
                {this.billingForm.billingAddress1}{' '}
                {this.billingForm.billingAddress2}
              </h5>
              <h5 class="text-gray-600 text-sm">
                {this.billingForm.billingState
                  ? this.billingForm.billingCity + ', '
                  : this.billingForm.billingCity}
                {this.billingForm.billingState}{' '}
                {this.billingForm.billingZipcode}
              </h5>
            </div>
            {!isPassedAddressIsValid && (
              <common-button
                variant="secondary"
                size="small"
                classNames="mt-4 w-full"
                onClick={() => this.handleEdit()}
              >
                Edit
              </common-button>
            )}
          </div>
        </Host>
      );
    }

    return (
      <div class="my-4">
        <h2 class="text-gray-900 font-semibold text-md pb-4">
          Billing information
        </h2>{' '}
        <label class="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
          Address
        </label>
        <div class="grid">
          {this.renderInput('Address', 'billingAddress1')}
          {this.renderInput('Apt, Suite (Optional)', 'billingAddress2')}
          <div class="grid gap-6 grid-cols-2">
            {this.renderInput('City', 'billingCity')}
            {this.renderInput('Zip code', 'billingZipcode')}
          </div>
          <select
            id="countries"
            class="mb-4 bg-gray-50 border border-gray-300 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"
            onInput={(e: any) =>
              this.handleChange('billingState' as any, e.target.value)
            }
          >
            <option value="">Choose a state</option>
            {CONSTANTS.states.map((state) => (
              <option
                value={state}
                selected={state === this.billingForm.billingState}
              >
                {state}
              </option>
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
