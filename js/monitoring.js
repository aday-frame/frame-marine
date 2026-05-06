/* ── FRAME MARINE — MONITORING (upgrade page) ── */
'use strict';

const Mon = window.Mon = {};

Mon.render = function() {
  const wrap = document.getElementById('page-monitoring');
  if (!wrap) return;

  wrap.innerHTML = `
    <div style="height:100%;overflow-y:auto;background:var(--bg)">
    <div style="max-width:900px;margin:0 auto;padding:48px 28px 80px">

      <!-- Badge + headline -->
      <div style="display:flex;align-items:center;gap:10px;margin-bottom:20px">
        <div style="width:36px;height:36px;border-radius:10px;background:rgba(34,211,238,.12);border:.5px solid rgba(34,211,238,.28);display:flex;align-items:center;justify-content:center;flex-shrink:0">
          <svg viewBox="0 0 16 16" fill="none" stroke="#22D3EE" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round" style="width:16px;height:16px"><path d="M1 8h2l2-5 2 9 2-6 2 4 1-2h3"/></svg>
        </div>
        <div>
          <div style="display:flex;align-items:center;gap:8px">
            <span style="font-size:17px;font-weight:600;color:var(--txt)">Real-time Monitoring</span>
            <span style="font-size:9px;font-weight:700;text-transform:uppercase;letter-spacing:.08em;padding:2px 9px;border-radius:20px;background:rgba(34,211,238,.12);color:#22D3EE;border:.5px solid rgba(34,211,238,.28)">Add-on</span>
          </div>
          <div style="font-size:11px;color:var(--txt3);margin-top:1px">Engines · Bilge · Climate · Shore power · Fuel</div>
        </div>
      </div>

      <div style="font-size:14px;color:var(--txt2);line-height:1.75;max-width:600px;margin-bottom:36px">
        Know the health of your vessel before you step aboard. Live engine parameters, bilge levels, shore power status, and climate zones — all in one screen with instant alerts to your phone when something needs attention.
      </div>

      <!-- THE SCREENSHOT MOCKUP -->
      <div style="background:var(--bg2);border:.5px solid var(--bd2);border-radius:16px;overflow:hidden;margin-bottom:36px;position:relative;box-shadow:0 32px 80px rgba(0,0,0,.5)">

        <!-- Top accent line -->
        <div style="position:absolute;top:0;left:10%;right:10%;height:1px;background:linear-gradient(90deg,transparent,rgba(34,211,238,.5),transparent)"></div>

        <!-- Mockup topbar -->
        <div style="padding:12px 18px;border-bottom:.5px solid var(--bd);display:flex;align-items:center;justify-content:space-between">
          <div style="font-size:12px;font-weight:500;color:var(--txt)">Monitoring — M/Y Lady M</div>
          <div style="display:flex;gap:6px;align-items:center">
            <span style="font-size:9px;background:rgba(34,211,238,.12);color:#22D3EE;border:.5px solid rgba(34,211,238,.28);padding:2px 9px;border-radius:10px;font-weight:600">● Live</span>
            <span style="font-size:9px;color:var(--txt3)">Updated just now</span>
          </div>
        </div>

        <!-- Stats bar -->
        <div style="display:grid;grid-template-columns:repeat(5,1fr);border-bottom:.5px solid var(--bd)">
          <div style="padding:12px 16px;border-right:.5px solid var(--bd)">
            <div style="font-size:9px;color:var(--txt3);text-transform:uppercase;letter-spacing:.08em;font-weight:600;margin-bottom:4px">Shore power</div>
            <div style="font-size:18px;font-weight:600;color:#4ADE80">ON</div>
          </div>
          <div style="padding:12px 16px;border-right:.5px solid var(--bd)">
            <div style="font-size:9px;color:var(--txt3);text-transform:uppercase;letter-spacing:.08em;font-weight:600;margin-bottom:4px">Load</div>
            <div style="font-size:18px;font-weight:600;color:var(--txt)">14.2 <span style="font-size:11px;color:var(--txt3)">kW</span></div>
          </div>
          <div style="padding:12px 16px;border-right:.5px solid var(--bd)">
            <div style="font-size:9px;color:var(--txt3);text-transform:uppercase;letter-spacing:.08em;font-weight:600;margin-bottom:4px">Engines</div>
            <div style="font-size:18px;font-weight:600;color:#F87171">1 warn</div>
          </div>
          <div style="padding:12px 16px;border-right:.5px solid var(--bd)">
            <div style="font-size:9px;color:var(--txt3);text-transform:uppercase;letter-spacing:.08em;font-weight:600;margin-bottom:4px">Bilge</div>
            <div style="font-size:18px;font-weight:600;color:#4ADE80">All dry</div>
          </div>
          <div style="padding:12px 16px">
            <div style="font-size:9px;color:var(--txt3);text-transform:uppercase;letter-spacing:.08em;font-weight:600;margin-bottom:4px">Fuel</div>
            <div style="font-size:18px;font-weight:600;color:var(--txt)">68%</div>
          </div>
        </div>

        <div style="display:grid;grid-template-columns:1fr 1fr;gap:0;border-bottom:.5px solid var(--bd)">

          <!-- ENGINE SECTION -->
          <div style="padding:16px 18px;border-right:.5px solid var(--bd)">
            <div style="font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:.09em;color:var(--txt3);margin-bottom:12px;display:flex;align-items:center;gap:6px">
              <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.3" stroke-linecap="round" style="width:12px;height:12px;color:#22D3EE"><rect x="2" y="4" width="12" height="8" rx="1"/><path d="M5 4V2M11 4V2M2 8h-.5M14.5 8H15"/></svg>
              Engines
            </div>

            <!-- PORT ENGINE -->
            <div style="margin-bottom:12px">
              <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:8px">
                <span style="font-size:11px;font-weight:500;color:var(--txt)">Port · MAN V8-1200</span>
                <span style="font-size:9px;font-weight:600;background:rgba(248,113,113,.14);color:#F87171;padding:2px 8px;border-radius:8px">⚠ Warning</span>
              </div>
              <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:5px">
                <div style="background:var(--bg3);border-radius:6px;padding:8px">
                  <div style="font-size:8px;color:var(--txt3);margin-bottom:2px">RPM</div>
                  <div style="font-size:14px;font-weight:600;color:var(--txt)">—</div>
                  <div style="font-size:8px;color:var(--txt3)">At rest</div>
                </div>
                <div style="background:rgba(248,113,113,.08);border:.5px solid rgba(248,113,113,.25);border-radius:6px;padding:8px">
                  <div style="font-size:8px;color:var(--txt3);margin-bottom:2px">Oil press.</div>
                  <div style="font-size:14px;font-weight:600;color:#F87171">28 psi</div>
                  <div style="font-size:8px;color:#F87171">Low ↓</div>
                </div>
                <div style="background:var(--bg3);border-radius:6px;padding:8px">
                  <div style="font-size:8px;color:var(--txt3);margin-bottom:2px">Coolant</div>
                  <div style="font-size:14px;font-weight:600;color:#4ADE80">82°C</div>
                  <div style="font-size:8px;color:var(--txt3)">Normal</div>
                </div>
              </div>
            </div>

            <!-- STBD ENGINE -->
            <div>
              <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:8px">
                <span style="font-size:11px;font-weight:500;color:var(--txt)">Stbd · MAN V8-1200</span>
                <span style="font-size:9px;font-weight:600;background:rgba(74,222,128,.10);color:#4ADE80;padding:2px 8px;border-radius:8px">✓ Normal</span>
              </div>
              <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:5px">
                <div style="background:var(--bg3);border-radius:6px;padding:8px">
                  <div style="font-size:8px;color:var(--txt3);margin-bottom:2px">RPM</div>
                  <div style="font-size:14px;font-weight:600;color:var(--txt)">—</div>
                  <div style="font-size:8px;color:var(--txt3)">At rest</div>
                </div>
                <div style="background:var(--bg3);border-radius:6px;padding:8px">
                  <div style="font-size:8px;color:var(--txt3);margin-bottom:2px">Oil press.</div>
                  <div style="font-size:14px;font-weight:600;color:#4ADE80">48 psi</div>
                  <div style="font-size:8px;color:var(--txt3)">Normal</div>
                </div>
                <div style="background:var(--bg3);border-radius:6px;padding:8px">
                  <div style="font-size:8px;color:var(--txt3);margin-bottom:2px">Coolant</div>
                  <div style="font-size:14px;font-weight:600;color:#4ADE80">84°C</div>
                  <div style="font-size:8px;color:var(--txt3)">Normal</div>
                </div>
              </div>
            </div>
          </div>

          <!-- BILGE + CLIMATE -->
          <div style="padding:16px 18px">
            <div style="font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:.09em;color:var(--txt3);margin-bottom:12px">Bilge</div>
            <div style="display:flex;flex-direction:column;gap:5px;margin-bottom:16px">
              ${[
                { zone: 'Engine Room', level: 2, status: 'ok' },
                { zone: 'Forward bilge', level: 1, status: 'ok' },
                { zone: 'Aft bilge', level: 0, status: 'ok' },
                { zone: 'Bow thruster', level: 0, status: 'ok' },
              ].map(b => `
                <div style="display:grid;grid-template-columns:100px 1fr 48px;align-items:center;gap:8px">
                  <span style="font-size:10px;color:var(--txt2)">${b.zone}</span>
                  <div style="height:5px;background:var(--bg3);border-radius:3px;overflow:hidden">
                    <div style="height:100%;width:${b.level * 15 + 5}%;background:#4ADE80;border-radius:3px"></div>
                  </div>
                  <span style="font-size:9px;color:#4ADE80;text-align:right">Dry</span>
                </div>
              `).join('')}
            </div>
            <div style="font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:.09em;color:var(--txt3);margin-bottom:10px">Climate zones</div>
            <div style="display:grid;grid-template-columns:1fr 1fr;gap:5px">
              ${[
                { zone: 'Master cabin', temp: 21.5, set: 21, ok: true },
                { zone: 'Saloon', temp: 22.1, set: 22, ok: true },
                { zone: 'Galley', temp: 23.8, set: 23, ok: true },
                { zone: 'Crew mess', temp: 24.2, set: 22, ok: false },
              ].map(c => `
                <div style="background:${c.ok ? 'var(--bg3)' : 'rgba(251,146,60,.08)'};border:.5px solid ${c.ok ? 'var(--bd)' : 'rgba(251,146,60,.28)'};border-radius:6px;padding:7px 9px">
                  <div style="font-size:8px;color:var(--txt3);margin-bottom:2px">${c.zone}</div>
                  <div style="font-size:14px;font-weight:600;color:${c.ok ? 'var(--txt)' : '#FB923C'}">${c.temp}°</div>
                  <div style="font-size:8px;color:var(--txt3)">Set ${c.set}°${!c.ok ? ' · +' + (c.temp - c.set).toFixed(1) : ''}</div>
                </div>
              `).join('')}
            </div>
          </div>
        </div>

        <!-- Alert bar at bottom of mockup -->
        <div style="padding:12px 18px;background:rgba(248,113,113,.06);border-top:.5px solid rgba(248,113,113,.2);display:flex;align-items:center;gap:10px">
          <div style="width:6px;height:6px;border-radius:50%;background:#F87171;flex-shrink:0;animation:pulse 1.8s ease-in-out infinite"></div>
          <div style="flex:1;font-size:11px;color:var(--txt2)"><strong style="color:#F87171">Port engine oil pressure low</strong> — 28 psi (normal: 45–65 psi) · Detected 06:14 · SMS sent to Captain</div>
          <span style="font-size:9px;font-weight:600;background:rgba(248,113,113,.14);color:#F87171;padding:3px 9px;border-radius:8px;flex-shrink:0">Create WO</span>
        </div>

        <!-- Frosted overlay label -->
        <div style="position:absolute;inset:0;background:rgba(8,8,8,.18);display:flex;align-items:flex-start;justify-content:flex-end;padding:16px;pointer-events:none">
          <div style="background:rgba(8,8,8,.72);backdrop-filter:blur(8px);border:.5px solid rgba(255,255,255,.1);border-radius:8px;padding:6px 12px;font-size:10px;font-weight:600;color:var(--txt3);letter-spacing:.04em">Preview only</div>
        </div>
      </div>

      <!-- FEATURES GRID -->
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-bottom:36px">
        ${[
          { icon: '⚙️', title: 'Engine parameters', body: 'RPM, oil pressure, coolant temp, exhaust temp per engine. Thresholds auto-alert before problems escalate.' },
          { icon: '💧', title: 'Bilge monitoring', body: 'All bilge zones monitored continuously. Critical bilge high triggers an immediate call to the captain.' },
          { icon: '❄️', title: 'Climate & HVAC', body: 'All cabin and zone temperatures at a glance. Spot a failing unit before the guest notices.' },
          { icon: '⚡', title: 'Shore power & load', body: 'Shore connection status, current draw, generator runtime, and battery bank state.' },
          { icon: '⛽', title: 'Fuel & water tanks', body: 'Tank levels with consumption rate, range estimates, and low-level alerts.' },
          { icon: '📱', title: 'Instant SMS & push alerts', body: 'Critical alerts go to the captain by SMS within 60 seconds — no app open required.' },
        ].map(f => `
          <div style="background:var(--bg2);border:.5px solid var(--bd);border-radius:12px;padding:18px 20px;display:flex;gap:13px;align-items:flex-start">
            <div style="width:32px;height:32px;border-radius:8px;background:rgba(34,211,238,.10);border:.5px solid rgba(34,211,238,.22);display:flex;align-items:center;justify-content:center;font-size:15px;flex-shrink:0">${f.icon}</div>
            <div>
              <div style="font-size:12px;font-weight:600;color:var(--txt);margin-bottom:4px">${f.title}</div>
              <div style="font-size:11px;color:var(--txt3);line-height:1.6">${f.body}</div>
            </div>
          </div>
        `).join('')}
      </div>

      <!-- CTA -->
      <div style="background:var(--bg2);border:.5px solid rgba(34,211,238,.22);border-radius:16px;padding:28px 32px;display:flex;align-items:center;justify-content:space-between;gap:24px;flex-wrap:wrap;position:relative;overflow:hidden">
        <div style="position:absolute;top:0;left:8%;right:8%;height:1px;background:linear-gradient(90deg,transparent,rgba(34,211,238,.45),transparent)"></div>
        <div>
          <div style="font-size:15px;font-weight:600;color:var(--txt);margin-bottom:6px">Ready to add Real-time Monitoring?</div>
          <div style="font-size:12px;color:var(--txt3);line-height:1.65;max-width:440px">Contact your Frame Marine account manager to activate monitoring for your vessel. Setup typically takes 30 minutes with a hardware kit we ship to you.</div>
        </div>
        <div style="display:flex;gap:10px;flex-shrink:0">
          <a href="mailto:hello@framemarine.io?subject=Real-time Monitoring — Lady M&body=Hi,%0A%0AI%27d like to add the Real-time Monitoring module to Lady M.%0A%0APlease send me setup details.%0A%0AThanks"
            style="display:inline-flex;align-items:center;gap:8px;padding:10px 22px;border-radius:9px;background:#22D3EE;color:#080808;font-size:13px;font-weight:700;text-decoration:none;letter-spacing:.01em;transition:all .15s"
            onmouseover="this.style.background='#06B6D4'" onmouseout="this.style.background='#22D3EE'">
            Contact sales →
          </a>
        </div>
      </div>

      <div style="margin-top:16px;font-size:11px;color:var(--txt3);text-align:center">
        Monitoring is available as an add-on from <strong style="color:var(--txt2)">$29/vessel/month</strong> · Hardware kit included · No additional sensors required for most vessels
      </div>

    </div>
    </div>
  `;
};
