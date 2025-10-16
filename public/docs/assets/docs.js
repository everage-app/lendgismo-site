// Lendgismo Documentation Router & Renderer

class DocsApp {
  constructor() {
    this.toc = [];
    this.currentDoc = null;
    this.searchIndex = [];
    this.init();
  }

  async init() {
    await this.loadTOC();
    this.setupRouter();
    this.setupSearch();
    this.setupThemeToggle();
    this.renderSidebar();
    this.loadInitialDoc();
  }

  async loadTOC() {
    try {
      const response = await fetch('/docs/_toc.json');
      this.toc = await response.json();
      this.buildSearchIndex();
    } catch (error) {
      console.error('Failed to load TOC:', error);
      this.showError('Failed to load documentation table of contents');
    }
  }

  buildSearchIndex() {
    this.searchIndex = this.toc.map(item => ({
      title: item.title.toLowerCase(),
      file: item.file,
      displayTitle: item.title
    }));
  }

  setupRouter() {
    window.addEventListener('hashchange', () => this.handleRouteChange());
    window.addEventListener('popstate', () => this.handleRouteChange());
  }

  handleRouteChange() {
    const hash = window.location.hash.slice(1);
    if (hash) {
      const docFile = hash.replace('doc=', '');
      this.loadDoc(docFile);
    }
  }

  loadInitialDoc() {
    const hash = window.location.hash.slice(1);
    if (hash) {
      const docFile = hash.replace('doc=', '');
      this.loadDoc(docFile);
    } else {
      // Default to Features Overview or first doc
      const defaultDoc = this.toc.find(item => item.file === '40_features-overview.md') || this.toc[0];
      if (defaultDoc) {
        this.loadDoc(defaultDoc.file);
      }
    }
  }

  async loadDoc(filename) {
    const contentEl = document.getElementById('content');
    contentEl.innerHTML = '<div class="loading">Loading documentation...</div>';
    
    this.currentDoc = filename;
    this.updateActiveLink(filename);
    
    try {
      const response = await fetch(`/docs/${filename}`);
      if (!response.ok) throw new Error('Document not found');
      
      const markdown = await response.text();
      const html = marked.parse(markdown);
      
      contentEl.innerHTML = `<div class="markdown-body">${html}</div>`;
      
      // Add anchor links to headings
      this.addHeadingAnchors();
      
      // Syntax highlighting
      if (window.Prism) {
        Prism.highlightAllUnder(contentEl);
      }
      
      // Update URL
      window.location.hash = `doc=${filename}`;
      
      // Scroll to top
      window.scrollTo(0, 0);
      
    } catch (error) {
      console.error('Failed to load document:', error);
      this.showError(`Failed to load document: ${filename}`);
    }
  }

  addHeadingAnchors() {
    const headings = document.querySelectorAll('.markdown-body h2, .markdown-body h3, .markdown-body h4');
    headings.forEach(heading => {
      const id = heading.textContent.toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '');
      heading.id = id;
      
      const anchor = document.createElement('a');
      anchor.href = `#${id}`;
      anchor.className = 'heading-anchor';
      anchor.textContent = '#';
      heading.appendChild(anchor);
    });
  }

  renderSidebar() {
    const sidebarEl = document.getElementById('sidebar');
    const nav = document.createElement('ul');
    nav.className = 'sidebar-nav';
    
    this.toc.forEach(item => {
      const li = document.createElement('li');
      const link = document.createElement('a');
      link.href = `#doc=${item.file}`;
      link.className = 'sidebar-link';
      link.textContent = item.title;
      link.dataset.file = item.file;
      link.addEventListener('click', (e) => {
        e.preventDefault();
        this.loadDoc(item.file);
      });
      li.appendChild(link);
      nav.appendChild(li);
    });
    
    sidebarEl.innerHTML = '';
    sidebarEl.appendChild(nav);
  }

  updateActiveLink(filename) {
    document.querySelectorAll('.sidebar-link').forEach(link => {
      link.classList.remove('active');
      if (link.dataset.file === filename) {
        link.classList.add('active');
      }
    });
  }

  setupSearch() {
    const searchInput = document.getElementById('search');
    if (!searchInput) return;
    
    searchInput.addEventListener('input', (e) => {
      const query = e.target.value.toLowerCase();
      this.filterSidebar(query);
    });
  }

  filterSidebar(query) {
    const links = document.querySelectorAll('.sidebar-link');
    
    if (!query) {
      links.forEach(link => {
        link.style.display = 'block';
      });
      return;
    }
    
    links.forEach(link => {
      const title = link.textContent.toLowerCase();
      const file = link.dataset.file.toLowerCase();
      
      if (title.includes(query) || file.includes(query)) {
        link.style.display = 'block';
        
        // Highlight matching text
        const text = link.textContent;
        const index = text.toLowerCase().indexOf(query);
        if (index !== -1) {
          const before = text.slice(0, index);
          const match = text.slice(index, index + query.length);
          const after = text.slice(index + query.length);
          link.innerHTML = `${before}<mark style="background: rgba(var(--brand-500), 0.3); color: white;">${match}</mark>${after}`;
        }
      } else {
        link.style.display = 'none';
      }
    });
  }

  setupThemeToggle() {
    const toggleBtn = document.getElementById('theme-toggle');
    if (!toggleBtn) return;
    
    const html = document.documentElement;
    const savedTheme = localStorage.getItem('docs-theme') || 'dark';
    html.classList.toggle('dark', savedTheme === 'dark');
    
    toggleBtn.addEventListener('click', () => {
      const isDark = html.classList.toggle('dark');
      localStorage.setItem('docs-theme', isDark ? 'dark' : 'light');
      this.updateThemeIcon(isDark);
    });
    
    this.updateThemeIcon(savedTheme === 'dark');
  }

  updateThemeIcon(isDark) {
    const toggleBtn = document.getElementById('theme-toggle');
    if (!toggleBtn) return;
    
    toggleBtn.innerHTML = isDark 
      ? '<svg width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="10" cy="10" r="5"/><line x1="10" y1="1" x2="10" y2="3"/><line x1="10" y1="17" x2="10" y2="19"/><line x1="3.93" y1="3.93" x2="5.34" y2="5.34"/><line x1="14.66" y1="14.66" x2="16.07" y2="16.07"/><line x1="1" y1="10" x2="3" y2="10"/><line x1="17" y1="10" x2="19" y2="10"/><line x1="3.93" y1="16.07" x2="5.34" y2="14.66"/><line x1="14.66" y1="5.34" x2="16.07" y2="3.93"/></svg>'
      : '<svg width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>';
  }

  showError(message) {
    const contentEl = document.getElementById('content');
    contentEl.innerHTML = `
      <div class="error">
        <strong>Error:</strong> ${message}
        <br><br>
        <a href="/docs/">Return to documentation home</a>
      </div>
    `;
  }
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    window.docsApp = new DocsApp();
  });
} else {
  window.docsApp = new DocsApp();
}
