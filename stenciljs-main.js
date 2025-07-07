import { Component, h, State, Prop, Watch } from '@stencil/core';
import { createMerchantTransactionSetup } from '../../services/merchantTransactionSetup/createMerchantTransactionSetup';
import { AlertMessageType, PaymentStatus } from '../../utils/enums';
import { CONSTANTS } from '../../utils/constant';
import type {
  BillingAddress,
  HppTransactionResponse,
  ShippingAddress,
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
  @Prop() successUrl: string;
 
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
    Iif (window['WPCL'] && this.transactionSetupResponse?.transactionSetupUrl) {
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
          if (
            this.transactionStatus === PaymentStatus.SUCCESS &&
            this.successUrl
          ) {
            window.location.href = this.successUrl;
          } else Iif (this.transactionStatus === PaymentStatus.SESSION_EXPIRED) {
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
 
  resetComponent() {
    this.transactionSetupResponse = {};
    this.transactionStatus = undefined;
    this.loading = false;
    this.error = false;
    this.disabledPaymentMethod = false;
    this.hasSameBillingAddressChecked = true;
    this.paymentMethod = '';
 
    document.getElementById('payment-alert-message')?.focus();
  }
 
  private get hasValidBillingAddress() {
    return !!(
      this.billingAddress &&
      typeof this.billingAddress === 'string' &&
      JSON.parse(this.billingAddress) &&
      this.isValidBillingAddress(JSON.parse(this.billingAddress))
    );
  }
 
  private isValidBillingAddress(obj: BillingAddress) {
    return !!(
      obj &&
      typeof obj?.billingAddress1 === 'string' &&
      typeof obj?.billingCity === 'string' &&
      typeof obj?.billingState === 'string' &&
      typeof obj?.billingZipcode === 'string'
    );
  }
 
  private get hasValidShippingAddress() {
    return !!(
      this.shippingAddress &&
      typeof this.shippingAddress === 'string' &&
      JSON.parse(this.shippingAddress) &&
      this.isValidShippingAddress(JSON.parse(this.shippingAddress))
    );
  }
 
  private isValidShippingAddress(obj: ShippingAddress) {
    return !!(
      obj &&
      typeof obj?.shippingAddress1 === 'string' &&
      typeof obj?.shippingCity === 'string' &&
      typeof obj?.shippingState === 'string' &&
      typeof obj?.shippingZipcode === 'string'
    );
  }
 
  private async loadTransactionSetup() {
    this.transactionSetupResponse = await createMerchantTransactionSetup({
      totalAmount: this.totalAmount,
      referenceId: this.transactionReferenceId,
      billingAddress: this.hasValidBillingAddress
        ? JSON.parse(this.billingAddress)
        : (this.billingAddress as BillingAddress),
      shippingAddress: this.hasValidShippingAddress
        ? JSON.parse(this.shippingAddress)
        : (this.shippingAddress as ShippingAddress),
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
    const type = AlertMessageType.DANGER;
    if (
      this.transactionStatus === PaymentStatus.FAILURE ||
      this.transactionStatus === PaymentStatus.ERROR ||
      this.transactionStatus === PaymentStatus.EXCEPTION
    ) {
      message = CONSTANTS.cardErrorMessage;
      this.resetComponent();
    } else if (this.transactionStatus === PaymentStatus.SESSION_EXPIRED) {
      message = CONSTANTS.sessionExpiredMessage;
    } else Iif (
      (this.error || !this.transactionSetupResponse?.transactionSetupUrl) &&
      this.paymentMethod &&
      !this.loading
    ) {
      message = CONSTANTS.transactionSetupFailure;
    } else {
      return null;
    }
 
    return (
      <div class="pt-[12px] pb-4">
        <common-alert
          id="payment-alert-message"
          type={type}
          auto-focus={true}
          message={message}
        ></common-alert>
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
 
  private onHandleBillingAddressEdit() {
    this.paymentMethod = '';
    this.disabledPaymentMethod = true;
  }
 
  private onBillingAddressCopiedReset() {
    this.paymentMethod = '';
    this.disabledPaymentMethod = true;
    this.billingAddress = '';
    this.hasSameBillingAddressChecked = false;
  }
 
  private get isPaymentSuccess(): boolean {
    return this.transactionStatus === PaymentStatus.SUCCESS;
  }
 
  render() {
    return (
      <div class="min-h-screen grid place-items-center content-start mt-4 px-3">
        <div
          class={`sm:w-[460px] md:w-[460px] lg:w-[460px] xl:w-[460px] rounded-xl border-secondary-stroke  bg-white min-h-[660px] p-8 ${
            this.loading && !this.error ? 'content-center' : 'content-top'
          }`}
        >
          {!this.isPaymentSuccess && (
            <div>
              {this.getStatusAlertMessage()}
              <h4 class="font-semibold text-2xl leading-[120%] pb-4">
                Checkout
              </h4>
              <order-summary
                order-summary={this.orderSummary}
                total-amount={this.totalAmount}
              ></order-summary>
              <shipping-address
                shipping-address={this.shippingAddress}
                billing-address={this.billingAddress}
                hasBillingAddress={this.hasValidBillingAddress}
                onBillingAddressCopied={(e) => this.onBillingAddressCopied(e)}
                onBillingAddressCopiedReset={() =>
                  this.onBillingAddressCopiedReset()
                }
              ></shipping-address>
              {!this.hasSameBillingAddressChecked &&
                !this.hasValidBillingAddress && (
                  <billing-address
                    billing-address={this.billingAddress}
                    onHandleBillingAddressSubmit={(e) =>
                      this.onHandleBillingAddressSubmit(e)
                    }
                    onHandleBillingAddressEdit={() =>
                      this.onHandleBillingAddressEdit()
                    }
                  ></billing-address>
                )}
              <h4 class="font-semibold text-lg leading-[120%] py-4">
                Payment methods
              </h4>
              <div class="grid gap-4 mb-8">
                <div
                  class={`grid grid-cols-1 items-center p-4 rounded-lg cursor-pointer ${
                    this.transactionSetupResponse &&
                    this.paymentMethod === 'card'
                      ? 'border-2 border-gray-700'
                      : 'border border-gray-200'
                  } ${this.disabledPaymentMethod ? 'text-gray-500' : ''}`}
                >
                  <div class="flex items-center">
                    <input
                      id="card-payment-method"
                      type="radio"
                      checked={this.paymentMethod === 'card'}
                      value={this.paymentMethod}
                      name="payment-method"
                      disabled={this.disabledPaymentMethod}
                      onClick={() => {
                        this.paymentMethod = 'card';
                        this.loadTransactionSetup();
                      }}
                      class="w-4.5 h-4.5 text-gray-600 bg-gray-100 border-gray-300 focus:ring-gray-500 cursor-pointer"
                    />
                    <label
                      htmlFor="card-payment-method"
                      class="flex justify-between items-center w-full ms-2 text-base font-medium cursor-pointer"
                    >
                      Credit or debit card{' '}
                      <p class="text-right">
                        <app-icon
                          name="card-icon"
                          class={`${
                            this.disabledPaymentMethod
                              ? 'text-gray-500'
                              : 'text-gray-900'
                          }`}
                        ></app-icon>
                      </p>
                    </label>
                  </div>
                  {this.loading && !this.error && (
                    <div class="text-center px-4 py-8">
                      <common-loader></common-loader>
                    </div>
                  )}
                  {this.paymentMethod === 'card' && (
                    <div id="hpp-payment-component"></div>
                  )}
                </div>
                <div
                  class={`flex items-center p-4 border border-gray-200 rounded-lg cursor-pointer ${
                    this.disabledPaymentMethod ? 'text-gray-500' : ''
                  }`}
                >
                  <input
                    id="ach-payment-method"
                    type="radio"
                    value={this.paymentMethod}
                    disabled={this.disabledPaymentMethod}
                    checked={this.paymentMethod === 'ach'}
                    name="payment-method"
                    onClick={() => {
                      this.paymentMethod = 'ach';
                    }}
                    class="w-4.5 h-4.5 text-gray-600 bg-gray-100 border-gray-300 focus:ring-gray-500 focus:ring-2 cursor-pointer"
                  />
                  <label
                    htmlFor="ach-payment-method"
                    class="flex justify-between items-center w-full ms-2 text-base font-medium cursor-pointer"
                  >
                    ACH
                    <p class={`text-right`}>
                      <app-icon
                        name="building-icon"
                        class={`${
                          this.disabledPaymentMethod
                            ? 'text-gray-500'
                            : 'text-gray-900'
                        }`}
                      ></app-icon>
                    </p>
                  </label>
                </div>
              </div>
            </div>
          )}
          {this.isPaymentSuccess && (
            <div class="w-full max-w-md bg-white border border-gray-200 rounded-lg shadow-sm dark:bg-gray-800 dark:border-gray-700 p-12">
              <div class="flex flex-col items-center">
                <app-icon name="badge-icon"></app-icon>
                <h5 class="leading-10 text-3xl font-bold text-gray-900">
                  Payment Successful!
                </h5>
                <h2 class="text-lg text-gray-600 dark:text-white">
                  Thank you for your purchase.
                </h2>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }
}
