const fs = require('fs');
const path = require('path');
const { JSDOM } = require('jsdom');

function optimizeLendgismoPages() {
  const publicDir = path.join(__dirname, '../public/lp');
  const outputFile = path.join(__dirname, '../docs/landing-pages-audit.md');
  
  if (!fs.existsSync(publicDir)) {
    console.error('Landing pages directory not found:', publicDir);
    return;
  }

  const report = [];
  report.push('# Lendgismo Landing Pages SEO & Conversion Audit\n');
  report.push(`Generated: ${new Date().toISOString()}\n`);
  report.push('---\n\n');

  // Read all landing page directories
  const lpDirs = fs.readdirSync(publicDir, { withFileTypes: true })
    .filter(dirent => dirent.isDirectory())
    .map(dirent => dirent.name);

  console.log(`Found ${lpDirs.length} landing pages`);

  lpDirs.forEach((dir, index) => {
    const indexPath = path.join(publicDir, dir, 'index.html');
    
    if (!fs.existsSync(indexPath)) {
      console.log(`Skipping ${dir} - no index.html`);
      return;
    }

    const html = fs.readFileSync(indexPath, 'utf-8');
    const dom = new JSDOM(html);
    const doc = dom.window.document;

    // Extract metadata
    const title = doc.querySelector('title')?.textContent || 'No title';
    const metaDesc = doc.querySelector('meta[name="description"]')?.getAttribute('content') || 'No description';
    const h1 = doc.querySelector('h1')?.textContent || 'No H1';
    const h2s = Array.from(doc.querySelectorAll('h2')).map(h => h.textContent.trim());
    const canonical = doc.querySelector('link[rel="canonical"]')?.getAttribute('href') || 'No canonical';
    const ogTitle = doc.querySelector('meta[property="og:title"]')?.getAttribute('content') || '';
    const ogDesc = doc.querySelector('meta[property="og:description"]')?.getAttribute('content') || '';
    
    // Extract main content (approximate)
    const bodyText = doc.body?.textContent || '';
    const wordCount = bodyText.split(/\s+/).length;
    
    // Extract CTAs
    const ctaButtons = Array.from(doc.querySelectorAll('a[href*="contact"], a[href*="demo"], button'))
      .map(btn => btn.textContent.trim())
      .filter(text => text.length > 0 && text.length < 50)
      .slice(0, 5);

    // Build report section
    report.push(`## ${index + 1}. ${dir}\n`);
    report.push(`**URL:** https://lendgismo.com/lp/${dir}/\n\n`);
    report.push(`### SEO Metadata\n`);
    report.push(`- **Title:** ${title}\n`);
    report.push(`- **Meta Description:** ${metaDesc}\n`);
    report.push(`- **Canonical:** ${canonical}\n`);
    report.push(`- **OG Title:** ${ogTitle || 'Not set'}\n`);
    report.push(`- **OG Description:** ${ogDesc || 'Not set'}\n\n`);
    
    report.push(`### Content Structure\n`);
    report.push(`- **H1:** ${h1}\n`);
    report.push(`- **H2 Count:** ${h2s.length}\n`);
    if (h2s.length > 0) {
      report.push(`- **H2s:**\n${h2s.slice(0, 5).map(h => `  - ${h}`).join('\n')}\n`);
    }
    report.push(`- **Word Count:** ~${wordCount}\n\n`);
    
    report.push(`### Conversion Elements\n`);
    report.push(`- **CTA Buttons (sample):**\n${ctaButtons.map(cta => `  - "${cta}"`).join('\n') || '  - None found'}\n\n`);
    
    report.push(`### Issues to Address\n`);
    const issues = [];
    if (title.length < 30 || title.length > 60) issues.push(`- Title length (${title.length} chars) - should be 30-60`);
    if (metaDesc.length < 120 || metaDesc.length > 160) issues.push(`- Meta description length (${metaDesc.length} chars) - should be 120-160`);
    if (!ogTitle) issues.push(`- Missing Open Graph title`);
    if (!ogDesc) issues.push(`- Missing Open Graph description`);
    if (h2s.length < 3) issues.push(`- Low H2 count (${h2s.length}) - add more subheadings for scannability`);
    if (wordCount < 300) issues.push(`- Low word count (${wordCount}) - add more content for SEO`);
    if (ctaButtons.length === 0) issues.push(`- No clear CTA buttons found`);
    
    if (issues.length > 0) {
      report.push(issues.join('\n') + '\n\n');
    } else {
      report.push(`- No major issues detected\n\n`);
    }
    
    report.push('---\n\n');
    console.log(`Processed: ${dir}`);
  });

  // Summary
  report.push(`## Summary\n\n`);
  report.push(`Total landing pages analyzed: ${lpDirs.length}\n\n`);
  report.push(`### Next Steps for ChatGPT\n`);
  report.push(`1. Review each landing page section above\n`);
  report.push(`2. For each page, provide:\n`);
  report.push(`   - Optimized title (30-60 chars, keyword-rich)\n`);
  report.push(`   - Optimized meta description (120-160 chars, compelling + keyword)\n`);
  report.push(`   - Improved H1 (clear value prop)\n`);
  report.push(`   - 3-5 recommended H2 subheadings for better structure\n`);
  report.push(`   - CTA copy recommendations\n`);
  report.push(`   - Content expansion ideas to hit 500+ words\n`);
  report.push(`3. Focus on conversion: pain points, benefits, social proof, urgency\n`);
  report.push(`4. Target audience: ${lpDirs.includes('for-mca-funders') ? 'MCA funders, ' : ''}${lpDirs.includes('for-credit-unions-smb') ? 'credit unions, ' : ''}SMB lenders, fintech companies, ISOs/brokers\n\n`);

  fs.writeFileSync(outputFile, report.join(''));
  console.log(`\n✅ Audit complete! Report saved to: ${outputFile}`);
  console.log(`\nCopy the contents of that file and paste into ChatGPT with this prompt:\n`);
  console.log(`"I have ${lpDirs.length} landing pages for a B2B SaaS lending platform. Review the audit below and provide optimized SEO metadata, content structure, and conversion copy recommendations for each page. Focus on maximizing ROI and sales for our target audience (fintech companies, SMB lenders, credit unions, MCA funders, ISOs/brokers)."\n`);
}

module.exports = { optimizeLendgismoPages };

// Run if called directly
if (require.main === module) {
  optimizeLendgismoPages();
}
