import { merchantTransactionSetup, MerchantTransactionSetupProps } from './merchantTransactionSetup';
import * as xmlUtils from '../../utils/xmlUtils';
import api from '../../api';

jest.mock('../../api');

describe('merchantTransactionSetup', () => {
  const mockSetLoading = jest.fn();
  const mockSetError = jest.fn();

  const mockProps: MerchantTransactionSetupProps = {
    amount: '100',
    logoURL: 'https://logo.com/logo.png',
    customCss: '.btn { color: red; }',
    embedded: 1,
    title: 'Test Payment',
    tagline: 'Trusted Tagline',
    companyName: 'Test Company',
    accountId: '123456',
    merchantId: '654321',
    accountToken: 'TOKEN123',
    setLoading: mockSetLoading,
    setError: mockSetError,
  };

  beforeEach(() => {
    jest.clearAllMocks();
    jest.spyOn(xmlUtils, 'updateXmlValues').mockReturnValue('<updated-xml></updated-xml>');
  });

  it('should call API with correct XML and set loading states properly on success', async () => {
    (api.post as jest.Mock).mockResolvedValueOnce({ data: 'success' });

    await merchantTransactionSetup(mockProps);

    expect(mockSetLoading).toHaveBeenNthCalledWith(1, true);
    expect(xmlUtils.updateXmlValues).toHaveBeenCalledWith(expect.anything(), expect.objectContaining({
      TransactionAmount: '100',
      AccountID: '123456',
      AccountToken: 'TOKEN123',
      AcceptorID: '654321',
      ApplicationID: '20437',
    }));
    expect(api.post).toHaveBeenCalledWith(
      'https://certtransaction.elementexpress.com',
      '<updated-xml></updated-xml>',
      { headers: { 'Content-type': 'text/xml' } }
    );
    expect(mockSetError).not.toHaveBeenCalled();
    expect(mockSetLoading).toHaveBeenLastCalledWith(false);
  });

  it('should set error state and return null on failure', async () => {
    (api.post as jest.Mock).mockRejectedValueOnce(new Error('fail'));

    const result = await merchantTransactionSetup(mockProps);

    expect(mockSetLoading).toHaveBeenCalledWith(true);
    expect(mockSetError).toHaveBeenCalledWith(true);
    expect(result).toBeNull();
    expect(mockSetLoading).toHaveBeenLastCalledWith(false);
  });
});
