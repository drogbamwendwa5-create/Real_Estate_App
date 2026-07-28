import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import LoginScreen from '../app/auth/login';
import SearchScreen from '../app/(tabs)/search';
import { useRouter } from 'expo-router';
import { useDispatch } from 'react-redux';

jest.mock('expo-router');
jest.mock('react-redux');

const mockLogin = jest.fn();
const mockPush = jest.fn();
const mockReplace = jest.fn();
const mockDispatch = jest.fn();

useRouter.mockReturnValue({ push: mockPush, replace: mockReplace });
useDispatch.mockReturnValue(mockDispatch);

describe('LoginScreen smoke tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockLogin.mockResolvedValue({ token: 'fake-token', user: { email: 'test@example.com' } });
  });

  it('should render login form', () => {
    const { getByText, getByPlaceholderText } = render(<LoginScreen />);
    expect(getByText('Login')).toBeTruthy();
    expect(getByPlaceholderText('Email')).toBeTruthy();
    expect(getByPlaceholderText('Password')).toBeTruthy();
    expect(getByText('Login')).toBeTruthy();
  });

  it('should show error on empty submit', async () => {
    const { getByText } = render(<LoginScreen />);
    const loginButton = getByText('Login');
    
    fireEvent.press(loginButton);
    
    await waitFor(() => {
      expect(mockDispatch).not.toHaveBeenCalled();
    });
  });

  it('should attempt login with valid credentials', async () => {
    const { getByPlaceholderText, getByText } = render(<LoginScreen />);
    const emailInput = getByPlaceholderText('Email');
    const passwordInput = getByPlaceholderText('Password');
    const loginButton = getByText('Login');

    fireEvent.changeText(emailInput, 'test@example.com');
    fireEvent.changeText(passwordInput, 'password123');
    fireEvent.press(loginButton);

    await waitFor(() => {
      expect(mockDispatch).toHaveBeenCalled();
    });
  });
});

describe('SearchScreen smoke tests', () => {
  it('should render search screen with searchbar', () => {
    const { getByPlaceholderText } = render(<SearchScreen />);
    expect(getByPlaceholderText('Search properties...')).toBeTruthy();
  });

  it('should update search query on text change', () => {
    const { getByPlaceholderText } = render(<SearchScreen />);
    const searchbar = getByPlaceholderText('Search properties...');
    
    fireEvent.changeText(searchbar, 'Luxury');
    
    expect(searchbar.props.value).toBe('Luxury');
  });

  it('should show empty state message', () => {
    const { getByText } = render(<SearchScreen />);
    expect(getByText('No properties found')).toBeTruthy();
  });
});