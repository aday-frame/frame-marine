/* ── UPGRADE OVERLAY MODULE ── */
const Upgrade = (() => {
  const MODULES = {
    compliance: {
      name: 'Compliance',
      tagline: 'STCW · ISM · Certificate Management',
      description: 'Stay audit-ready with automated certificate expiry alerts, STCW hours of rest tracking, and ISM drill records — all in one place.',
      color: '#A78BFA',
      pages: ['certificates', 'safety', 'hours'],
      price: '$49',
      period: '/vessel/month',
      features: [
        { icon: '📋', text: 'Certificate expiry tracking with 30 & 90-day alerts' },
        { icon: '⏱', text: 'STCW hours of rest — daily log & violation detection' },
        { icon: '🛡', text: 'ISM drill records and non-conformance reporting' },
        { icon: '📄', text: 'Flag state audit-ready document export' },
        { icon: '✅', text: 'Crew competency and endorsement tracking' },
      ],
      screenHtml: `
        <div style="display:flex;gap:6px;margin-bottom:8px">
          <div style="flex:1;background:#0f0f0e;border-radius:5px;padding:8px;text-align:center">
            <div style="font-size:16px;font-weight:600;color:#4ADE80">8</div>
            <div style="font-size:8px;color:#52524A">Valid</div>
          </div>
          <div style="flex:1;background:#0f0f0e;border-radius:5px;padding:8px;text-align:center">
            <div style="font-size:16px;font-weight:600;color:#FACC15">3</div>
            <div style="font-size:8px;color:#52524A">Expiring</div>
          </div>
          <div style="flex:1;background:#0f0f0e;border-radius:5px;padding:8px;text-align:center">
            <div style="font-size:16px;font-weight:600;color:#F87171">1</div>
            <div style="font-size:8px;color:#52524A">Expired</div>
          </div>
        </div>
        <div style="display:flex;flex-direction:column;gap:3px">
          <div style="display:flex;justify-content:space-between;align-items:center;background:#0f0f0e;border-radius:4px;padding:6px 8px">
            <span style="font-size:9px;color:#9A9A92">Safety Management Certificate</span>
            <span style="font-size:9px;font-weight:600;color:#4ADE80">182d left</span>
          </div>
          <div style="display:flex;justify-content:space-between;align-items:center;background:#0f0f0e;border-radius:4px;padding:6px 8px">
            <span style="font-size:9px;color:#9A9A92">MARPOL Certificate</span>
            <span style="font-size:9px;font-weight:600;color:#FACC15">28d left</span>
          </div>
          <div style="display:flex;justify-content:space-between;align-items:center;background:#0f0f0e;border-radius:4px;padding:6px 8px">
            <span style="font-size:9px;color:#9A9A92">Hours of rest — Jake Burton</span>
            <span style="font-size:9px;font-weight:600;color:#F87171">⚠ Violation</span>
          </div>
          <div style="display:flex;justify-content:space-between;align-items:center;background:#0f0f0e;border-radius:4px;padding:6px 8px">
            <span style="font-size:9px;color:#9A9A92">Fire drill — ISM 8.7</span>
            <span style="font-size:9px;font-weight:600;color:#4ADE80">Completed</span>
          </div>
        </div>
      `
    },

    owner: {
      name: 'Owner Suite',
      tagline: 'Budget · P&L · Owner Reporting',
      description: 'Give owners complete financial visibility with operating budgets, charter P&L breakdowns, and branded PDF reports generated in one click.',
      color: '#60A5FA',
      pages: ['budget', 'owner'],
      price: '$79',
      period: '/vessel/month',
      features: [
        { icon: '💰', text: 'Annual OPEX budget with live YTD variance tracking' },
        { icon: '📊', text: 'Revenue vs. OPEX P&L by charter and vessel' },
        { icon: '📃', text: 'Branded PDF owner reports generated instantly' },
        { icon: '🧾', text: 'APA advance tracking and reconciliation' },
        { icon: '📈', text: 'Monthly cost breakdown by department' },
      ],
      screenHtml: `
        <div style="display:flex;gap:6px;margin-bottom:8px">
          <div style="flex:1;background:#0f0f0e;border-radius:5px;padding:8px;text-align:center">
            <div style="font-size:13px;font-weight:600;color:#F0F0EC">$420k</div>
            <div style="font-size:8px;color:#52524A">Annual budget</div>
          </div>
          <div style="flex:1;background:#0f0f0e;border-radius:5px;padding:8px;text-align:center">
            <div style="font-size:13px;font-weight:600;color:#4ADE80">$168k</div>
            <div style="font-size:8px;color:#52524A">Spent YTD</div>
          </div>
          <div style="flex:1;background:#0f0f0e;border-radius:5px;padding:8px;text-align:center">
            <div style="font-size:13px;font-weight:600;color:#4ADE80">−$12k</div>
            <div style="font-size:8px;color:#52524A">Under budget</div>
          </div>
        </div>
        <div style="display:flex;flex-direction:column;gap:5px">
          <div>
            <div style="display:flex;justify-content:space-between;margin-bottom:2px">
              <span style="font-size:8px;color:#9A9A92">Crew salaries</span>
              <span style="font-size:8px;font-weight:600;color:#4ADE80">75%</span>
            </div>
            <div style="height:4px;background:#0f0f0e;border-radius:2px;overflow:hidden"><div style="height:100%;width:75%;background:#4ADE80;border-radius:2px"></div></div>
          </div>
          <div>
            <div style="display:flex;justify-content:space-between;margin-bottom:2px">
              <span style="font-size:8px;color:#9A9A92">Fuel &amp; lubricants</span>
              <span style="font-size:8px;font-weight:600;color:#FACC15">88%</span>
            </div>
            <div style="height:4px;background:#0f0f0e;border-radius:2px;overflow:hidden"><div style="height:100%;width:88%;background:#FACC15;border-radius:2px"></div></div>
          </div>
          <div>
            <div style="display:flex;justify-content:space-between;margin-bottom:2px">
              <span style="font-size:8px;color:#9A9A92">Marina &amp; port fees</span>
              <span style="font-size:8px;font-weight:600;color:#4ADE80">45%</span>
            </div>
            <div style="height:4px;background:#0f0f0e;border-radius:2px;overflow:hidden"><div style="height:100%;width:45%;background:#4ADE80;border-radius:2px"></div></div>
          </div>
          <div>
            <div style="display:flex;justify-content:space-between;margin-bottom:2px">
              <span style="font-size:8px;color:#9A9A92">Insurance</span>
              <span style="font-size:8px;font-weight:600;color:#F87171">102%</span>
            </div>
            <div style="height:4px;background:#0f0f0e;border-radius:2px;overflow:hidden"><div style="height:100%;width:100%;background:#F87171;border-radius:2px"></div></div>
          </div>
        </div>
      `
    },

    charter: {
      name: 'Charter',
      tagline: 'Bookings · Guests · APA · Documents',
      description: 'Manage every charter from enquiry to handover — booking calendar, guest preferences, APA tracking, and a pre-departure document pack in one place.',
      color: '#F97316',
      pages: ['charter'],
      price: '$49',
      period: '/vessel/month',
      features: [
        { icon: '📅', text: 'Booking calendar with enquiry pipeline and hold dates' },
        { icon: '👥', text: 'Guest profiles — preferences, dietary, passports, emergency contacts' },
        { icon: '💰', text: 'APA advance tracking and live expenditure dashboard' },
        { icon: '📋', text: 'Pre-departure checklists auto-assigned to charter crew' },
        { icon: '📄', text: 'Charter document pack — MYBA contract, crew list, itinerary' },
      ],
      screenHtml: `
        <div style="display:flex;gap:6px;margin-bottom:8px">
          <div style="flex:1;background:#0f0f0e;border-radius:5px;padding:8px;text-align:center">
            <div style="font-size:14px;font-weight:600;color:#F97316">4</div>
            <div style="font-size:8px;color:#52524A">Bookings</div>
          </div>
          <div style="flex:1;background:#0f0f0e;border-radius:5px;padding:8px;text-align:center">
            <div style="font-size:14px;font-weight:600;color:#4ADE80">$186k</div>
            <div style="font-size:8px;color:#52524A">Revenue</div>
          </div>
          <div style="flex:1;background:#0f0f0e;border-radius:5px;padding:8px;text-align:center">
            <div style="font-size:14px;font-weight:600;color:#FACC15">$8.4k</div>
            <div style="font-size:8px;color:#52524A">APA balance</div>
          </div>
        </div>
        <div style="display:flex;flex-direction:column;gap:3px">
          <div style="display:flex;justify-content:space-between;align-items:center;background:#0f0f0e;border-radius:4px;padding:6px 8px">
            <span style="font-size:9px;color:#9A9A92">Collins family — 7 May</span>
            <span style="font-size:9px;font-weight:600;color:#F97316">● Active</span>
          </div>
          <div style="display:flex;justify-content:space-between;align-items:center;background:#0f0f0e;border-radius:4px;padding:6px 8px">
            <span style="font-size:9px;color:#9A9A92">Martinez party — 18 May</span>
            <span style="font-size:9px;font-weight:600;color:#F97316">Upcoming</span>
          </div>
          <div style="display:flex;justify-content:space-between;align-items:center;background:#0f0f0e;border-radius:4px;padding:6px 8px">
            <span style="font-size:9px;color:#9A9A92">APA — provisions &amp; fuel</span>
            <span style="font-size:9px;font-weight:600;color:#4ADE80">$2,140 logged</span>
          </div>
        </div>
      `
    }
  };

  let _current = null;

  function _moduleForPage(pageId) {
    for (const [id, mod] of Object.entries(MODULES)) {
      if (mod.pages.includes(pageId)) return [id, mod];
    }
    return null;
  }

  function isLocked(pageId) { return !!_moduleForPage(pageId); }

  function show(pageId) {
    let moduleId, mod;
    if (MODULES[pageId]) {
      moduleId = pageId;
      mod = MODULES[pageId];
    } else {
      const entry = _moduleForPage(pageId);
      if (!entry) return false;
      [moduleId, mod] = entry;
    }
    _current = moduleId;

    const overlay = document.getElementById('upgrade-overlay');
    if (!overlay) return false;

    overlay.innerHTML = `
      <div class="upgrade-card">
        <div class="upgrade-accent" style="background:linear-gradient(90deg,transparent,${mod.color}55,transparent)"></div>

        <!-- Header -->
        <div style="padding:24px 24px 18px">
          <div style="display:flex;align-items:center;gap:12px;margin-bottom:14px">
            <div style="width:42px;height:42px;border-radius:10px;background:${mod.color}18;border:.5px solid ${mod.color}40;display:flex;align-items:center;justify-content:center;flex-shrink:0">
              <svg viewBox="0 0 16 16" fill="${mod.color}" style="width:18px;height:18px">
                <path d="M8 1a3 3 0 00-3 3v1H4a1 1 0 00-1 1v7a1 1 0 001 1h8a1 1 0 001-1V6a1 1 0 00-1-1h-1V4a3 3 0 00-3-3zm0 1.5a1.5 1.5 0 011.5 1.5V5h-3V4A1.5 1.5 0 018 2.5zM7 9a1 1 0 112 0 1 1 0 01-2 0z"/>
              </svg>
            </div>
            <div style="flex:1;min-width:0">
              <div style="display:flex;align-items:center;gap:8px;margin-bottom:2px">
                <span style="font-size:16px;font-weight:600;color:var(--txt)">${mod.name}</span>
                <span style="font-size:9px;font-weight:700;text-transform:uppercase;letter-spacing:.08em;padding:2px 8px;border-radius:20px;background:${mod.color}18;color:${mod.color}">Add-on</span>
              </div>
              <div style="font-size:11px;color:var(--txt3)">${mod.tagline}</div>
            </div>
          </div>
          <div style="font-size:12px;color:var(--txt2);line-height:1.65">${mod.description}</div>
        </div>

        <!-- Preview screenshot -->
        <div style="margin:0 16px 16px;background:var(--bg);border:.5px solid var(--bd);border-radius:10px;padding:14px">
          <div style="font-size:9px;font-weight:700;text-transform:uppercase;letter-spacing:.09em;color:var(--txt4);margin-bottom:10px">Live preview</div>
          ${mod.screenHtml}
        </div>

        <!-- Features -->
        <div style="padding:0 16px 16px">
          <div style="font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:.08em;color:var(--txt3);margin-bottom:10px">What's included</div>
          <div style="display:flex;flex-direction:column;gap:7px">
            ${mod.features.map(f => `
              <div style="display:flex;align-items:flex-start;gap:10px">
                <div style="width:22px;height:22px;border-radius:6px;background:${mod.color}15;display:flex;align-items:center;justify-content:center;flex-shrink:0;font-size:12px;line-height:1">${f.icon}</div>
                <span style="font-size:12px;color:var(--txt2);padding-top:4px;line-height:1.4">${f.text}</span>
              </div>
            `).join('')}
          </div>
        </div>

        <!-- Pricing & CTA -->
        <div style="padding:16px;border-top:.5px solid var(--bd);display:flex;align-items:center;justify-content:space-between;gap:12px;flex-wrap:wrap">
          <div>
            <div style="font-size:22px;font-weight:600;color:var(--txt);line-height:1">${mod.price}<span style="font-size:12px;font-weight:400;color:var(--txt3)">${mod.period}</span></div>
            <div style="font-size:10px;color:var(--txt3);margin-top:3px">Billed monthly · Cancel anytime</div>
          </div>
          <div style="display:flex;gap:8px;align-items:center">
            <button class="btn btn-ghost btn-sm" onclick="Upgrade.hide()">Not now</button>
            <button class="btn btn-sm" style="background:${mod.color};color:#080808;font-weight:700;padding:7px 16px"
              onclick="Upgrade.contact('${moduleId}')">
              Upgrade plan →
            </button>
          </div>
        </div>
      </div>
    `;

    overlay.classList.add('open');
    return true;
  }

  function hide() {
    const overlay = document.getElementById('upgrade-overlay');
    if (overlay) overlay.classList.remove('open');
    _current = null;
  }

  function contact(moduleId) {
    const mod = MODULES[moduleId];
    if (!mod) return;
    window.location.href = 'mailto:hello@framemarine.io?subject=' +
      encodeURIComponent(mod.name + ' module — upgrade enquiry') +
      '&body=' + encodeURIComponent('Hi,\n\nI\'d like to add the ' + mod.name + ' module to my Frame account.\n\nVessel: Lady M\nContact: ');
  }

  return { show, hide, isLocked, contact };
})();

window.Upgrade = Upgrade;
