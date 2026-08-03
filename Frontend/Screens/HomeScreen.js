import React from 'react';
import { useSelector } from 'react-redux';
import RoleHomeScreen from './RoleHomeScreen';

export default function HomeScreen() {
  const user = useSelector(state => state.auth.user);
  return <RoleHomeScreen key={user?.canonicalRole || user?.role || 'guest'} />;
}