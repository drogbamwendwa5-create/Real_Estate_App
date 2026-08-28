import React from 'react';
import { PRIVACY_POLICY_MD } from '../../Screens/Legal/legalContent';
import LegalDocument from '../../Components/Legal/LegalDocument';

export default function PrivacyPolicyScreen() {
  return <LegalDocument content={PRIVACY_POLICY_MD} title="Privacy Policy" />;
}
