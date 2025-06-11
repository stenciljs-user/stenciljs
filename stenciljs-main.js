import axios from 'axios';
import api from './api'; // your axios wrapper
import type { AxiosRequestConfig } from 'axios';

jest.mock('axios');

const mockedAxios = axios as jest.Mocked<typeof axios>;

describe('Axios API wrapper', () => {
  const fakeToken = 'test-token';
  const headers = { Authorization: `Bearer ${fakeToken}` };

  beforeEach(() => {
    localStorage.setItem('authToken', fakeToken);
    mockedAxios.create.mockReturnThis(); // important: mock .create()
  });

  afterEach(() => {
    jest.clearAllMocks();
    localStorage.clear();
  });

  it('should send GET request with token and return typed data', async () => {
    const responseData = { value: 123 };
    mockedAxios.get.mockResolvedValueOnce({
      data: responseData,
      status: 200,
      statusText: 'OK',
      headers: {},
      config: {},
    });

    const result = await api.get<typeof responseData>('test-url', {});
    expect(result.data).toEqual(responseData);
    expect(mockedAxios.get).toHaveBeenCalledWith('test-url', expect.objectContaining({
      headers: expect.objectContaining(headers),
    }));
  });

  it('should send POST request with body and return typed data', async () => {
    const postData = { foo: 'bar' };
    mockedAxios.post.mockResolvedValueOnce({
      data: postData,
      status: 200,
      statusText: 'OK',
      headers: {},
      config: {},
    });

    const result = await api.post<typeof postData>('test-url', postData, {});
    expect(result.data).toEqual(postData);
    expect(mockedAxios.post).toHaveBeenCalledWith('test-url', postData, expect.anything());
  });

  it('should send PUT request and return typed data', async () => {
    const putData = { updated: true };
    mockedAxios.put.mockResolvedValueOnce({
      data: putData,
      status: 200,
      statusText: 'OK',
      headers: {},
      config: {},
    });

    const result = await api.put<typeof putData>('test-url', putData, {});
    expect(result.data).toEqual(putData);
    expect(mockedAxios.put).toHaveBeenCalledWith('test-url', putData, expect.anything());
  });

  it('should send DELETE request and return success response', async () => {
    mockedAxios.delete.mockResolvedValueOnce({
      status: 204,
      statusText: 'No Content',
      headers: {},
      config: {},
    });

    const result = await api.delete('test-url', {});
    expect(result.status).toEqual(204);
    expect(result.statusText).toBe('No Content');
    expect(mockedAxios.delete).toHaveBeenCalledWith('test-url', expect.anything());
  });

  it('should handle 401 error globally', async () => {
    const error = {
      response: { status: 401, statusText: 'Unauthorized' },
    };
    mockedAxios.get.mockRejectedValueOnce(error);

    const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

    await expect(api.get('unauthorized-endpoint', {})).rejects.toEqual(error);

    expect(consoleSpy).toHaveBeenCalledWith('Unauthorized Access', error);
    consoleSpy.mockRestore();
  });
});i'm 
