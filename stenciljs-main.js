import { newSpecPage } from '@stencil/core/testing';
import { PaymentProcessing } from './payment-processing';
import * as merchantModule from '../../services/merchantTransactionSetup/merchantTransactionSetup';
import * as xmlUtils from '../../utils/xmlUtils';

describe('payment-processing', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders loader initially', async () => {
    const page = await newSpecPage({
      components: [PaymentProcessing],
      html: `<payment-processing></payment-processing>`
    });

    expect(page.root).toBeDefined();
    expect(page.root.querySelector('common-loader')).toBeTruthy();
  });

  it('initializes payment session and sets iframe URL', async () => {
    const mockSetLoading = jest.fn();
    const mockSetError = jest.fn();

    const mockResponse = {
      data: '<Response><TransactionSetupResponse><Response><TransactionSetupID><#text>abc123</#text></TransactionSetupID></Response></TransactionSetupResponse></Response>'
    };

    const mockXmlObject = {
      TransactionSetupResponse: {
        Response: {
          TransactionSetupID: {
            '#text': 'abc123'
          }
        }
      }
    };

    jest.spyOn(merchantModule, 'merchantTransactionSetup').mockResolvedValue(mockResponse);
    jest.spyOn(xmlUtils, 'xmlToObject').mockReturnValue(mockXmlObject);

    const page = await newSpecPage({
      components: [PaymentProcessing],
      html: `<payment-processing></payment-processing>`
    });

    const component = page.rootInstance;
    expect(component.iframeUrl).toBe('abc123');
  });

  it('handles missing transaction ID', async () => {
    const mockResponse = {
      data: '<Invalid></Invalid>'
    };

    const mockXmlObject = {}; // No TransactionSetupID

    jest.spyOn(merchantModule, 'merchantTransactionSetup').mockResolvedValue(mockResponse);
    jest.spyOn(xmlUtils, 'xmlToObject').mockReturnValue(mockXmlObject);
    console.warn = jest.fn();

    const page = await newSpecPage({
      components: [PaymentProcessing],
      html: `<payment-processing></payment-processing>`
    });

    const component = page.rootInstance;
    expect(component.iframeUrl).toBe('');
    expect(console.warn).toHaveBeenCalledWith('TransactionSetupID not returned in response');
  });

  it('handles payment session initialization failure', async () => {
    jest.spyOn(merchantModule, 'merchantTransactionSetup').mockRejectedValue(new Error('Failed'));
    console.error = jest.fn();

    const page = await newSpecPage({
      components: [PaymentProcessing],
      html: `<payment-processing></payment-processing>`
    });

    expect(console.error).toHaveBeenCalledWith('Payment session initialization failed:', expect.any(Error));
  });

  it('displays alert message based on status', async () => {
    const page = await newSpecPage({
      components: [PaymentProcessing],
      html: `<payment-processing></payment-processing>`
    });

    const component = page.rootInstance;
    const alert = component['getAlertMessage']('SUCCESS');
    expect(alert).toMatchInlineSnapshot(`
      <div class="pt-[12px]">
        <common-alert
          classnames="mx-2"
          message=""
          type="SUCCESS"
        />
      </div>
    `);
  });
});
