import React from 'react';
import { TERMS_OF_USE_MD } from '../../Screens/Legal/legalContent';
import LegalDocument from '../../Components/Legal/LegalDocument';

export default function TermsOfUseScreen() {
  return <LegalDocument content={TERMS_OF_USE_MD} title="Terms of Use" />;
}
