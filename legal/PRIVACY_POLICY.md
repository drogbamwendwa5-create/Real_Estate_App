<!--
  TEMPLATE NOTICE (remove before publishing): This document was prepared from the app's
  actual code and data flows. It is not legal advice — have it reviewed by a qualified
  lawyer and complete all [bracketed] placeholders (legal entity name, address, retention
  periods, etc.) before publishing.
-->

# Privacy Policy

**Effective Date:** 27 August 2026 · **Last Updated:** 27 August 2026

This Privacy Policy explains how [Company Legal Name] ("**Real Estate**", "**we**", "**us**" or "**our**") collects, uses, discloses and protects your personal data when you use the Real Estate mobile application, our website(s) and related services (together, the "**Services**"). It also describes your rights under the Kenya Data Protection Act, 2019 ("**DPA**") and, where applicable, the EU/UK General Data Protection Regulation ("**GDPR**").

By creating an account or using the Services, you acknowledge the practices described in this Policy. If you do not agree, please do not use the Services.

## 1. Who We Are

- **Data Controller:** [Company Legal Name], [registered address], Kenya.
- **Privacy contact / Data Protection Officer:** privacy@realestate.com

We determine the purposes and means of the processing of personal data described in this Policy.

## 2. Overview of the Services

Real Estate is a property search marketplace. It lets you browse and search property listings for sale and rent, save favourites, contact and message agents and other users, publish listings and reviews, view maps, heatmaps and market insights, chat with an AI assistant, and manage subscriptions. Some listings shown in the app are aggregated from publicly available third-party property portals (see Section 6).

## 3. Personal Data We Collect

### 3.1 Data you provide directly

| Category | Examples |
|---|---|
| **Account data** | Full name, email address, password (stored only as a bcrypt hash), optional phone number |
| **Profile data** | Display name, profile and cover photos, bio, languages, country, county, city, address, company, website, social media links |
| **Verification data** | Information and documents you submit when requesting professional (agent/agency) or property-owner verification |
| **Listing content** | Property details, photos and videos you upload, location, price and the contact details you choose to publish |
| **Communications** | Messages you send to other users or agents, reviews, reports you submit, and messages to our support team |
| **AI chats** | The content of conversations you have with the in-app AI assistant |

### 3.2 Data collected automatically

- **Login and security records:** IP address, device/browser user-agent, timestamps and success/failure of sign-in attempts (used to secure accounts and detect fraud).
- **Usage data:** features used, searches, listing views and saves, in-app notification activity, online status and "last seen" indicators.
- **Audit logs:** administrative and security events.

### 3.3 Location data

When you use map or "nearby" features, we request your device's precise location through your operating system's permission dialog. We use it only to centre the map and show nearby results while the feature is in use; we do not track your movements in the background. You can grant, deny or revoke this permission at any time in your device settings — map features still work without it.

### 3.4 Payment data

Payments and subscriptions are processed by **Stripe**. We receive payment confirmations and subscription status from Stripe. We do not receive or store full card numbers; Stripe's handling of your payment data is governed by Stripe's own privacy policy.

### 3.5 Data stored on your device

Session tokens, preferences and cached content are stored locally on your device (e.g., via AsyncStorage) to keep you signed in and make the app faster.

### 3.6 Data we receive from third parties

- Listing data — including agent/agency names, phone numbers and email addresses — as published by the third-party portals from which we aggregate listings.
- Email delivery status from our email service provider.

## 4. How We Use Personal Data

We process personal data to:

1. create and manage your account, authenticate you and let you manage your profile;
2. operate the marketplace: display listings and search results, save favourites, and enable messaging, reviews and notifications;
3. process subscriptions and payments through Stripe;
4. verify agents and property owners who request verification;
5. personalise your experience (recent searches, nearby results, recommendations);
6. provide the AI assistant — your chat content is processed to generate responses;
7. send transactional communications (email verification, password resets, security alerts, push notifications) and — only with your consent — marketing communications;
8. secure the Services, prevent fraud and abuse, and enforce our Terms of Use;
9. analyse aggregate usage to maintain and improve the Services;
10. comply with legal obligations and respond to lawful requests.

**We do not sell your personal data, and we do not share it for third-party behavioural advertising.**

## 5. Legal Bases for Processing

- **Performance of a contract** — to provide the Services you request (account, listings, messaging, payments).
- **Consent** — precise location, push notifications, marketing communications, photo access and AI chats. You may withdraw consent at any time without affecting the lawfulness of prior processing.
- **Legitimate interests** — securing accounts (login history), preventing fraud and abuse, and improving the Services, balanced against your rights and expectations.
- **Legal obligations** — tax and accounting duties, responding to lawful requests and to the Office of the Data Protection Commissioner (ODPC).

## 6. Aggregated Listings and Third-Party Contact Details

Some listings displayed in the app are collected from publicly accessible third-party property portals (for example, BuyRent Kenya, Property24 Kenya, Kenya Property Centre, Hauzisha, Jiji Kenya, PigiaMe and RentKenya) and may include the agent or agency name, phone number and email address that the source published.

- We display this information as-is, for search convenience, and attribute the source where practicable. The source site remains responsible for the accuracy and lawfulness of its data.
- All trademarks and listing content belong to their respective owners.
- **If you appear in an aggregated listing and want your contact details removed or corrected,** email privacy@realestate.com with the listing details (or its URL). We will assess and action your request without undue delay. Because the data originates from the source portal, you may also need to contact the source directly.

## 7. Sharing of Personal Data

We share personal data only as follows:

- **Service providers / processors**, acting on our instructions under contract: our cloud hosting and database provider; **Cloudinary** (image hosting); **Stripe** (payment processing); **OpenRouter** (AI model inference for the assistant); **Expo** (push notification delivery infrastructure); our SMTP email provider (account and security emails); **OpenStreetMap/Nominatim** (address geocoding); and **Google Maps / Apple Maps** (map rendering on your device).
- **Other users**, when you choose to make information public: your profile details (e.g., display name, photo, bio, contact details) and the content you publish (listings, reviews, messages you send).
- **Legal and safety:** to comply with law or legal process, or to protect the rights, property and safety of our users and the public.
- **Business transfers:** in connection with a merger, acquisition or sale of assets, with appropriate notice.
- **Aggregated or anonymised statistics** that do not identify you.

## 8. International Data Transfers

Our providers may process data outside Kenya (for example, cloud and AI services hosted in the EU or US). Where personal data leaves Kenya, we apply appropriate safeguards — such as standard contractual clauses and adequacy assessments — as required by the DPA.

## 9. Data Retention

We keep personal data only as long as necessary for the purposes above:

| Data | Retention |
|---|---|
| Account and profile data | While your account is active; deleted within [30] days of account deletion (backups purge within [90] days) |
| Login and security records | [12] months |
| Messages and favourites | While your account is active, then deleted with the account |
| Payment/transaction records | As required by tax and accounting law (typically [7] years) |
| Verification submissions | While the verification is valid, plus [12] months |
| AI chat history | While your account is active, or until you clear the conversation |

We may retain data longer where required by law or to resolve disputes, under a documented legal hold.

## 10. How We Protect Your Data

- Passwords are hashed with bcrypt and never stored in plain text.
- Data is transmitted over TLS; sessions use signed, expiring tokens (JWT) with refresh-token rotation.
- Access to production data is restricted to authorised personnel and logged.
- **No security measure is perfect.** If a breach affects your data, we will notify the ODPC and affected users as required by law. Report concerns to security@realestate.com.

## 11. Your Rights

Subject to applicable law (including DPA section 26 and, where applicable, the GDPR), you may:

- be informed about how your data is used (this Policy);
- request access to a copy of your data;
- request correction of inaccurate data;
- request deletion ("right to be forgotten");
- object to processing, including to direct marketing (marketing emails include an unsubscribe link);
- request portability of data you have provided, where technically feasible;
- withdraw consent at any time (e.g., for location or notifications);
- not be subject to solely automated decisions that produce legal or similarly significant effects.

**How to exercise:** most actions are available directly in the app (Profile → edit or delete your account; device settings for location and notification permissions). You can also email privacy@realestate.com — we will verify your identity and respond within [30] days. If you are not satisfied, you may lodge a complaint with the **Office of the Data Protection Commissioner (ODPC), Kenya**.

## 12. Children's Privacy

The Services are intended for users aged 18 and over and are not directed at children. We do not knowingly collect personal data from anyone under 18. If you believe a minor has provided personal data, contact us and we will delete it promptly.

## 13. Changes to This Policy

We may update this Policy as the Services evolve. The "Last Updated" date shows the current version, and we will notify you of material changes in-app or by email before they take effect.

## 14. Contact

[Company Legal Name], [registered address], Kenya
- **Privacy queries:** privacy@realestate.com
- **Legal queries:** legal@realestate.com
- **Security reports:** security@realestate.com

