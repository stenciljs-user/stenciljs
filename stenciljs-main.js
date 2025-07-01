import {
  Component,
  h,
  State,
  Prop,
  Watch,
} from '@stencil/core';
import { createMerchantTransactionSetup } from '../../services/merchantTransactionSetup/createMerchantTransactionSetup';
import {
  AlertMessageType,
  PaymentStatus,
} from '../../utils/enums';
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
  /**
   * Configuration Props
   */
  @Prop() sourceMerchantId!: string;
  @Prop() partnerId!: string;
  @Prop() totalAmount: number = 10;
  @Prop() transactionReferenceId!: string;
  @Prop() primaryColor?: string;
  @Prop() buttonTextColor?: string;
  @Prop() borderRadius?: string;
  @Prop() orderSummary!: string;
  @Prop() billingAddress?: string;
  @Prop() shippingAddress?: string;

  /**
   * State Management
   */
  @State() transactionSetupResponse?: TransactionSetupResponse;
  @State() transactionStatus?: PaymentStatus;
  @State() loading: boolean = false;
  @State() error: boolean = false;
  @State() disabledPaymentMethod: boolean = true;
  @State() hasSameBillingAddressChecked: boolean = false;
  @State() paymentMethod?: string;

  /**
   * Watcher for setting up hosted payment page when setup response updates
   */
  @Watch('transactionSetupResponse')
  handleTransactionSetupChange(): void {
    this.setupHostedPaymentPage();
  }

  componentWillLoad(): void {
    this.disabledPaymentMethod = !this.hasValidBillingAddress;
  }

  componentDidLoad(): void {
    this.loadHostedPaymentLibrary();
  }

  private get hasValidBillingAddress(): boolean {
    if (!this.billingAddress) return false;
    try {
      const parsed = JSON.parse(this.billingAddress);
      return this.isValidBillingAddress(parsed);
    } catch (err) {
      return false;
    }
  }

  private isValidBillingAddress(obj: any): boolean {
    return (
      !!obj &&
      typeof obj?.billingAddress1 === 'string' &&
      typeof obj?.billingCity === 'string' &&
      typeof obj?.billingState === 'string' &&
      typeof obj?.billingZipcode === 'string'
    );
  }

  private setLoading = (isLoading: boolean): void => {
    this.loading = isLoading;
  };

  private setError = (isError: boolean): void => {
    this.error = isError;
  };

  private async loadTransactionSetup(): Promise<void> {
    try {
      const billingParsed: BillingAddress = this.hasValidBillingAddress
        ? JSON.parse(this.billingAddress!)
        : ({} as BillingAddress);

      this.transactionSetupResponse = await createMerchantTransactionSetup({
        totalAmount: this.totalAmount,
        referenceId: this.transactionReferenceId,
        billingAddress: billingParsed,
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
    } catch (err) {
      this.setError(true);
    }
  }

  private loadHostedPaymentLibrary(): void {
    this.setLoading(true);
    const script = document.createElement('script');
    script.src =
      'https://payments.worldpay.com/resources/hpp/integrations/embedded/js/hpp-embedded-integration-library.js';
    script.async = true;
    script.onload = () => this.setLoading(false);
    script.onerror = () => this.setError(true);
    document.head.appendChild(script);
  }

  private setupHostedPaymentPage(): void {
    if (!window['WPCL'] || !this.transactionSetupResponse?.transactionSetupUrl)
      return;

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
        }
      },
    });
  }

  private getAlertMessageContent(): JSX.Element | null {
    const { paymentSuccessMessage, cardErrorMessage, sessionExpiredMessage, transactionSetupFailure } = CONSTANTS;
    const status = this.transactionStatus;
    const showAlert =
      (status === PaymentStatus.SUCCESS ||
        status === PaymentStatus.FAILURE ||
        status === PaymentStatus.ERROR ||
        status === PaymentStatus.EXCEPTION ||
        status === PaymentStatus.SESSION_EXPIRED ||
        (this.error && this.paymentMethod)) &&
      this.transactionSetupResponse;

    if (!showAlert) return null;

    let type = AlertMessageType.DANGER;
    let message = '';

    switch (status) {
      case PaymentStatus.SUCCESS:
        type = AlertMessageType.SUCCESS;
        message = paymentSuccessMessage;
        break;
      case PaymentStatus.SESSION_EXPIRED:
        message = sessionExpiredMessage;
        break;
      case PaymentStatus.FAILURE:
      case PaymentStatus.ERROR:
      case PaymentStatus.EXCEPTION:
        message = cardErrorMessage;
        break;
      default:
        message = transactionSetupFailure;
        break;
    }

    return (
      <div class="pt-3 pb-4">
        <common-alert type={type} message={message}></common-alert>
      </div>
    );
  }

  private handleBillingAddressSubmit = (e: CustomEvent): void => {
    this.billingAddress = JSON.stringify(e.detail);
    this.disabledPaymentMethod = false;
  };

  private handleBillingAddressCopied = (e: CustomEvent): void => {
    this.billingAddress = JSON.stringify(e.detail);
    this.disabledPaymentMethod = false;
    this.hasSameBillingAddressChecked = true;
  };

  render() {
    return (
      <div class="min-h-screen grid place-items-center content-start mt-4 px-3">
        <div
          class={`sm:w-[449px] bg-white border border-secondary-stroke rounded-xl min-h-[660px] p-8 ${
            this.loading && !this.error ? 'content-center' : 'content-top'
          }`}
        >
          {this.getAlertMessageContent()}

          <h4 class="font-semibold text-2xl pb-4">Checkout</h4>

          <order-summary
            order-summary={this.orderSummary}
            total-amount={this.totalAmount}
          ></order-summary>

          <shipping-address
            shipping-address={this.shippingAddress}
            billing-address={this.billingAddress}
            hasBillingAddress={this.hasValidBillingAddress}
            onBillingAddressCopied={this.handleBillingAddressCopied}
          ></shipping-address>

          {!this.hasSameBillingAddressChecked && !this.hasValidBillingAddress && (
            <billing-address
              billing-address={this.billingAddress}
              onHandleBillingAddressSubmit={this.handleBillingAddressSubmit}
            ></billing-address>
          )}

          <h4 class="font-semibold text-lg py-4">Payment methods</h4>

          <div class="grid gap-6">
            <div class={`grid p-4 border rounded-lg ${this.transactionSetupResponse ? 'border-gray-700 border-2' : 'border-gray-200'}`}>
              <div class="flex items-center">
                <input
                  id="card-payment-method"
                  type="radio"
                  name="payment-method"
                  disabled={this.disabledPaymentMethod}
                  onClick={() => this.loadTransactionSetup()}
                  class="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                />
                <label htmlFor="card-payment-method" class="ml-2 text-sm font-medium">
                  Credit or debit card <app-icon name="card-icon" class="ml-auto"></app-icon>
                </label>
              </div>
              {this.loading && !this.error && (
                <div class="text-center px-4 py-8">
                  <common-loader></common-loader>
                </div>
              )}
              <div id="hpp-payment-component"></div>
            </div>

            <div class="flex items-center p-4 border border-gray-200 rounded-lg">
              <input
                id="ach-payment-method"
                type="radio"
                name="payment-method"
                disabled={this.disabledPaymentMethod}
                class="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
              />
              <label htmlFor="ach-payment-method" class="ml-2 text-sm font-medium">
                ACH <app-icon name="building-icon" class="ml-auto"></app-icon>
              </label>
            </div>
          </div>
        </div>
      </div>
    );
  }
}
