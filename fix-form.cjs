const fs = require('fs');

// Read file
const content = fs.readFileSync('client/src/pages/Home.tsx', 'utf8');
const lines = content.split('\n');

// Find the function
const startLine = lines.findIndex(l => l.includes('const handleSubmit'));
const endLine = lines.findIndex((l, i) => i > startLine && l.trim().startsWith('useEffect'));

console.log(`Found handleSubmit at line ${startLine + 1}`);
console.log(`Found useEffect at line ${endLine + 1}`);
console.log(`Will replace ${endLine - startLine} lines`);

// Create new function
const newFunction = `  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSubmitting(true);
    setSubmitError(null);
    try {
      // Submit to Netlify Forms - it will email you automatically via form notifications
      const form = e.currentTarget;
      await fetch('/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams(new FormData(form) as any).toString(),
      });

      setLastEmail(formData.email);
      setSubmitted(true);
      setFormData({ firstName: "", lastName: "", email: "", company: "", role: "", interest: "", message: "" });
    } catch (err) {
      console.error("Form submit failed", err);
      setSubmitError("We couldn't send your request. Please try again or email sales@lendgismo.com.");
    } finally {
      setSubmitting(false);
    }
  };

  `;

// Replace lines
const newLines = [
  ...lines.slice(0, startLine),
  ...newFunction.split('\n'),
  ...lines.slice(endLine)
];

const newContent = newLines.join('\n');

// Write back
fs.writeFileSync('client/src/pages/Home.tsx', newContent, 'utf8');

console.log('✓ Successfully updated Home.tsx');
console.log('  - Removed SendGrid/custom function call');
console.log('  - Now using only Netlify Forms');
