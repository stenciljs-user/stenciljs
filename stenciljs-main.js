import axios from 'axios';
import { api } from './api'; // adjust path
import { getApiUrl } from '../utils';

jest.mock('axios');
jest.mock('../utils', () => ({
  getApiUrl: jest.fn(() => 'https://mock.api')
}));

const mockedAxios = axios as jest.Mocked<typeof axios>;

describe('API Service', () => {
  const dummyConfig = { headers: { 'X-Test': 'yes' } };
  const dummyResponse = { data: 'mock-data' };

  beforeEach(() => {
    mockedAxios.create.mockReturnValue({
      get: jest.fn(() => Promise.resolve(dummyResponse)),
      post: jest.fn(() => Promise.resolve(dummyResponse)),
      put: jest.fn(() => Promise.resolve(dummyResponse)),
      delete: jest.fn(() => Promise.resolve({ status: 204 })),
      interceptors: {
        request: { use: jest.fn() },
        response: { use: jest.fn() },
      },
    } as any);
  });

  afterEach(() => jest.clearAllMocks());

  it('calls GET with correct URL and config', async () => {
    const res = await api.get('/test-endpoint', dummyConfig);
    expect(mockedAxios.create().get).toHaveBeenCalledWith('/test-endpoint', dummyConfig);
    expect(res).toEqual(dummyResponse);
  });

  it('calls POST with URL, body, and config', async () => {
    const data = { foo: 'bar' };
    const res = await api.post('/post', data, dummyConfig);
    expect(mockedAxios.create().post).toHaveBeenCalledWith('/post', data, dummyConfig);
    expect(res).toEqual(dummyResponse);
  });

  it('calls PUT with URL, data, and config', async () => {
    const res = await api.put('/put', { val: 1 }, dummyConfig);
    expect(mockedAxios.create().put).toHaveBeenCalledWith('/put', { val: 1 }, dummyConfig);
    expect(res).toEqual(dummyResponse);
  });

  it('calls DELETE with correct URL and config', async () => {
    const res = await api.delete('/delete', dummyConfig);
    expect(mockedAxios.create().delete).toHaveBeenCalledWith('/delete', dummyConfig);
    expect(res.status).toBe(204);
  });
});
