# Read the file
$content = Get-Content -Path "client\src\pages\Home.tsx" -Raw

# Replace the handleSubmit function
$oldFunction = @'
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
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
  };
'@

$newFunction = @'
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
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
'@

$newContent = $content -replace [regex]::Escape($oldFunction), $newFunction

# Write back to file
Set-Content -Path "client\src\pages\Home.tsx" -Value $newContent -NoNewline

Write-Host "Updated Home.tsx - removed SendGrid function call, using only Netlify Forms" -ForegroundColor Green
