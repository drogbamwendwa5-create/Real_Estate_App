import React from 'react';
import { render, fireEvent, waitFor, act } from '@testing-library/react-native';
import SearchScreen from '../app/(tabs)/search';
import { useRouter } from 'expo-router';
import { useDispatch, useSelector } from 'react-redux';

jest.mock('expo-router');
jest.mock('react-redux');

const mockPush = jest.fn();
const mockReplace = jest.fn();
const mockDispatch = jest.fn();
const mockBack = jest.fn();

useRouter.mockReturnValue({ push: mockPush, replace: mockReplace, back: mockBack, canGoBack: jest.fn(() => true) });
useDispatch.mockReturnValue(mockDispatch);
useSelector.mockReturnValue([]);

describe('SearchScreen MapView & ListView integration tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders search screen header and initial results correctly in list mode', async () => {
    const { getByText, getByPlaceholderText } = await render(<SearchScreen />);
    expect(getByText('Search')).toBeTruthy();
    expect(getByText('Find your perfect property in Kenya')).toBeTruthy();
    expect(getByPlaceholderText('Search by location, estate, or keyword')).toBeTruthy();
  });

  it('toggles to fullscreen map view mode and back to list mode smoothly', async () => {
    const { getByLabelText, getByText } = await render(<SearchScreen />);
    
    const mapToggle = getByLabelText('Map view');
    expect(mapToggle).toBeTruthy();
    
    await act(async () => {
      fireEvent.press(mapToggle);
    });

    await waitFor(() => {
      expect(getByLabelText('Go back')).toBeTruthy();
      expect(getByLabelText('Switch to list view')).toBeTruthy();
    });

    // Toggle back to list view
    const switchToListBtn = getByLabelText('Switch to list view');
    await act(async () => {
      fireEvent.press(switchToListBtn);
    });

    await waitFor(() => {
      expect(getByText('Search')).toBeTruthy();
    });
  });
});
