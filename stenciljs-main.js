import { Component, Host, h, Prop, Event, EventEmitter } from '@stencil/core';

interface ShippingAddressType {
  shippingName: string;
  shippingEmail: string;
  shippingAddress1: string;
  shippingCity: string;
  shippingState: string;
  shippingZipcode: string;
}

interface BillingAddressType {
  billingName?: string;
  billingEmail?: string;
  billingAddress1?: string;
  billingCity?: string;
  billingState?: string;
  billingZipcode?: string;
}

@Component({
  tag: 'shipping-address',
  styleUrl: 'shipping-address.css',
  shadow: true,
})
export class ShippingAddress {
  /** JSON string of shipping address */
  @Prop() shippingAddress: string;

  /** Flag indicating if billing address is already available */
  @Prop() hasBillingAddress: boolean = false;

  /** Emits billing address when checkbox is clicked */
  @Event() billingAddressCopied: EventEmitter<BillingAddressType>;

  /**
   * Converts a shipping address object to billing address format
   * @param shipping Shipping address object
   * @returns Billing address object
   */
  private convertShippingToBilling(shipping: ShippingAddressType): BillingAddressType {
    const billing: BillingAddressType = {};
    for (const key in shipping) {
      if (shipping.hasOwnProperty(key)) {
        const billingKey = key.replace(/^shipping/, 'billing') as keyof BillingAddressType;
        billing[billingKey] = shipping[key];
      }
    }
    return billing;
  }

  /**
   * Handles checkbox click to emit converted billing address
   * @param address Parsed shipping address
   */
  private onBillingCheckboxClick(address: ShippingAddressType) {
    const billingAddress = this.convertShippingToBilling(address);
    this.billingAddressCopied.emit(billingAddress);
  }

  /**
   * Parses and validates the shipping address
   * @returns Valid shipping address or null
   */
  private get parsedShippingAddress(): ShippingAddressType | null {
    try {
      const parsed = JSON.parse(this.shippingAddress);
      const requiredFields = ['shippingAddress1', 'shippingCity', 'shippingState', 'shippingZipcode'];
      const isValid = requiredFields.every(field => typeof parsed[field] === 'string');
      return isValid ? parsed : null;
    } catch {
      return null;
    }
  }

  render() {
    const address = this.parsedShippingAddress;

    if (!address) return null;

    return (
      <Host>
        <div class="p-5 bg-gray-50 border border-secondary-stroke rounded-lg dark:bg-gray-800 dark:border-gray-700 my-4">
          <h2 class="text-gray-900 font-semibold text-md">Shipping Information</h2>

          <div>
            <p class="text-gray-600 text-sm">{address.shippingName}</p>
            <p class="text-gray-600 text-sm">{address.shippingEmail}</p>
            <p class="text-gray-600 text-sm">{address.shippingAddress1}</p>
            <p class="text-gray-600 text-sm">
              {address.shippingCity}, {address.shippingState} {address.shippingZipcode}
            </p>
          </div>

          {!this.hasBillingAddress && (
            <div class="flex items-center my-2">
              <input
                id="billing-same-checkbox"
                type="checkbox"
                aria-checked="false"
                onClick={() => this.onBillingCheckboxClick(address)}
                class="w-4 h-4 text-gray-600 bg-gray-100 border-gray-300 rounded-sm focus:ring-blue-500 focus:ring-2"
              />
              <label
                htmlFor="billing-same-checkbox"
                class="ms-2 text-sm font-medium text-gray-900 dark:text-gray-300"
              >
                Billing address is the same as shipping address
              </label>
            </div>
          )}
        </div>
      </Host>
    );
  }
}
