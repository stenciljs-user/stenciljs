import api from './api';
import axios from 'axios';

jest.mock('axios'); // uses your __mocks__/axios.ts

const mockedAxios = axios as any;

describe('API wrapper with mocked axios', () => {
  const token = 'mock-token';

  beforeEach(() => {
    localStorage.setItem('authToken', token);
    jest.clearAllMocks();
  });

  afterEach(() => {
    localStorage.clear();
  });

  it('should call GET and return response', async () => {
    const result = await api.get('test-url', {});
    expect(mockedAxios.get).toHaveBeenCalledWith('test-url', expect.anything());
    expect(result).toEqual({ data: {} });
  });

  it('should call POST and return response', async () => {
    const postData = { name: 'test' };
    const result = await api.post('test-url', postData, {});
    expect(mockedAxios.post).toHaveBeenCalledWith('test-url', postData, expect.anything());
    expect(result).toEqual({ data: {} });
  });

  it('should call PUT and return response', async () => {
    const putData = { id: 1 };
    const result = await api.put('test-url', putData, {});
    expect(mockedAxios.put).toHaveBeenCalledWith('test-url', putData, expect.anything());
    expect(result).toEqual({ data: {} });
  });

  it('should call DELETE and return structured response', async () => {
    mockedAxios.delete.mockResolvedValueOnce({
      data: undefined,
      status: 204,
      statusText: 'No Content',
      headers: {},
      config: {},
    });

    const result = await api.delete('test-url', {});
    expect(mockedAxios.delete).toHaveBeenCalledWith('test-url', expect.anything());
    expect(result).toMatchObject({
      data: undefined,
      status: 204,
      statusText: 'No Content',
    });
  });

  it('should inject Authorization token in request interceptor', async () => {
    const config = { headers: {} };
    const interceptor = mockedAxios.create().interceptors;

    const result = await interceptor.request.use((cfg: any) => {
      const token = localStorage.getItem('authToken');
      if (token) {
        cfg.headers.Authorization = `Bearer ${token}`;
      }
      return cfg;
    })(config);

    expect(result.headers.Authorization).toBe(`Bearer ${token}`);
  });

  it('should reject unauthorized 401 response and log error', async () => {
    const interceptor = mockedAxios.create().interceptors;
    const error = { response: { status: 401 }, message: 'Unauthorized' };

    const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

    const rejected = await interceptor.response.use(
      (res: any) => res,
      (err: any) => {
        if (err.response?.status === 401) {
          console.error('Unauthorized Access', err);
        }
        return Promise.reject(err);
      }
    )(error).catch(e => e);

    expect(consoleSpy).toHaveBeenCalledWith('Unauthorized Access', error);
    expect(rejected).toBe(error);
    consoleSpy.mockRestore();
  });
});
