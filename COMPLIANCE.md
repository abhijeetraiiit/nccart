# Indian Legal Compliance Guide for NCCart

## Overview
NCCart is designed to be fully compliant with Indian e-commerce laws and regulations. This document outlines all compliance requirements and how they are implemented in the platform.

---

## 1. E-commerce Rules, 2020 (Consumer Protection Act)

### Key Requirements

#### 1.1 Platform Information Display
**Requirement:** Display complete platform information

**Implementation:**
- Company name, address, contact details in footer
- Customer care email and phone number
- Grievance officer details

**Location:** Frontend footer, About Us page, Contact page

#### 1.2 Seller Information Display
**Requirement:** Display seller information for each product

**Implementation:**
- Seller name displayed on product page
- Seller business address
- Contact information
- Return/exchange policy

**Database Fields:** `Seller.businessName`, `Seller.businessAddress`

#### 1.3 Country of Origin
**Requirement:** Display country of origin for all products

**Implementation:**
- Mandatory field in product schema
- Default value: "India"
- Displayed prominently on product page

**Database Field:** `Product.countryOfOrigin`

#### 1.4 Return/Refund Policy
**Requirement:** Clear return and refund policy

**Implementation:**
- Platform-wide return policy (configurable)
- Seller-specific return policies
- Display before checkout
- Email confirmation of policy

**Location:** Checkout page, Order confirmation

#### 1.5 Grievance Redressal
**Requirement:** Mechanism for customer complaints

**Implementation:**
- Grievance officer appointed
- Complaint submission form
- 48-hour acknowledgment
- 30-day resolution timeline

**Future Module:** Grievance Management System

---

## 2. GST (Goods and Services Tax) Compliance

### 2.1 GST Registration

**Seller Requirements:**
- Mandatory GST registration for sellers with turnover > ₹40 lakhs
- GSTIN validation on seller onboarding
- GST certificate upload

**Database Fields:**
- `Seller.gstNumber` (validated format)
- `Seller.gstCertificate` (document URL)

**Validation:**
```typescript
// GST Number format: 22AAAAA0000A1Z5
const gstRegex = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/;
```

### 2.2 GST Invoice Generation

**Requirement:** Generate GST-compliant invoices

**Invoice Fields:**
- Invoice number (sequential)
- Invoice date
- Supplier details (GSTIN, address)
- Recipient details (GSTIN if applicable, address)
- HSN/SAC codes
- Taxable value
- GST rate and amount (CGST, SGST/IGST)
- Total amount
- Place of supply

**Database Field:** `Product.hsn` (HSN code)

### 2.3 GST Calculation

**Implementation:**
```javascript
function calculateGST(amount, gstRate = 18) {
  const taxableAmount = amount;
  const gstAmount = (taxableAmount * gstRate) / 100;
  
  // For intra-state: CGST + SGST
  // For inter-state: IGST
  const cgst = gstAmount / 2;
  const sgst = gstAmount / 2;
  const igst = gstAmount;
  
  return {
    taxableAmount,
    gstAmount,
    cgst,
    sgst,
    igst,
    totalAmount: taxableAmount + gstAmount
  };
}
```

### 2.4 TCS (Tax Collected at Source)

**Requirement:** Collect TCS from e-commerce operators

**Applicable When:**
- Seller gross sales > ₹5 lakhs in a financial year
- TCS rate: 1% (0.5% CGST + 0.5% SGST)

**Implementation:**
- Track seller annual turnover
- Auto-apply TCS when threshold crossed
- Generate TCS certificates
- File quarterly TCS returns

---

## 3. KYC (Know Your Customer) Requirements

### 3.1 Seller KYC

**Individual Sellers:**
- PAN Card (mandatory)
- Aadhaar Card
- Bank account details
- Address proof

**Business Sellers:**
- PAN Card
- GST Certificate
- Certificate of Incorporation/Partnership deed
- Bank account details
- Address proof

**Database Fields:**
```prisma
Seller {
  panNumber         String?  @unique
  panDocument       String?
  aadhaarNumber     String?  @unique
  aadhaarDocument   String?
  gstNumber         String?  @unique
  gstCertificate    String?
}
```

### 3.2 KYC Verification

**Process:**
1. Seller submits documents
2. System validates format
3. Admin manual verification
4. Status updates: NOT_SUBMITTED → PENDING → APPROVED/REJECTED

**Database Enum:**
```prisma
enum KYCStatus {
  NOT_SUBMITTED
  PENDING
  APPROVED
  REJECTED
}
```

### 3.3 Document Storage

**Security:**
- Encrypted storage (S3 with encryption or Cloudinary)
- Access restricted to admin only
- Audit log for document access
- Retention policy: 7 years (as per law)

---

## 4. FSSAI (Food Safety) Compliance

### 4.1 When Required
- Any food or food-related products
- Mandatory FSSAI license

**Database Field:** `Seller.fssaiLicense`

### 4.2 Display Requirements
- FSSAI license number on product page
- Nutritional information
- Allergen warnings
- Best before/expiry date

**Implementation:**
- Category-based FSSAI requirement check
- Mandatory field for food categories
- Display on product page

---

## 5. Data Privacy (DPDP Act, 2023)

### 5.1 Data Collection

**Principles:**
- Collect only necessary data
- Clear purpose for collection
- Explicit user consent

**Implementation:**
- Privacy policy page
- Consent checkboxes during registration
- Cookie consent banner

### 5.2 User Rights

**Rights:**
- Right to access data
- Right to correction
- Right to erasure ("Right to be Forgotten")
- Right to data portability

**Implementation:**
- User profile settings
- Data export functionality
- Account deletion option
- Data correction forms

### 5.3 Data Security

**Measures:**
- Password hashing (bcrypt)
- HTTPS encryption
- Database encryption at rest
- Regular security audits
- Access controls

### 5.4 Data Breach Notification

**Requirement:** Notify users within 72 hours of data breach

**Implementation:**
- Incident response plan
- Notification email template
- Affected user identification
- Regulatory reporting

### 5.5 Data Localization

**Requirement:** Store sensitive personal data in India

**Implementation:**
- Use Indian data centers
- AWS Mumbai region
- Or India-based hosting (Railway, Render with Indian regions)

---

## 6. Payment Regulations

### 6.1 RBI Guidelines

**Requirements:**
- Two-factor authentication for cards
- Secure payment gateway
- No storage of card details
- PCI DSS compliance

**Implementation:**
- Use certified payment gateways (UroPay, Razorpay, etc.)
- Tokenization for card storage
- 3D Secure authentication

### 6.2 UPI Compliance

**Guidelines:**
- Generate dynamic UPI QR codes
- Validate UPI IDs
- Transaction limits compliance
- Dispute resolution mechanism

---

## 7. Consumer Protection

### 7.1 Product Information

**Mandatory Information:**
- Product name and description
- Price (inclusive of all taxes)
- Seller information
- Country of origin
- Return/exchange policy
- Warranty terms
- Delivery timeline

### 7.2 Price Display

**Requirements:**
- MRP display
- Discount calculation
- Total price (including delivery and taxes)
- No hidden charges

**Database Fields:**
```prisma
Product {
  mrp      Float
  price    Float
  discount Float
}
```

### 7.3 Order Cancellation

**Rights:**
- Cancellation before dispatch
- Full refund
- Cancellation reasons tracking

---

## 8. Intellectual Property

### 8.1 Trademark Protection

**Requirements:**
- Verify seller has rights to sell branded products
- Trademark verification for brand names
- Counterfeit product reporting

**Implementation:**
- Brand authorization upload
- Automated brand check
- Reporting mechanism

### 8.2 Copyright

**Requirements:**
- Original product images
- Proper attribution for stock images
- User-generated content rights

---

## 9. Platform Responsibilities

### 9.1 Due Diligence

**Requirements:**
- Verify seller identity
- Monitor seller performance
- Remove non-compliant sellers
- Regular seller audits

### 9.2 Record Keeping

**Requirement:** Maintain records for 3 years

**Records to Maintain:**
- All orders
- Invoices
- Customer data
- Seller information
- Complaints and resolutions
- Tax documents

**Implementation:**
- Database retention policy
- Backup strategy
- Archive old records

---

## 10. Compliance Checklist

### Onboarding
- [ ] Privacy policy displayed
- [ ] Terms & conditions acceptance
- [ ] Cookie consent
- [ ] Data collection consent

### Seller Onboarding
- [ ] PAN verification
- [ ] GST verification (if applicable)
- [ ] Bank account verification
- [ ] Address verification
- [ ] FSSAI verification (for food sellers)

### Product Listing
- [ ] Country of origin specified
- [ ] HSN code for GST
- [ ] Complete product information
- [ ] Return policy defined
- [ ] Warranty terms (if applicable)

### Order Processing
- [ ] GST invoice generation
- [ ] Order confirmation email
- [ ] Delivery tracking
- [ ] Complaint mechanism

### Financial
- [ ] GST filing (monthly/quarterly)
- [ ] TDS/TCS compliance
- [ ] Invoice retention
- [ ] Financial audit trail

---

## 11. Legal Documents Required

### Platform Documents
- [ ] Terms & Conditions
- [ ] Privacy Policy
- [ ] Refund & Return Policy
- [ ] Shipping Policy
- [ ] Cookie Policy
- [ ] Disclaimer
- [ ] Grievance Redressal Policy

### Seller Agreement
- [ ] Seller Terms & Conditions
- [ ] Commission Structure
- [ ] Code of Conduct
- [ ] Termination Clauses

**Location:** Create in `/frontend/app/legal/` directory

---

## 12. Compliance Monitoring

### Regular Audits
- Monthly: GST filing check
- Quarterly: Seller KYC review
- Annually: Legal compliance audit

### Metrics to Track
- KYC approval rate
- Complaint resolution time
- GST filing compliance
- Data breach incidents
- Seller violations

---

## 13. Non-Compliance Penalties

### Platform Penalties
- GST non-compliance: Heavy fines
- Consumer law violation: Up to ₹50 lakhs
- Data privacy breach: Up to ₹250 crores
- FSSAI violation: License suspension

### Risk Mitigation
- Automated compliance checks
- Regular legal consultations
- Compliance officer appointment
- Insurance coverage

---

## 14. Future Compliance Updates

### Monitoring Sources
- Ministry of Commerce website
- RBI notifications
- GST Council updates
- Consumer Affairs Ministry

### Update Process
1. Monitor regulatory changes
2. Assess impact on platform
3. Update code/policies
4. Communicate to users
5. Train support team

---

## Resources

### Government Portals
- GST Portal: https://www.gst.gov.in/
- FSSAI: https://www.fssai.gov.in/
- Consumer Affairs: https://consumeraffairs.nic.in/

### Legal References
- Consumer Protection (E-Commerce) Rules, 2020
- Information Technology Act, 2000
- DPDP Act, 2023
- GST Act, 2017

---

**Disclaimer:** This guide is for informational purposes. Consult with legal professionals for specific compliance requirements.

**Last Updated:** 2024
**Review Schedule:** Quarterly
