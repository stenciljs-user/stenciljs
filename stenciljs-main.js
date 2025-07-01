import { Component, Host, h, Prop, Event, EventEmitter } from '@stencil/core';

@Component({
  tag: 'shipping-address',
  styleUrl: 'shipping-address.css',
  shadow: true,
})
export class ShippingAddress {
  @Prop() shippingAddress: any;
  @Prop() hasBillingAddress: boolean;

  /**
   * Fires when the shipping address same checkbox is clicked
   */
  @Event() handleBillingAddressCheck: EventEmitter<any>;

  private isValidShippingAddress(obj: any) {
    return (
      obj &&
      typeof obj?.shippingAddress1 === 'string' &&
      typeof obj?.shippingCity === 'string' &&
      typeof obj?.shippingState === 'string' &&
      typeof obj?.shippingZipcode === 'string'
    );
  }

  private convertShippingToBilling(shippingAddress) {
    const billingAddress = {};

    for (const key in shippingAddress) {
      if (shippingAddress.hasOwnProperty(key)) {
        const billingKey = key.replace(/^shipping/, 'billing');
        billingAddress[billingKey] = shippingAddress[key];
      }
    }

    return billingAddress;
  }

  private handleBillingAddressCheckbox(shippingAddressParsed) {
    const billingAddress = this.convertShippingToBilling(shippingAddressParsed);
    this.handleBillingAddressCheck.emit(billingAddress);
  }

  render() {
    const shippingAddressParsed = JSON.parse(this.shippingAddress);
    const isShippingAddressValid =
      this.shippingAddress &&
      shippingAddressParsed &&
      !this.isValidShippingAddress(shippingAddressParsed);
    if (isShippingAddressValid) {
      return null;
    }

    return (
      <Host>
        <div class="p-5 bg-gray-50 border border-secondary-stroke rounded-lg dark:bg-gray-800 dark:border-gray-700 my-4">
          <h2 class="text-gray-900 font-semibold text-md">
            Shipping and shipping information
          </h2>
          <div>
            <h5 class="text-gray-600 text-sm">
              {shippingAddressParsed?.shippingName}
            </h5>
            <h5 class="text-gray-600 text-sm">
              {shippingAddressParsed?.shippingEmail}
            </h5>
            <h5 class="text-gray-600 text-sm">
              {' '}
              {shippingAddressParsed?.shippingAddress1}
            </h5>
            <h5 class="text-gray-600 text-sm">
              {shippingAddressParsed?.shippingCity} {', '}
              {shippingAddressParsed?.shippingState}
              {shippingAddressParsed?.shippingZipcode}
            </h5>
          </div>
          {!this.hasBillingAddress && (
            <div class="flex items-center my-2">
              <input
                id="default-checkbox"
                type="checkbox"
                value=""
                onClick={() =>
                  this.handleBillingAddressCheckbox(shippingAddressParsed)
                }
                class="w-4 h-4 text-gray-600 bg-gray-100 border-gray-300 rounded-sm focus:ring-blue-500focus:ring-2"
              ></input>
              <label class="ms-2 text-sm font-medium text-gray-900 dark:text-gray-300">
                Billing address is the same as shipping address
              </label>
            </div>
          )}
        </div>
      </Host>
    );
  }
}
