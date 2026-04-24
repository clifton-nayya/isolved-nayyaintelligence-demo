/**
 * Layout helper: injects the shared topbar + side nav + flyout into every page.
 * Also injects the chat widget shell on any page under /benefits/.
 *
 * Usage: in each HTML page, include a <body> with data-page attribute,
 * then include this script. It reads data-page to mark the active nav item.
 */

(function () {
  // ----- Resolve base path so it works on GitHub Pages subpaths -----
  // If the site is served from /isolved-nayyaintelligence-demo/, find that prefix.
  const path = window.location.pathname;
  const repoMatch = path.match(/^\/[^/]+\//);
  // Heuristic: if we're in a /benefits/ subpath, strip it to find the base.
  let BASE = '';
  if (path.includes('/benefits/')) {
    BASE = path.substring(0, path.indexOf('/benefits/'));
  } else {
    // remove trailing filename like /index.html
    BASE = path.replace(/\/[^/]*$/, '');
  }
  if (BASE === '/') BASE = '';
  window.__SITE_BASE__ = BASE;

  function href(p) { return BASE + p; }

  const page = document.body.dataset.page || 'home';
  const isBenefits = page.startsWith('benefits-') || page === 'benefits';
  if (isBenefits) document.body.classList.add('has-subnav');

  // ---------------- Topbar ----------------
  const topbar = document.createElement('header');
  topbar.className = 'topbar';
  topbar.innerHTML = `
    <button class="hamburger" aria-label="Menu" id="btnMenu">
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M4 7h16M4 12h16M4 17h16"/></svg>
    </button>
    <a class="logo" href="${href('/index.html')}" style="text-decoration:none">
      <span class="i">i</span><span class="rest">solved</span><sup>&reg;</sup>
    </a>
    <div class="right">
      <button class="icon-btn" aria-label="Notifications">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M18 16v-5a6 6 0 10-12 0v5l-2 2h16l-2-2z"/><path d="M10 20a2 2 0 004 0"/></svg>
      </button>
      <div class="avatar">JD</div>
      <button class="icon-btn" aria-label="Apps">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><rect x="3"  y="3"  width="4" height="4" rx="1"/><rect x="10" y="3"  width="4" height="4" rx="1"/><rect x="17" y="3"  width="4" height="4" rx="1"/><rect x="3"  y="10" width="4" height="4" rx="1"/><rect x="10" y="10" width="4" height="4" rx="1"/><rect x="17" y="10" width="4" height="4" rx="1"/><rect x="3"  y="17" width="4" height="4" rx="1"/><rect x="10" y="17" width="4" height="4" rx="1"/><rect x="17" y="17" width="4" height="4" rx="1"/></svg>
      </button>
    </div>
  `;
  document.body.prepend(topbar);

  // ---------------- Side nav ----------------
  // Primary nav is identical on every page. The Home link lives on the
  // sub-nav (top bar), not in the sidebar.
  const side = document.createElement('nav');
  side.className = 'sidenav';
  side.innerHTML = `
    <a class="nav-item" href="#time">
      <svg viewBox="0 0 24 24" fill="none" stroke="#333" stroke-width="2"><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></svg>
      <span class="label">Time and<br>Attendance</span>
    </a>
    <a class="nav-item" href="#pay">
      <svg viewBox="0 0 24 24" fill="none" stroke="#333" stroke-width="2"><rect x="3" y="7" width="18" height="12" rx="1.5"/><path d="M3 11h18"/><circle cx="8" cy="15" r="1"/></svg>
      <span class="label">Pay and Tax</span>
    </a>
    <a class="nav-item" href="#personal">
      <svg viewBox="0 0 24 24" fill="none" stroke="#333" stroke-width="2"><circle cx="12" cy="8" r="4"/><path d="M4 21c0-4 4-7 8-7s8 3 8 7"/></svg>
      <span class="label">Personal</span>
    </a>
    <a class="nav-item ${isBenefits ? 'active' : ''}" href="#" id="navBenefits">
      <svg viewBox="0 0 24 24" fill="none" stroke="${isBenefits ? '#EC2C7F' : '#333'}" stroke-width="2"><path d="M12 21s-7-4.5-9-9a5 5 0 019-3 5 5 0 019 3c-2 4.5-9 9-9 9z"/></svg>
      <span class="label">Benefits</span>
    </a>
  `;
  document.body.appendChild(side);

  // ---------------- Flyout ----------------
  const flyout = document.createElement('aside');
  flyout.className = 'flyout';
  flyout.id = 'flyout';
  flyout.innerHTML = `
    <a href="${href('/benefits/benefits-summary.html')}">My Benefits</a>
    <a href="${href('/benefits/enrollment.html')}">Benefit Enrollment</a>
    <a href="${href('/benefits/assistant.html')}">Benefits Assistant</a>
    <a href="${href('/benefits/life-events.html')}">Qualifying Life Events</a>
    <a href="#services">Benefit Services</a>
  `;
  document.body.appendChild(flyout);

  const scrim = document.createElement('div');
  scrim.className = 'scrim';
  scrim.id = 'scrim';
  document.body.appendChild(scrim);

  // ---------------- Sub-nav (only on benefits pages) ----------------
  if (isBenefits) {
    const activeKey = page.replace('benefits-', '');
    const subnav = document.createElement('nav');
    subnav.className = 'subnav';
    subnav.innerHTML = `
      <a class="home-link" href="${href('/index.html')}" aria-label="Home">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M3 12l9-8 9 8"/>
          <path d="M5 10v10h14V10"/>
        </svg>
      </a>
      <div class="subnav-tabs">
        <a class="tab ${activeKey === 'summary' ? 'active' : ''}"     href="${href('/benefits/benefits-summary.html')}">My Benefits</a>
        <a class="tab ${activeKey === 'enrollment' ? 'active' : ''}"  href="${href('/benefits/enrollment.html')}">Benefit Enrollment</a>
        <a class="tab ${activeKey === 'assistant' ? 'active' : ''}"   href="${href('/benefits/assistant.html')}">Benefits Assistant</a>
        <a class="tab ${activeKey === 'life-events' ? 'active' : ''}" href="${href('/benefits/life-events.html')}">Qualifying Life Events</a>
        <a class="tab" href="#services">Benefit Services</a>
      </div>
    `;
    document.body.appendChild(subnav);
  }

  const benefitsNavEl = document.getElementById('navBenefits');
  const benefitsSvgPath = benefitsNavEl.querySelector('svg path');

  function setBenefitsHighlight(on) {
    if (isBenefits) return; // already active on benefits pages
    benefitsNavEl.classList.toggle('active', on);
    if (benefitsSvgPath) benefitsSvgPath.setAttribute('stroke', on ? '#EC2C7F' : '#333');
  }
  function closeFlyout() {
    flyout.classList.remove('open');
    scrim.classList.remove('open');
    setBenefitsHighlight(false);
  }
  function toggleFlyout() {
    const open = flyout.classList.toggle('open');
    scrim.classList.toggle('open', open);
    setBenefitsHighlight(open);
  }
  document.getElementById('btnMenu').addEventListener('click', function (e) {
    e.preventDefault();
    toggleFlyout();
  });
  benefitsNavEl.addEventListener('click', function (e) {
    e.preventDefault();
    toggleFlyout();
  });
  scrim.addEventListener('click', closeFlyout);

  // Expose helper so pages can use the resolved base in other links
  window.SITE = { BASE, href };
})();
