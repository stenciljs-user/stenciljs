import { Component, h, State, Prop, Watch } from '@stencil/core';
import { createMerchantTransactionSetup } from '../../services/merchantTransactionSetup/createMerchantTransactionSetup';
import { AlertMessageType, PaymentStatus } from '../../utils/enums';
import { CONSTANTS } from '../../utils/constant';
import type {
  BillingAddress,
  HppTransactionResponse,
  TransactionSetupResponse,
} from '../../utils/types';

@Component({
  tag: 'payment-processing',
  styleUrl: 'payment-processing.css',
  shadow: false,
})
export class PaymentProcessing {
  @Prop() sourceMerchantId: string;
  @Prop() partnerId: string;
  @Prop() totalAmount: number = 10;
  @Prop() transactionReferenceId: string;
  @Prop() primaryColor: string;
  @Prop() buttonTextColor: string;
  @Prop() borderRadius: string;
  @Prop() orderSummary: string;
  @Prop() billingAddress: string;
  @Prop() shippingAddress: string;

  @State() transactionSetupResponse: TransactionSetupResponse;
  @State() transactionStatus: PaymentStatus;
  @State() loading: boolean = false;
  @State() error: boolean = false;
  @State() disabledPaymentMethod: boolean = true;
  @State() hasSameBillingAddressChecked: boolean = false;
  @State() paymentMethod: string;

  private setLoading = (isLoading: boolean) => {
    this.loading = isLoading;
  };

  private setError = (isError: boolean) => {
    this.error = isError;
  };

  @Watch('transactionSetupResponse')
  private setupHostedPaymentPage() {
    this.setLoading(true);
    if (window['WPCL'] && this.transactionSetupResponse?.transactionSetupUrl) {
      const library = new window['WPCL'].Library();
      library.setup({
        url: this.transactionSetupResponse.transactionSetupUrl,
        type: 'iframe',
        inject: 'immediate',
        target: 'hpp-payment-component',
        accessibility: true,
        debug: true,
        language: 'en',
        resultCallback: async (result: HppTransactionResponse) => {
          this.transactionStatus = result.order.status;
          if (this.transactionStatus === PaymentStatus.SESSION_EXPIRED) {
            await this.loadTransactionSetup();
            this.setupHostedPaymentPage();
          }
        },
      });
      this.setLoading(false);
    }
  }

  componentWillLoad() {
    // Check if passed billing address valid and enabled payment method
    this.disabledPaymentMethod = !this.hasValidBillingAddress;
  }

  componentDidLoad(): void {
    this.loadHostedPaymentLibrary();
  }

  private get hasValidBillingAddress() {
    return !!(
      this.billingAddress &&
      typeof this.billingAddress === 'string' &&
      JSON.parse(this.billingAddress) &&
      this.isValidBillingAddress(JSON.parse(this.billingAddress))
    );
  }

  private isValidBillingAddress(obj: any) {
    return !!(
      obj &&
      typeof obj?.billingAddress1 === 'string' &&
      typeof obj?.billingCity === 'string' &&
      typeof obj?.billingState === 'string' &&
      typeof obj?.billingZipcode === 'string'
    );
  }

  private async loadTransactionSetup() {
    this.transactionSetupResponse = await createMerchantTransactionSetup({
      totalAmount: this.totalAmount,
      referenceId: this.transactionReferenceId,
      // TODO: uncomment and send as part of payload
      billingAddress: this.hasValidBillingAddress
        ? JSON.parse(this.billingAddress)
        : (this.billingAddress as BillingAddress),
      // shippingAddress: this.shippingAddress,
      styleConfig: {
        primaryColor: this.primaryColor,
        buttonTextColor: this.buttonTextColor,
        borderRadius: this.borderRadius,
      },
      sourceMerchantId: this.sourceMerchantId,
      partnerId: this.partnerId,
      setLoading: this.setLoading,
      setError: this.setError,
    });
    // this.setupHostedPaymentPage();
  }

  private loadHostedPaymentLibrary() {
    this.setLoading(true);
    const script = document.createElement('script');
    script.src =
      'https://payments.worldpay.com/resources/hpp/integrations/embedded/js/hpp-embedded-integration-library.js';
    script.async = true;
    script.onload = () => {
      this.setLoading(false);
    };
    script.onerror = function () {
      // Code to execute if the script fails to load
      this.setLoading(false);
      this.setError(true);
    };

    document.head.appendChild(script);
  }

  // TODO: Add detailed error handling and user-friendly messages for various transaction failure scenarios.
  private getStatusAlertMessage() {
    let message = '';
    let type = AlertMessageType.DANGER;
    if (this.transactionStatus === PaymentStatus.SUCCESS) {
      message = CONSTANTS.paymentSuccessMessage;
      type = AlertMessageType.SUCCESS;
    } else if (
      this.transactionStatus === PaymentStatus.FAILURE ||
      this.transactionStatus === PaymentStatus.ERROR ||
      this.transactionStatus === PaymentStatus.EXCEPTION
    ) {
      message = CONSTANTS.cardErrorMessage;
    } else if (this.transactionStatus === PaymentStatus.SESSION_EXPIRED) {
      message = CONSTANTS.sessionExpiredMessage;
    } else if (
      (this.error || !this.transactionSetupResponse?.transactionSetupUrl) &&
      this.paymentMethod
    ) {
      message = CONSTANTS.transactionSetupFailure;
    } else {
      return null;
    }

    return (
      <div class="pt-[12px] pb-4">
        <common-alert type={type} message={message}></common-alert>
      </div>
    );
  }

  private onHandleBillingAddressSubmit(e: any) {
    this.billingAddress = e.detail;
    this.disabledPaymentMethod = false;
  }

  private onBillingAddressCopied(e: any) {
    this.billingAddress = e.detail;
    this.disabledPaymentMethod = false;
    this.hasSameBillingAddressChecked = true;
  }

  render() {
    return (
      <div class="min-h-screen grid place-items-center content-start mt-4 px-3">
        <div
          class={`sm:w-[449px] md:w-[449px] lg:w-[449px] xl:w-[449px] rounded-xl border-secondary-stroke  bg-white min-h-[660px] p-8 ${
            this.loading && !this.error ? 'content-center' : 'content-top'
          }`}
        >
          {this.getStatusAlertMessage()}
          <h4 class="font-semibold text-2xl leading-[120%] pb-4">Checkout</h4>
          <order-summary
            order-summary={this.orderSummary}
            total-amount={this.totalAmount}
          ></order-summary>
          <shipping-address
            shipping-address={this.shippingAddress}
            billing-address={this.billingAddress}
            hasBillingAddress={this.hasValidBillingAddress}
            onBillingAddressCopied={(e) => this.onBillingAddressCopied(e)}
          ></shipping-address>
          {!this.hasSameBillingAddressChecked &&
            !this.hasValidBillingAddress && (
              <billing-address
                billing-address={this.billingAddress}
                onHandleBillingAddressSubmit={(e) =>
                  this.onHandleBillingAddressSubmit(e)
                }
              ></billing-address>
            )}
          <h4 class="font-semibold text-lg leading-[120%] py-4">
            Payment methods
          </h4>
          <div class="grid gap-6">
            <div
              class={`grid grid-cols-1 items-center p-4 border border-gray-200 rounded-lg dark:border-gray-700 ${
                this.transactionSetupResponse && 'border-2 border-gray-700'
              }`}
            >
              <div class="flex items-center">
                <input
                  id="card-payment-method"
                  type="radio"
                  value={this.paymentMethod}
                  name="payment-method"
                  disabled={this.disabledPaymentMethod}
                  onClick={() => {
                    this.loadTransactionSetup();
                  }}
                  class="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
                />
                <label
                  htmlFor="card-payment-method"
                  class="flex justify-between items-center w-full ms-2 text-sm font-medium text-gray-900 dark:text-gray-300"
                >
                  Credit or debit card{' '}
                  <p class="text-right">
                    <app-icon name="card-icon" class="text-right"></app-icon>
                  </p>
                </label>
              </div>
              {this.loading && !this.error && (
                <div class="text-center px-4 py-8">
                  <common-loader></common-loader>
                </div>
              )}
              {<div id="hpp-payment-component"></div>}
            </div>
            <div class="flex items-center p-4 border border-gray-200 rounded-lg dark:border-gray-700">
              <input
                id="ach-payment-method"
                type="radio"
                value={this.paymentMethod}
                disabled={this.disabledPaymentMethod}
                name="payment-method"
                class="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
              />
              <label
                htmlFor="ach-payment-method"
                class="flex justify-between items-center w-full ms-2 text-sm font-medium text-gray-900 dark:text-gray-300"
              >
                ACH
                <p class="text-right">
                  <app-icon name="building-icon" class="text-right"></app-icon>
                </p>
              </label>
            </div>
          </div>
        </div>
      </div>
    );
  }
}
