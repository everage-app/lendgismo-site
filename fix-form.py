#!/usr/bin/env python3
import re

# Read file
with open('client/src/pages/Home.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

# Define the old and new functions
old_func = """  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSubmitting(true);
    setSubmitError(null);
    try {
      // 1) Send server-side email via Netlify Function (no client mail app required)
      const res = await fetch('/api/contact/email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      if (!res.ok) throw new Error(`Email send failed (${res.status})`);

      // 2) Best-effort: also log to Netlify Forms dashboard (non-blocking)
      try {
        const form = e.currentTarget;
        await fetch('/', {
          method: 'POST',
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
          body: new URLSearchParams(new FormData(form) as any).toString(),
        });
      } catch {}

      setLastEmail(formData.email);
      setSubmitted(true);
      setFormData({ firstName: "", lastName: "", email: "", company: "", role: "", interest: "", message: "" });
    } catch (err) {
      console.error("Contact submit failed", err);
      // Fallback: open mailto so the lead is not lost
      const url = buildMailtoUrl();
      setTimeout(() => { window.location.href = url; }, 50);
      setSubmitError("We couldn't send automatically, opening your email app instead.");
    } finally {
      setSubmitting(false);
    }
  };"""

new_func = """  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
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
  };"""

# Replace (try both straight quotes and curly quotes)
if old_func in content:
    new_content = content.replace(old_func, new_func)
    print("✓ Found and replaced with straight quotes")
elif old_func.replace("'", "'").replace(""", '"').replace(""", '"') in content:
    old_func_curly = old_func.replace("'", "'").replace(""", '"').replace(""", '"')
    new_content = content.replace(old_func_curly, new_func)
    print("✓ Found and replaced with curly quotes")
else:
    print("✗ Could not find exact match. Looking for partial match...")
    # Try finding the start of the function
    if "const handleSubmit = async" in content:
        print("  Found function start, attempting regex replacement...")
        # Use regex to replace from function start to end
        pattern = r'  const handleSubmit = async \(e: React\.FormEvent<HTMLFormElement>\) => \{[^}]+\{[^}]+\}[^}]+\{[^}]+\}[^}]+\{[^}]+\}[^}]+\};'
        match = re.search(pattern, content, re.DOTALL)
        if match:
            print(f"  Matched {len(match.group(0))} characters")
        else:
            # Try simpler: just find between handleSubmit and useEffect
            start_idx = content.find('  const handleSubmit =')
            end_idx = content.find('  useEffect(() => {', start_idx)
            if start_idx != -1 and end_idx != -1:
                # Extract the old function
                extracted = content[start_idx:end_idx].rstrip() + '\n'
                print(f"  Extracted {len(extracted)} characters between handleSubmit and useEffect")
                print(f"  First 200 chars: {extracted[:200]}")
                new_content = content[:start_idx] + new_func + '\n\n' + content[end_idx:]
                print("✓ Replaced using position-based extraction")
            else:
                print("  Could not find function boundaries")
                new_content = content
    else:
        print("  Function not found at all")
        new_content = content

# Write back
with open('client/src/pages/Home.tsx', 'w', encoding='utf-8') as f:
    f.write(new_content)

print("Done! File updated.")
