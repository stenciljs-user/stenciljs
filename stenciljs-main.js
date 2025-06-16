import { Component, h, State, Prop, Watch } from '@stencil/core';
import { initiatePaymentSession, PaymentPayload } from '../../api/initiate-payment-api';

@Component({
  tag: 'payment-iframe',
  styleUrl: 'payment-iframe.css',
  shadow: false,
})
export class PaymentIframeComponent {
  @Prop() accountId: string;
  @Prop() merchantId: string;
  @Prop() accountToken: string;
  @Prop() amount: string;
  @Prop() returnUrl: string;
  @Prop() logoUrl: string;
  @Prop() tagline: string;
  @Prop() companyName: string;
  @Prop() embedded: number = 0;
  @Prop() customCss: string;
  @Prop() title: string;

  @State() iframeUrl: string = '';
  @State() paymentResponse: any = null;

  @Watch('amount')
  async onAmountChange(): Promise<void> {
    await this.initializePayment();
  }

  async componentWillLoad(): Promise<void> {
    await this.initializePayment();
  }

  private async initializePayment(): Promise<void> {
    const payload: PaymentPayload = {
      amount: this.amount,
      returnURL: this.returnUrl,
      logoURL: this.logoUrl,
      customCss: this.customCss,
      embedded: this.embedded,
      title: this.title,
      tagline: this.tagline,
      companyName: this.companyName,
      accountId: this.accountId,
      merchantId: this.merchantId,
      accountToken: this.accountToken,
    };

    try {
      const response = await initiatePaymentSession(payload);
      const transactionSetupID = response?.TransactionSetupResponse?.TransactionSetupID;
      if (transactionSetupID) {
        this.iframeUrl = `https://certpayments.elementexpress.com/express.asmx/hpp/${transactionSetupID}`;
      } else {
        console.warn('TransactionSetupID not returned in response');
      }
    } catch (error) {
      console.error('Payment session initialization failed:', error);
    }
  }

  componentDidLoad(): void {
    if (window['WPCL'] && this.iframeUrl) {
      const library = new window['WPCL'].Library();
      library.setup({
        url: this.iframeUrl,
        type: 'iframe',
        inject: 'immediate',
        target: 'custom-html',
        accessibility: true,
        debug: true,
        language: 'en',
        resultCallback: (result: any) => {
          this.paymentResponse = result;
        },
      });
    }
  }

  render() {
    return (
      <div>
        {!this.paymentResponse && <div id="custom-html"></div>}
        {this.paymentResponse && (
          <div>
            <h4>Payment Result:</h4>
            <pre>{JSON.stringify(this.paymentResponse, null, 2)}</pre>
          </div>
        )}
      </div>
    );
  }
}



import { updateXmlValues, xmlToObject, ExpressHPA_1 } from '../../utils/xml-utils';

export interface PaymentPayload {
  amount: string;
  returnURL: string;
  logoURL?: string;
  customCss?: string;
  embedded?: number;
  title?: string;
  tagline?: string;
  companyName?: string;
  accountId: string;
  merchantId: string;
  accountToken: string;
}

/**
 * Initiates a Worldpay Express hosted payment session.
 * @param payload - Configuration data for the payment setup request.
 * @returns Parsed object response from Worldpay API.
 */
export const initiatePaymentSession = async (payload: PaymentPayload): Promise<any> => {
  const updates = {
    TransactionAmount: payload.amount,
    AccountID: payload.accountId,
    AccountToken: payload.accountToken,
    AcceptorID: payload.merchantId,
    ApplicationID: '20437',
    ReturnURL: payload.returnURL,
    HostedCustomization: payload.customCss ?? '',
    Embedded: (payload.embedded ?? 0).toString(),
    LogoURL: payload.logoURL ?? '',
    WelcomeMessage: payload.title ?? '',
    Tagline: payload.tagline ?? '',
    CompanyName: payload.companyName ?? 'Payment App',
  };

  const requestBody = updateXmlValues(ExpressHPA_1, updates);

  const response = await fetch('https://certtransaction.elementexpress.com', {
    method: 'POST',
    headers: {
      'Content-Type': 'text/xml',
    },
    body: requestBody,
  });

  if (!response.ok) {
    throw new Error(`Failed to initiate payment session. Status: ${response.status}`);
  }

  const xmlText = await response.text();
  const parser = new DOMParser();
  const xmlDoc = parser.parseFromString(xmlText, 'text/xml');
  return xmlToObject(xmlDoc);
};



/**
 * Converts an XML DOM structure into a JavaScript object.
 */
export const xmlToObject = (xml: any): any => {
  let obj: any = {};

  if (xml.nodeType === 1 && xml.attributes.length > 0) {
    obj['@attributes'] = {};
    for (let j = 0; j < xml.attributes.length; j++) {
      const attr = xml.attributes.item(j);
      obj['@attributes'][attr.nodeName] = attr.nodeValue;
    }
  } else if (xml.nodeType === 3) {
    obj = xml.nodeValue;
  }

  if (xml.hasChildNodes()) {
    for (let i = 0; i < xml.childNodes.length; i++) {
      const item = xml.childNodes.item(i);
      const nodeName = item.nodeName;
      if (!obj[nodeName]) {
        obj[nodeName] = xmlToObject(item);
      } else {
        if (!Array.isArray(obj[nodeName])) {
          obj[nodeName] = [obj[nodeName]];
        }
        obj[nodeName].push(xmlToObject(item));
      }
    }
  }

  return obj;
};

/**
 * Replaces a specific tag's content inside an XML string.
 */
function replaceXmlTagValue(xml: string, tag: string, value: string): string {
  const regex = new RegExp(`(<${tag}>)(.*?)(</${tag}>)`, 'g');
  return xml.replace(regex, `$1${value}$3`);
}

/**
 * Applies a bulk set of tag replacements to an XML string.
 */
export function updateXmlValues(xml: string, updates: Record<string, string>): string {
  let updatedXml = xml;
  for (const tag in updates) {
    updatedXml = replaceXmlTagValue(updatedXml, tag, updates[tag]);
  }
  return updatedXml;
}

/**
 * Base XML template for Worldpay Express Hosted Payment Page.
 */
export const ExpressHPA_1 = `...`; // Insert actual long XML template here or import externally

