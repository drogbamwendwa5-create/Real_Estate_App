import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import LoginScreen from '../app/auth/login';
import SearchScreen from '../app/(tabs)/search';
import { useRouter } from 'expo-router';
import { useDispatch, useSelector } from 'react-redux';

jest.mock('expo-router');
jest.mock('react-redux');

const mockLogin = jest.fn();
const mockPush = jest.fn();
const mockReplace = jest.fn();
const mockDispatch = jest.fn();

useRouter.mockReturnValue({ push: mockPush, replace: mockReplace, back: jest.fn(), canGoBack: jest.fn(() => true) });
useDispatch.mockReturnValue(mockDispatch);
useSelector.mockReturnValue([]);

describe('LoginScreen smoke tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockLogin.mockResolvedValue({ token: 'fake-token', user: { email: 'test@example.com' } });
  });

  it('should render login form', async () => {
    const { getAllByText, getByPlaceholderText } = await render(<LoginScreen />);
    expect(getAllByText('Login').length).toBeGreaterThanOrEqual(1);
    expect(getByPlaceholderText('Email')).toBeTruthy();
    expect(getByPlaceholderText('Password')).toBeTruthy();
  });
});

describe('SearchScreen smoke tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render search screen with searchbar and title', async () => {
    const { getByPlaceholderText, getByText } = await render(<SearchScreen />);
    expect(getByPlaceholderText('Search by location, estate, or keyword')).toBeTruthy();
    expect(getByText('Search')).toBeTruthy();
    expect(getByText('Find your perfect property in Kenya')).toBeTruthy();
  });

  it('should allow typing into search input', async () => {
    const { getByPlaceholderText } = await render(<SearchScreen />);
    const searchbar = getByPlaceholderText('Search by location, estate, or keyword');
    expect(searchbar).toBeTruthy();
    fireEvent.changeText(searchbar, 'Westlands');
    expect(searchbar).toBeTruthy();
  });
});
