import React from 'react';
import { renderHook, act } from '@testing-library/react-native';
import { useAuth, login, register } from '../Hooks/useAuth';
import authService from '../Services/api/authService';
import { getToken, removeToken, storeToken } from '../Utils/storage';

jest.mock('../Services/api/authService');
jest.mock('../Utils/storage');

describe('useAuth hook', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    getToken.mockResolvedValue(null);
    removeToken.mockResolvedValue(undefined);
    storeToken.mockResolvedValue(undefined);
  });

  it('should initialize with null user and loading true', () => {
    const { result } = renderHook(() => useAuth());
    expect(result.current.user).toBeNull();
    expect(result.current.loading).toBe(true);
  });

  it('should load user when token exists', async () => {
    const mockUser = { _id: '1', email: 'test@example.com', name: 'Test' };
    getToken.mockResolvedValue('fake-token');
    authService.getProfile.mockResolvedValue({ user: mockUser });

    const { result } = renderHook(() => useAuth());

    // Wait for useEffect to complete
    await act(async () => {
      await Promise.resolve();
    });

    expect(result.current.user).toEqual(mockUser);
    expect(result.current.loading).toBe(false);
    expect(authService.getProfile).toHaveBeenCalled();
  });

  it('should remove token when getProfile fails', async () => {
    getToken.mockResolvedValue('fake-token');
    authService.getProfile.mockRejectedValue(new Error('Unauthorized'));

    const { result } = renderHook(() => useAuth());

    await act(async () => {
      await Promise.resolve();
    });

    expect(result.current.user).toBeNull();
    expect(result.current.loading).toBe(false);
    expect(removeToken).toHaveBeenCalled();
  });

  it('should login and set user', async () => {
    const mockResponse = {
      token: 'new-token',
      user: { _id: '1', email: 'test@example.com', name: 'Test' },
    };
    authService.login.mockResolvedValue(mockResponse);

    const { result } = renderHook(() => useAuth());

    await act(async () => {
      await result.current.login('test@example.com', 'password');
    });

    expect(result.current.user).toEqual(mockResponse.user);
    expect(storeToken).toHaveBeenCalledWith('new-token');
  });

  it('should logout and clear user', async () => {
    authService.logout.mockResolvedValue(undefined);

    const { result } = renderHook(() => useAuth());

    await act(async () => {
      await result.current.logout();
    });

    expect(result.current.user).toBeNull();
    expect(authService.logout).toHaveBeenCalled();
  });

  it('should update user details', async () => {
    const mockResponse = { data: { _id: '1', name: 'Updated Name' } };
    authService.updateProfile.mockResolvedValue(mockResponse);

    const { result } = renderHook(() => useAuth());
    result.current.setUser({ _id: '1', name: 'Old Name' });

    await act(async () => {
      await result.current.updateUserDetails({ name: 'Updated Name' });
    });

    expect(result.current.user).toEqual(mockResponse.data);
  });
});

describe('Standalone auth functions', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('login should call loginApi and return data', async () => {
    const mockData = { token: 'token', user: { email: 'test@example.com' } };
    authService.login.mockResolvedValue(mockData);

    const result = await login('test@example.com', 'password');

    expect(result).toEqual(mockData);
    expect(authService.login).toHaveBeenCalledWith('test@example.com', 'password');
  });

  it('register should call registerApi and return data', async () => {
    const mockData = { token: 'token', user: { email: 'test@example.com' } };
    authService.register.mockResolvedValue(mockData);

    const result = await register('Test', 'test@example.com', 'password', '+1234567890');

    expect(result).toEqual(mockData);
    expect(authService.register).toHaveBeenCalledWith('Test', 'test@example.com', 'password', '+1234567890');
  });
});
