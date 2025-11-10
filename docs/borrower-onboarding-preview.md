# Applicant/Borrower Onboarding Preview

- Public routes: `/onboarding` and `/borrower/onboarding` both show the onboarding wizard for applicants and borrowers.
- Add `?preview=true` to simulate submissions without hitting the API. The form shows a preview banner and uses branding from `/api/settings/branding`.
- Lender quick link: Applications page header includes a "Preview borrower onboarding" button.

Notes
- This wizard serves both applicants (new loan applications) and borrowers (direct creation).
- Branding fields used: `companyName`, `logoUrl`, `accentHex` (for accent bar under header).
- Company Name is optional to support personal loans.
- In preview mode, the Loan Application form "Submit" will not create records.
