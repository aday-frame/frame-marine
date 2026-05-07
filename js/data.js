/* ── FRAME MARINE — DATA LAYER ── */
'use strict';

const FM = window.FM = {};

FM.currentUser = { name: 'Albert Day', initials: 'AJ', role: 'Owner' };

/* ── VESSELS ── */
FM.vessels = [
  {
    id: 'v1', name: 'Lady M', type: 'Motor Yacht', loa: '48m',
    flag: 'CYM', mmsi: '319123456', color: '#0077b6', photo: 'img/lady-m.webp',
    port: 'Gustavia, St. Barths', status: 'In service',
    insurer: 'Pantaenius Yacht Insurance', policyNumber: 'PAN-2026-MY-004821',
    policyExpiry: '2026-12-31', insuredValue: '$12,500,000',
    zones: ['Bridge','Engine Room','Crew Quarters','Master Stateroom',
            'VIP Stateroom','Guest Stateroom 1','Guest Stateroom 2',
            'Main Saloon','Sky Lounge','Galley','Sundeck','Foredeck',
            'Aft Deck','Tender Garage','Bow Thruster Room','Lazarette'],
    systems: ['Propulsion','Electrical','HVAC','Plumbing','Navigation',
              'Safety / Fire','Deck / Exterior','AV / IT','Stabilizers','Watermaker'],
  },
  {
    id: 'v2', name: 'Naiad', type: 'Sailing Yacht', loa: '28m',
    flag: 'USA', mmsi: '338987654', color: '#60A5FA',
    port: 'Annapolis, MD', status: 'Scheduled maintenance',
    insurer: 'Markel Marine Insurance', policyNumber: 'MRK-2026-SY-001143',
    policyExpiry: '2026-11-30', insuredValue: '$850,000',
    zones: ['Helm Station','Main Saloon','Galley','Master Cabin',
            'Guest Cabin 1','Guest Cabin 2','Engine Bay','Sail Locker',
            'Forepeak','Aft Locker'],
    systems: ['Rig / Sails','Propulsion','Electrical','Plumbing',
              'Navigation','Safety / Fire','Deck / Exterior'],
  },
];

FM.currentVesselId = 'v1';

FM.currentVessel = () => FM.vessels.find(v => v.id === FM.currentVesselId);

/* ── CREW ── */
FM.crew = [
  { id: 'c1', initials: 'AJ', name: 'Albert Day',     role: 'Owner',           vessel: 'v1', color: '#F97316', phone: '', email: 'aday@castellomgmt.com', status: 'ashore' },
  { id: 'c2', initials: 'RC', name: 'Romain Castillo', role: 'Captain',         vessel: 'v1', color: '#4ADE80', phone: '+1 305 555 0101', email: 'rcastillo@ladym.com', status: 'onboard' },
  { id: 'c3', initials: 'DK', name: 'Dmitri Koval',   role: 'Chief Engineer',  vessel: 'v1', color: '#22D3EE', phone: '+1 305 555 0188', email: 'dkoval@ladym.com', status: 'onboard' },
  { id: 'c4', initials: 'ML', name: 'Marie Laurent',  role: 'Chief Stewardess',vessel: 'v1', color: '#A78BFA', phone: '+1 305 555 0142', email: 'mlaurent@ladym.com', status: 'onboard' },
  { id: 'c5', initials: 'JB', name: 'Jake Burton',    role: 'Bosun',           vessel: 'v1', color: '#FACC15', phone: '+1 305 555 0177', email: 'jburton@ladym.com', status: 'onboard' },
  { id: 'c6', initials: 'SN', name: 'Sara Novak',     role: 'Stewardess',      vessel: 'v1', color: '#F87171', phone: '+1 305 555 0133', email: 'snovak@ladym.com', status: 'onboard' },
  { id: 'c7', initials: 'TK', name: 'Tom Keane',      role: 'Deckhand',        vessel: 'v1', color: '#60A5FA', phone: '+1 305 555 0166', email: 'tkeane@ladym.com', status: 'onboard' },
  { id: 'c8', initials: 'EP', name: 'Elena Petrov',   role: 'Chef',            vessel: 'v1', color: '#4ADE80', phone: '+1 305 555 0155', email: 'epetrov@ladym.com', status: 'ashore' },
];

/* ── WORK ORDERS ── */
FM.workOrders = [
  {
    id: 'WO-001', vessel: 'v1',
    title: 'Port main engine — high coolant temp alarm',
    desc: 'Port Caterpillar C32 throwing high coolant temp at 90°C setpoint. Thermostat suspected. Logged three events in past 48h.',
    zone: 'Engine Room', system: 'Propulsion',
    priority: 'high', status: 'open', team: 'engineering',
    assignee: 'c3', created: '2026-04-29', due: '2026-05-02', vendor: 'vnd1',
    subtasks: [
      { id: 's1', text: 'Check coolant level', done: true },
      { id: 's2', text: 'Inspect thermostat housing for leaks', done: true },
      { id: 's3', text: 'Replace thermostat — p/n CAT 2W-8900', done: false },
      { id: 's4', text: 'Flush and refill coolant loop', done: false },
      { id: 's5', text: 'Run at load and confirm no alarm', done: false },
    ],
    comments: [
      { author: 'c3', time: '29 Apr · 07:12', text: 'Coolant level OK. Thermostat looks corroded. Ordered replacement from cat dealer in Fort Lauderdale.' },
      { author: 'c2', time: '29 Apr · 08:45', text: 'Owner arrives 3 May. Engine must be cleared before departure.' },
    ],
    parts: ['CAT thermostat 2W-8900', 'Coolant 50/50 premix (5L)'],
    images: ['img/wo-001a.jpg', 'img/wo-001b.jpg'],
  },
  {
    id: 'WO-002', vessel: 'v1',
    title: 'Starboard stabilizer fin — hydraulic fluid weep',
    desc: 'Small weep around the port seal on starboard fin actuator. No performance loss yet but needs attention before Atlantic crossing.',
    zone: 'Engine Room', system: 'Stabilizers',
    priority: 'medium', status: 'open', team: 'engineering',
    assignee: 'c3', created: '2026-04-27', due: '2026-05-05', vendor: 'vnd2',
    subtasks: [
      { id: 's1', text: 'Inspect actuator seals', done: false },
      { id: 's2', text: 'Top up hydraulic reservoir', done: false },
      { id: 's3', text: 'Contact Naiad Dynamics for seal kit', done: false },
    ],
    comments: [
      { author: 'c3', time: '27 Apr · 14:30', text: 'Weep is slow — about 5ml/day. Monitoring. Will need seal replacement before transatlantic.' },
    ],
    parts: [],
    images: ['img/wo-002.jpg'],
  },
  {
    id: 'WO-003', vessel: 'v1',
    title: 'Guest Stateroom 2 — A/C not cooling below 22°C',
    desc: 'Climatisation in GS2 not maintaining setpoint. Blowing room temp air. Other zones OK.',
    zone: 'Guest Stateroom 2', system: 'HVAC',
    priority: 'high', status: 'in-progress', team: 'engineering',
    assignee: 'c3', created: '2026-04-30', due: '2026-05-01', vendor: 'vnd3',
    subtasks: [
      { id: 's1', text: 'Check FCU filter — replace if blocked', done: true },
      { id: 's2', text: 'Check refrigerant pressure at chiller', done: false },
      { id: 's3', text: 'Verify zone valve is opening', done: false },
    ],
    comments: [],
    parts: [],
  },
  {
    id: 'WO-004', vessel: 'v1',
    title: 'Pre-charter provisioning — Bermuda trip 5-12 May',
    desc: 'Full provisioning for 6 guests + 8 crew for 7-night Bermuda charter. Coordinate with chef for menu and customs clearance.',
    zone: 'Galley', system: 'Deck / Exterior',
    priority: 'high', status: 'open', team: 'deck',
    assignee: 'c2', created: '2026-04-28', due: '2026-05-04',
    subtasks: [
      { id: 's1', text: 'Confirm guest dietary requirements', done: true },
      { id: 's2', text: 'Draft provisioning list with chef', done: true },
      { id: 's3', text: 'Order provisions — delivery dock by 4 May', done: false },
      { id: 's4', text: 'Submit Bermuda customs docs', done: false },
      { id: 's5', text: 'Confirm berth in Hamilton', done: false },
    ],
    comments: [
      { author: 'c2', time: '28 Apr · 10:00', text: 'Guests confirmed vegan + one shellfish allergy. Chef has draft menu.' },
    ],
    parts: [],
  },
  {
    id: 'WO-005', vessel: 'v1',
    title: 'Tender engine service — 200hr Yamaha F150',
    desc: 'Yamaha F150 on the Williams 385 is due 200hr service. Impeller, fuel filter, spark plugs, gear oil.',
    zone: 'Tender Garage', system: 'Propulsion',
    priority: 'low', status: 'open', team: 'deck',
    assignee: 'c5', created: '2026-04-25', due: '2026-05-08',
    subtasks: [
      { id: 's1', text: 'Replace water pump impeller', done: false },
      { id: 's2', text: 'Replace fuel filter', done: false },
      { id: 's3', text: 'Replace spark plugs (set of 4)', done: false },
      { id: 's4', text: 'Drain and replace gearbox oil', done: false },
    ],
    comments: [],
    parts: ['Yamaha impeller 6H3-WA097', 'Yamalube 2-stroke gear oil'],
  },
  {
    id: 'WO-006', vessel: 'v1',
    title: 'Watermaker membrane flush — post St. Barths stay',
    desc: 'Katadyn watermaker requires freshwater flush after harbour use. Membranes need pickling if not in use for >72h.',
    zone: 'Engine Room', system: 'Plumbing',
    priority: 'low', status: 'done', team: 'engineering',
    assignee: 'c3', created: '2026-04-26', due: '2026-04-27',
    subtasks: [
      { id: 's1', text: '20-min fresh water flush cycle', done: true },
      { id: 's2', text: 'Pickle membranes with solution', done: true },
      { id: 's3', text: 'Log in maintenance record', done: true },
    ],
    comments: [],
    parts: [],
    images: ['img/wo-007.jpg'],
  },
  {
    id: 'WO-007', vessel: 'v1',
    title: 'Aft deck teak — board 14 showing delamination',
    desc: 'Board 14 on aft deck starboard has lifted caulk seam. Water ingress risk. Needs recaulk or board replacement.',
    zone: 'Aft Deck', system: 'Deck / Exterior',
    priority: 'medium', status: 'on-hold', team: 'deck',
    assignee: 'c5', created: '2026-04-20', due: null,
    subtasks: [
      { id: 's1', text: 'Sand and clean seam', done: false },
      { id: 's2', text: 'Determine if board needs full replacement', done: false },
      { id: 's3', text: 'Source matching teak — contact supplier', done: false },
    ],
    comments: [
      { author: 'c2', time: '21 Apr · 09:00', text: 'On hold until after Bermuda charter. Do not affect deck for guests.' },
    ],
    parts: [],
  },
  {
    id: 'WO-008', vessel: 'v2',
    title: 'Standing rigging inspection — pre-season',
    desc: 'Full standing rigging inspection prior to season opening. Shrouds, stays, toggles, swage fittings.',
    zone: 'Helm Station', system: 'Rig / Sails',
    priority: 'high', status: 'open', team: 'deck',
    assignee: 'c5', created: '2026-04-15', due: '2026-05-10',
    subtasks: [],
    comments: [],
    parts: [],
  },
  {
    id: 'WO-009', vessel: 'v1',
    title: 'Lady M Jr — hull wax and full detail',
    desc: 'Annual hull and topsides wax on Lady M Jr. Remove waterline staining, polish gelcoat, treat cleats.',
    zone: 'Tender Garage', system: 'Deck / Exterior',
    priority: 'low', status: 'open', team: 'deck',
    assignee: 'c7', created: '2026-04-28', due: '2026-05-10',
    subtasks: [
      { id: 's1', text: 'Wash and degrease hull', done: false },
      { id: 's2', text: 'Apply 2-stage machine polish', done: false },
      { id: 's3', text: 'Wax and buff topsides', done: false },
    ],
    comments: [],
    parts: [],
  },
  {
    id: 'WO-010', vessel: 'v1',
    title: 'Shadow — 250hr impeller and gear oil service',
    desc: 'Williams Turbojet 485 Shadow is due 250hr service. Water pump impeller replacement and gearbox oil change.',
    zone: 'Tender Garage', system: 'Propulsion',
    priority: 'medium', status: 'in-progress', team: 'deck',
    assignee: 'c5', created: '2026-04-29', due: '2026-05-06',
    subtasks: [
      { id: 's1', text: 'Remove jet unit and inspect impeller', done: true },
      { id: 's2', text: 'Replace impeller', done: false },
      { id: 's3', text: 'Drain and refill gearbox oil', done: false },
    ],
    comments: [
      { author: 'c5', time: '29 Apr · 14:30', text: 'Impeller shows wear but not failure. Proceeding with replacement.' },
    ],
    parts: [],
  },
  {
    id: 'WO-011', vessel: 'v1',
    title: 'Jet Ski 1 — spark plugs and cooling flush',
    desc: 'Sea-Doo GTX on Jet Ski 1: replace spark plugs (2 cylinders) and flush intercooler with fresh water.',
    zone: 'Tender Garage', system: 'Propulsion',
    priority: 'low', status: 'open', team: 'deck',
    assignee: 'c7', created: '2026-04-30', due: '2026-05-14',
    subtasks: [
      { id: 's1', text: 'Replace spark plugs', done: false },
      { id: 's2', text: 'Flush cooling system 10 min', done: false },
    ],
    comments: [],
    parts: [],
  },
  {
    id: 'WO-012', vessel: 'v1',
    title: 'Jet Ski 2 — throttle cable binding — inspect and lube',
    desc: 'Jet Ski 2 throttle cable showing resistance. May need re-routing or replacement before guest use.',
    zone: 'Tender Garage', system: 'Controls',
    priority: 'high', status: 'open', team: 'deck',
    assignee: 'c5', created: '2026-04-30', due: '2026-05-03',
    subtasks: [
      { id: 's1', text: 'Inspect cable run for kinks or chafe', done: false },
      { id: 's2', text: 'Lubricate cable with marine grease', done: false },
      { id: 's3', text: 'Test full throttle range', done: false },
    ],
    comments: [
      { author: 'c2', time: '30 Apr · 09:00', text: 'Do not put in water until resolved — guests arrive 3 May.' },
    ],
    parts: [],
  },
  {
    id: 'WO-013', vessel: 'v1',
    title: 'Seabob 1 — battery capacity check and cell balance',
    desc: 'Seabob F5 SR showing reduced run time. Check individual cell voltages and balance pack. May need cell replacement.',
    zone: 'Tender Garage', system: 'Electrical',
    priority: 'medium', status: 'in-progress', team: 'engineering',
    assignee: 'c3', created: '2026-04-27', due: '2026-05-05',
    subtasks: [
      { id: 's1', text: 'Log individual cell voltages at full charge', done: true },
      { id: 's2', text: 'Run balance charge cycle', done: true },
      { id: 's3', text: 'Retest run time under load', done: false },
    ],
    comments: [
      { author: 'c3', time: '28 Apr · 16:00', text: 'Cell 4 reading 0.08V low. Balance cycle underway.' },
    ],
    parts: [],
  },
  {
    id: 'WO-014', vessel: 'v1',
    title: 'Lady M Jr — port navigation light LED replacement',
    desc: 'Port nav light on Lady M Jr inoperative. LED array needs replacement — confirm correct colour (red port).',
    zone: 'Tender Garage', system: 'Electrical',
    priority: 'medium', status: 'open', team: 'deck',
    assignee: 'c2', created: '2026-04-29', due: '2026-05-04',
    subtasks: [
      { id: 's1', text: 'Source replacement LED nav light unit', done: false },
      { id: 's2', text: 'Remove and replace port light', done: false },
      { id: 's3', text: 'Test and verify colour compliance', done: false },
    ],
    comments: [],
    parts: [],
  },
  {
    id: 'WO-015', vessel: 'v1',
    title: 'Shadow — boarding ladder hinge seized',
    desc: 'Shadow transom boarding ladder starboard hinge is seized with corrosion. Needs disassembly and re-grease or replacement.',
    zone: 'Tender Garage', system: 'Deck / Exterior',
    priority: 'low', status: 'open', team: 'deck',
    assignee: 'c7', created: '2026-04-30', due: '2026-05-12',
    subtasks: [
      { id: 's1', text: 'Disassemble hinge and clean corrosion', done: false },
      { id: 's2', text: 'Apply Lanacote or replace hinge pin', done: false },
    ],
    comments: [],
    parts: [],
  },
];

/* ── MONITORING — SENSORS ── */
FM.sensors = {
  v1: {
    bilge: [
      { zone: 'Engine Room',     level: 2,  pump: 'Auto', status: 'ok' },
      { zone: 'Bow Thruster Rm', level: 0,  pump: 'Auto', status: 'ok' },
      { zone: 'Lazarette',       level: 8,  pump: 'Auto', status: 'warn' },
      { zone: 'Tender Garage',   level: 1,  pump: 'Manual', status: 'ok' },
    ],
    engines: [
      {
        name: 'Port — CAT C32', id: 'eng-p',
        rpm: 850, oil: 72, coolant: 91, exhaust: 245, hours: 4218,
        status: 'warn',
      },
      {
        name: 'Stbd — CAT C32', id: 'eng-s',
        rpm: 850, oil: 70, coolant: 82, exhaust: 238, hours: 4219,
        status: 'ok',
      },
      {
        name: 'Gen 1 — Northern Lights', id: 'gen-1',
        rpm: 1800, oil: 90, coolant: 78, exhaust: 310, hours: 1102,
        status: 'ok',
      },
      {
        name: 'Gen 2 — Northern Lights', id: 'gen-2',
        rpm: 0, oil: 65, coolant: 22, exhaust: 0, hours: 980,
        status: 'standby',
      },
    ],
    climate: [
      { zone: 'Master Stateroom', temp: 20.1, setpt: 20, humid: 52, status: 'ok' },
      { zone: 'VIP Stateroom',    temp: 20.8, setpt: 20, humid: 54, status: 'ok' },
      { zone: 'Guest Stateroom 1',temp: 21.4, setpt: 20, humid: 58, status: 'warn' },
      { zone: 'Guest Stateroom 2',temp: 23.2, setpt: 20, humid: 61, status: 'crit' },
      { zone: 'Main Saloon',      temp: 21.0, setpt: 21, humid: 49, status: 'ok' },
      { zone: 'Engine Room',      temp: 38.4, setpt: 45, humid: 68, status: 'ok' },
    ],
    power: {
      shorepower: true, shorevoltage: 415, shorecurrent: 32,
      battery_house: 94, battery_start: 98, inverter: 'Online',
      load_kw: 24.6,
    },
    fuel: {
      main_port: 72, main_stbd: 68, day_tank: 85,
      capacity_l: 32000, current_l: 22720,
    },
  },
};

/* ── EVENTS / CALENDAR ── */
FM.events = [
  { id: 'e1', vessel: 'v1', title: 'Bermuda charter — 6 guests', start: '2026-05-05', end: '2026-05-12', type: 'charter', color: 'or', wo: null },
  { id: 'e2', vessel: 'v1', title: 'Engine service — CAT dealer on board', start: '2026-05-02', end: '2026-05-02', type: 'maintenance', color: 'eng', wo: 'WO-001' },
  { id: 'e3', vessel: 'v1', title: 'Annual survey — Lloyd\'s', start: '2026-05-20', end: '2026-05-22', type: 'regulatory', color: 'red', wo: null },
  { id: 'e4', vessel: 'v1', title: 'Provisions delivery', start: '2026-05-04', end: '2026-05-04', type: 'logistics', color: 'grn', wo: 'WO-004' },
  { id: 'e5', vessel: 'v1', title: 'Tender engine service', start: '2026-05-07', end: '2026-05-07', type: 'maintenance', color: 'blu', wo: 'WO-005' },
  { id: 'e6', vessel: 'v2', title: 'Rigging inspection', start: '2026-05-10', end: '2026-05-11', type: 'maintenance', color: 'or', wo: 'WO-008' },
];

/* ── PARTS INVENTORY ── */
FM.parts = [
  { id: 'p1',  sku: 'CAT-2W8900',    name: 'Thermostat — CAT C32',           zone: 'Engine Room',    qty: 1, min: 1, unit: 'ea',  cost: 145, supplier: 'Caterpillar Marine',  category: 'propulsion', photoColor: '#22D3EE', photoIcon: '⚙', assetId: 'a1' },
  { id: 'p2',  sku: 'YAM-6H3WA097',  name: 'Water pump impeller — F150',     zone: 'Tender Garage',  qty: 2, min: 1, unit: 'ea',  cost: 38,  supplier: 'Yamaha Marine Parts', category: 'tender',     photoColor: '#60A5FA', photoIcon: '💧', assetId: 'f1' },
  { id: 'p3',  sku: 'FIL-RAC-1000',  name: 'Racor 1000FG fuel filter',       zone: 'Engine Room',    qty: 4, min: 4, unit: 'ea',  cost: 22,  supplier: 'Parker Hannifin',    category: 'fuel',       photoColor: '#FACC15', photoIcon: '⬡', assetId: 'a1' },
  { id: 'p4',  sku: 'OIL-GBX-1L',    name: 'Yamalube gear lube 1L',          zone: 'Tender Garage',  qty: 6, min: 2, unit: 'L',   cost: 16,  supplier: 'Yamaha Marine Parts', category: 'tender',     photoColor: '#4ADE80', photoIcon: '○', assetId: 'f1' },
  { id: 'p5',  sku: 'COOL-5050-5L',  name: 'Coolant 50/50 premix 5L',        zone: 'Engine Room',    qty: 2, min: 2, unit: 'ea',  cost: 28,  supplier: 'CAT Dealer FLL',     category: 'propulsion', photoColor: '#38BDF8', photoIcon: '❄', assetId: 'a1' },
  { id: 'p6',  sku: 'VBELT-CAT-32',  name: 'V-Belt set — CAT C32',           zone: 'Engine Room',    qty: 0, min: 1, unit: 'set', cost: 280, supplier: 'Caterpillar Marine',  category: 'propulsion', photoColor: '#F87171', photoIcon: '◎', assetId: 'a1' },
  { id: 'p7',  sku: 'AIR-11400',     name: 'Air filter — CAT C32',           zone: 'Engine Room',    qty: 1, min: 1, unit: 'ea',  cost: 68,  supplier: 'Caterpillar Marine',  category: 'propulsion', photoColor: '#A78BFA', photoIcon: '◫', assetId: 'a2' },
  { id: 'p8',  sku: 'KAT-PICKLE',    name: 'Katadyn pickling solution',       zone: 'Engine Room',    qty: 1, min: 1, unit: 'ea',  cost: 44,  supplier: 'Katadyn Group',       category: 'systems',    photoColor: '#4ADE80', photoIcon: '≋', assetId: 'a5' },
  { id: 'p9',  sku: 'OIL-CAT-C32',   name: 'CAT TDTO engine oil 20W-40 5L',  zone: 'Engine Room',    qty: 8, min: 6, unit: 'ea',  cost: 54,  supplier: 'Caterpillar Marine',  category: 'propulsion', photoColor: '#F97316', photoIcon: '●', assetId: 'a2' },
  { id: 'p10', sku: 'ANO-ZNC-40',    name: 'Zinc anode shaft — 40mm',        zone: 'Aft Deck',       qty: 4, min: 4, unit: 'ea',  cost: 18,  supplier: 'Martyr Anodes',       category: 'hull',       photoColor: '#9CA3AF', photoIcon: '◯', assetId: null },
  { id: 'p11', sku: 'IMP-RWP-C32',   name: 'Raw water pump impeller — C32',  zone: 'Engine Room',    qty: 2, min: 1, unit: 'ea',  cost: 62,  supplier: 'Caterpillar Marine',  category: 'propulsion', photoColor: '#22D3EE', photoIcon: '✲', assetId: 'a5' },
  { id: 'p12', sku: 'BELT-AC-NAIAD', name: 'A/C compressor belt — Carrier',  zone: 'Engine Room',    qty: 2, min: 1, unit: 'ea',  cost: 34,  supplier: 'Carrier Marine HVAC', category: 'hvac',       photoColor: '#A78BFA', photoIcon: '◎', assetId: 'a3' },
];

/* ── ASSETS REGISTER ── */
FM.assets = [
  { id:'a1', vessel:'v1', name:'Port CAT C32 Engine', zone:'Engine Room', system:'Propulsion', make:'Caterpillar', model:'C32 ACERT', serial:'CAT-C32-4701', year:2018, lastService:'2026-01-15', nextService:'2026-04-15', status:'attention', photoColor:'#22D3EE', photoIcon:'⚙️', specs:{ Power:'1,825 hp', Displacement:'32.1 L', Bore:'145 mm', Stroke:'162 mm', Cooling:'Fresh water', Weight:'3,220 kg' }, notes:'Running slightly warm. Coolant temp peaked 91°C on last passage. WO-001 open. Thermostat replaced 2026-05-04.', parts:['p1','p3','p5','p6'], vendor:'vnd1' },
  { id:'a2', vessel:'v1', name:'Stbd CAT C32 Engine',  zone:'Engine Room', system:'Propulsion', make:'Caterpillar', model:'C32 ACERT', serial:'CAT-C32-4702', year:2018, lastService:'2026-01-15', nextService:'2026-04-15', status:'ok',        photoColor:'#22D3EE', photoIcon:'⚙️', specs:{ Power:'1,825 hp', Displacement:'32.1 L', Bore:'145 mm', Stroke:'162 mm', Cooling:'Fresh water', Weight:'3,220 kg' }, notes:'Starboard engine running well. All parameters nominal.', parts:['p7','p9'], vendor:'vnd1' },
  { id:'a3', vessel:'v1', name:'Northern Lights 20kW Generator', zone:'Engine Room', system:'Electrical', make:'Northern Lights', model:'M844W3', serial:'NL-8440-2019', year:2019, lastService:'2026-02-20', nextService:'2026-05-20', status:'due-soon', photoColor:'#FACC15', photoIcon:'⚡', specs:{ Output:'20 kW / 25 kVA', Voltage:'120/240 V', Frequency:'60 Hz', Fuel:'Diesel', Weight:'410 kg' }, notes:'Oil change due at 8,850 hrs (currently 8,847 hrs). Fuel filter last changed Feb 2025.', parts:['p12'], vendor:'vnd1' },
  { id:'a4', vessel:'v1', name:'Naiad Gyro Stabilizer', zone:'Engine Room', system:'Stabilization', make:'Naiad Dynamics', model:'Gyro-300', serial:'NAI-G300-1122', year:2020, lastService:'2025-11-01', nextService:'2026-11-01', status:'ok', photoColor:'#A78BFA', photoIcon:'🌀', specs:{ 'Gyro speed':'3,600 RPM', 'Power draw':'5 kW', 'Spin-up':'8 min', 'Control':'Auto/Manual' }, notes:'Annual service completed Nov 2025. Performance nominal. Hydraulic fluid level checked weekly.', parts:[], vendor:'vnd2' },
  { id:'a5', vessel:'v1', name:'Spectra Newport 400 Watermaker', zone:'Engine Room', system:'Systems', make:'Spectra', model:'Newport 400', serial:'SPC-NP400-0823', year:2021, lastService:'2026-04-10', nextService:'2026-05-10', status:'due-soon', photoColor:'#60A5FA', photoIcon:'💧', specs:{ Output:'400 GPD', Pressure:'800 PSI', Motor:'1.2 kW', Membranes:'2 × 40"', 'Pre-filter':'5 micron' }, notes:'Membrane flush due 2026-05-10. Vessel has been inactive past 3 weeks — pickling required.', parts:['p8','p11'], vendor:'vnd4' },
];

/* ── VENDORS ── */
FM.vendors = [
  { id: 'vnd1', name: 'CAT Dealer Fort Lauderdale', trade: 'Propulsion / Mechanical', contact: 'Jim Farley', phone: '+1 954 555 0110', email: 'service@catmarine-fll.com', vessel: 'v1' },
  { id: 'vnd2', name: 'Naiad Dynamics',             trade: 'Stabilizers',             contact: 'Tech Support', phone: '+1 800 555 0120', email: 'service@naiad.com', vessel: 'v1' },
  { id: 'vnd3', name: 'YachtAV Solutions',          trade: 'AV / IT',                 contact: 'Mark Chen',  phone: '+1 305 555 0188', email: 'mark@yachtav.com', vessel: 'v1' },
  { id: 'vnd4', name: 'Blue Water Provisioning',    trade: 'Provisioning',            contact: 'Ana Costa',  phone: '+1 305 555 0199', email: 'ana@bwprov.com', vessel: 'v1' },
  { id: 'vnd5', name: 'Teak Masters Ltd',           trade: 'Deck / Joinery',          contact: 'Lars Oberg', phone: '+1 954 555 0177', email: 'lars@teakmasters.com', vessel: 'v1' },
];

/* ── CHAT CHANNELS ── */
FM.channels = [
  { id: 'ch1', name: 'Lady M — Bridge', vessel: 'v1', unread: 3 },
  { id: 'ch2', name: 'Lady M — Engine Room', vessel: 'v1', unread: 1 },
  { id: 'ch3', name: 'Lady M — Deck Team', vessel: 'v1', unread: 0 },
  { id: 'ch4', name: 'Lady M — Interior', vessel: 'v1', unread: 0 },
  { id: 'ch5', name: 'Naiad — All Crew', vessel: 'v2', unread: 0 },
];

FM.messages = {
  ch1: [
    { author: 'c3', time: '07:12', text: 'Port engine high coolant alarm came up again overnight. Temp peaked at 91°C before stabilising. Thermostat ordered.', wo: 'WO-001' },
    { author: 'c2', time: '07:45', text: 'Good. Keep me posted. Owner arrives 3 May — engine must be clear by then.' },
    { author: 'c5', time: '08:10', text: 'Provisions delivery confirmed for 4 May 0800 dock.' },
  ],
  ch2: [
    { author: 'c3', time: '09:00', text: 'Lazarette bilge reading 8% — above normal. Pump is auto but I want to find the source.' },
  ],
  ch3: [],
  ch4: [],
  ch5: [],
};

/* ── UTILS ── */
/* ── CHARTERS ── */
FM.charters = [
  {
    id: 'ch-001',
    vessel: 'v1',
    status: 'active',
    name: 'Bermuda Summer — Day Family',
    broker: 'Burgess Yachts',
    brokerContact: 'Sophie Renard <s.renard@burgessyachts.com>',
    fee: 185000,
    currency: 'USD',
    start: '2026-05-05',
    end: '2026-05-12',
    embark: 'Gustavia, St. Barths',
    disembark: 'Hamilton, Bermuda',
    guests: ['g1','g2','g3','g4','g5','g6'],
    itinerary: [
      { date: '2026-05-05', location: 'Gustavia, St. Barths', notes: 'Embarkation 18:00. Welcome dinner on board.' },
      { date: '2026-05-06', location: 'Île Fourchue, St. Barths', notes: 'Morning snorkel, beach lunch. Sunset anchorage.' },
      { date: '2026-05-07', location: 'Sailing — St. Barths to Anguilla', notes: 'Full day passage. ETA Sandy Ground 17:00.' },
      { date: '2026-05-08', location: 'Anguilla', notes: 'Shoal Bay beach, rum shack lunch. Watersports afternoon.' },
      { date: '2026-05-09', location: 'Sailing — Anguilla to open ocean', notes: 'Passage day. Chef\'s tasting menu dinner.' },
      { date: '2026-05-10', location: 'Ocean passage', notes: 'Fishing, movies, spa treatments. Stargazing.' },
      { date: '2026-05-11', location: 'Approaching Bermuda', notes: 'Arrive St. George\'s 08:00. Full island day.' },
      { date: '2026-05-12', location: 'Hamilton, Bermuda', notes: 'Disembarkation 10:00 from Town Quay.' },
    ],
    documents: [
      { name: 'Charter Agreement — Day Family', type: 'contract', date: '2026-03-14' },
      { name: 'APA Receipt — $37,000', type: 'finance', date: '2026-03-20' },
      { name: 'Bermuda Customs Pre-Clearance', type: 'regulatory', date: '2026-04-28' },
      { name: 'Safety Briefing Form', type: 'safety', date: null },
      { name: 'Guest Preference Sheets', type: 'preferences', date: '2026-04-01' },
    ],
    apa: 37000,
    apaSpent: 12400,
    costs: [
      { id: 'cost-ch1-1', category: 'Fuel',          desc: 'Pre-charter fill — Gustavia',            amount: 4200,  date: '2026-05-04', notes: '' },
      { id: 'cost-ch1-2', category: 'Provisioning',  desc: 'Day family provisions — Palate Foods',  amount: 8400,  date: '2026-05-03', notes: '' },
      { id: 'cost-ch1-3', category: 'Port / marina', desc: 'Gustavia harbour fees',                 amount: 1200,  date: '2026-05-05', notes: '' },
      { id: 'cost-ch1-4', category: 'Broker',        desc: 'Burgess commission 15%',               amount: 27750,  date: '2026-05-05', notes: 'Invoiced on charter fee' },
    ],
    apaExpenses: [
      { id: 'apa-ch1-1', category: 'Fuel',         desc: 'Pre-charter fill — Gustavia fuel dock',  amount: 4200, date: '2026-05-04' },
      { id: 'apa-ch1-2', category: 'Provisioning', desc: 'Day family provisions — Palate Foods',   amount: 5800, date: '2026-05-03' },
      { id: 'apa-ch1-3', category: 'Port / marina',desc: 'Gustavia harbour dues',                  amount: 1400, date: '2026-05-05' },
      { id: 'apa-ch1-4', category: 'Watersports',  desc: 'Jet ski rentals shore excursion',        amount: 1000, date: '2026-05-08' },
    ],
    quote: {
      ref: 'Q-2026-001',
      status: 'confirmed',
      issued: '2026-02-15',
      sentDate: '2026-02-15',
      acceptedDate: '2026-03-14',
      validUntil: '2026-03-07',
      payments: [
        { id: 'dep', label: '50% Deposit', amount: 92500, due: '2026-03-20', paid: true, paidDate: '2026-03-20', wire: 'charter' },
        { id: 'bal', label: 'Balance (50%)', amount: 92500, due: '2026-04-05', paid: true, paidDate: '2026-04-03', wire: 'charter' },
        { id: 'apa', label: 'APA Advance', amount: 37000, due: '2026-05-05', paid: true, paidDate: '2026-04-30', wire: 'apa' },
      ],
      wireCharter: {
        bank: 'First Caribbean International Bank',
        city: 'George Town, Cayman Islands',
        accountName: 'Lady M Charter LLC',
        iban: 'KY12 FCIB 0001 2345 6789 01',
        swift: 'FCIBKYKX',
        ref: 'Q-2026-001 · DAY FAMILY',
      },
      wireAPA: {
        bank: 'Butterfield Bank',
        city: 'George Town, Cayman Islands',
        accountName: 'Lady M Operations Account',
        iban: 'KY12 BUFF 0001 9876 5432 10',
        swift: 'BUFBKYKX',
        ref: 'APA-Q-2026-001 · DAY FAMILY',
      },
    },
  },
  {
    id: 'ch-002',
    vessel: 'v1',
    status: 'upcoming',
    name: 'Mediterranean Loop — Rossi Group',
    broker: 'Fraser Yachts',
    brokerContact: 'Marco Tieri <m.tieri@fraseryachts.com>',
    fee: 220000,
    currency: 'USD',
    start: '2026-07-10',
    end: '2026-07-24',
    embark: 'Palma de Mallorca, Spain',
    disembark: 'Portofino, Italy',
    guests: ['g11','g12','g13','g14'],
    itinerary: [
      { date: '2026-07-10', location: 'Palma de Mallorca, Spain', notes: 'Embarkation 18:00. Welcome cocktails and dinner in Palma harbour.' },
      { date: '2026-07-11', location: 'Cabrera Archipelago, Spain', notes: 'Morning sail to protected national park. Swim stop at pristine coves. Anchored night.' },
      { date: '2026-07-12', location: 'Ibiza Town, Spain', notes: 'Arrive Ibiza. Explore Dalt Vila UNESCO old town. Sundowners at Cala Comte.' },
      { date: '2026-07-13', location: 'Formentera, Spain', notes: 'Full day at Formentera. Ses Illetes beach turquoise flats. Es Caló lunch. Evening passage north.' },
      { date: '2026-07-14', location: 'Menorca — Cala Pregonda', notes: 'Passage day. Fishing lines out. Sunset anchorage at Cala Pregonda, red-sand beach.' },
      { date: '2026-07-15', location: 'Menorca — Ciudadela to Mahón', notes: 'Explore western Menorca. Old town lunch. Tender day to Cala en Turqueta.' },
      { date: '2026-07-16', location: 'Overnight passage to Sardinia', notes: 'Passage night. ETA Costa Smeralda 07:00. Chef\'s starlight dinner at sea.' },
      { date: '2026-07-17', location: 'Costa Smeralda, Sardinia', notes: 'Porto Cervo superyacht village. Shop and explore. Cala di Volpe dinner on board.' },
      { date: '2026-07-18', location: 'La Maddalena Archipelago, Sardinia', notes: 'Tender tour of pink sand beaches in the protected archipelago. Snorkel stop.' },
      { date: '2026-07-19', location: 'Bonifacio Strait / Southern Corsica', notes: 'Dramatic strait passage. Lunch stop in Corsica at Figari Bay. Overnight Ajaccio.' },
      { date: '2026-07-20', location: 'Ajaccio, Corsica', notes: 'Napoleon\'s birthplace. Morning market. Afternoon passage east to Elba.' },
      { date: '2026-07-21', location: 'Elba, Italy', notes: 'Portoferraio harbour. Explore the island by scooter or tender. Overnight at anchor.' },
      { date: '2026-07-22', location: 'Porto Santo Stefano, Italy', notes: 'Argentario peninsula. Tender day on the lagoon. Chef\'s seafood lunch on board.' },
      { date: '2026-07-23', location: 'Ligurian Coast, Italy', notes: 'Final night at anchor off Sestri Levante. Farewell dinner. Stargazing.' },
      { date: '2026-07-24', location: 'Portofino, Italy', notes: 'Disembarkation 10:00 from Portofino dock. Transfer to Genoa Cristoforo Colombo Airport.' },
    ],
    documents: [
      { name: 'Charter Agreement — Rossi Group', type: 'contract', date: '2026-02-28' },
      { name: 'APA Receipt — $44,000', type: 'finance', date: '2026-03-15' },
      { name: 'Guest Preference Sheets', type: 'preferences', date: null },
      { name: 'Spain — Port Pre-Clearance', type: 'regulatory', date: null },
      { name: 'Italy — Customs Pre-Clearance', type: 'regulatory', date: null },
      { name: 'Safety Briefing Form', type: 'safety', date: null },
    ],
    apa: 44000,
    apaSpent: 0,
    costs: [],
    apaExpenses: [],
    quote: {
      ref: 'Q-2026-002',
      status: 'deposit_paid',
      issued: '2026-01-20',
      sentDate: '2026-01-20',
      acceptedDate: '2026-02-14',
      validUntil: '2026-02-14',
      payments: [
        { id: 'dep', label: '50% Deposit', amount: 110000, due: '2026-02-28', paid: true, paidDate: '2026-02-28', wire: 'charter' },
        { id: 'bal', label: 'Balance (50%)', amount: 110000, due: '2026-06-10', paid: false, paidDate: null, wire: 'charter' },
        { id: 'apa', label: 'APA Advance', amount: 44000, due: '2026-07-09', paid: false, paidDate: null, wire: 'apa' },
      ],
      wireCharter: {
        bank: 'First Caribbean International Bank',
        city: 'George Town, Cayman Islands',
        accountName: 'Lady M Charter LLC',
        iban: 'KY12 FCIB 0001 2345 6789 01',
        swift: 'FCIBKYKX',
        ref: 'Q-2026-002 · ROSSI GROUP',
      },
      wireAPA: {
        bank: 'Butterfield Bank',
        city: 'George Town, Cayman Islands',
        accountName: 'Lady M Operations Account',
        iban: 'KY12 BUFF 0001 9876 5432 10',
        swift: 'BUFBKYKX',
        ref: 'APA-Q-2026-002 · ROSSI GROUP',
      },
    },
  },
  {
    id: 'ch-003',
    vessel: 'v1',
    status: 'completed',
    name: 'St. Barths New Year — Chen Family',
    broker: 'Burgess Yachts',
    brokerContact: 'Sophie Renard <s.renard@burgessyachts.com>',
    fee: 210000,
    currency: 'USD',
    start: '2025-12-29',
    end: '2026-01-05',
    embark: 'Gustavia, St. Barths',
    disembark: 'Gustavia, St. Barths',
    guests: ['g7','g8','g9','g10'],
    itinerary: [
      { date: '2025-12-29', location: 'Gustavia, St. Barths', notes: 'Embarkation 17:00. Welcome champagne and canapés on the aft deck. Dinner at anchor in Gustavia harbour.' },
      { date: '2025-12-30', location: 'Colombier Beach, St. Barths', notes: 'Morning tender drop to Colombier — accessible only by sea or foot. Beach picnic, snorkel, Seabob session in the afternoon.' },
      { date: '2025-12-31', location: 'Grand Cul-de-Sac, St. Barths', notes: 'Prime kite-surf spot — equipment deployed. NYE gala dinner on the sundeck. Champagne toast and fireworks from anchorage at midnight.' },
      { date: '2026-01-01', location: 'Gustavia, St. Barths', notes: 'New Year\'s Day. Lazy morning. Late champagne brunch. Afternoon shopping and exploring in Gustavia town.' },
      { date: '2026-01-02', location: 'Anse de Grand Fond, St. Barths', notes: 'Secluded anchorage, strong eastern winds. Scuba diving with local guide — reef at 18m. Sashimi dinner on board.' },
      { date: '2026-01-03', location: 'Île Fourchue, St. Barths', notes: 'Full offshore island tour by tender. Snorkel at Île Fourchue. Beach BBQ on the rocks. Sundowners back on board.' },
      { date: '2026-01-04', location: 'Gustavia, St. Barths', notes: 'Final full day. Morning water toys, afternoon free. Sunset cocktails ashore at Le Select. Farewell dinner — tasting menu.' },
      { date: '2026-01-05', location: 'Gustavia, St. Barths', notes: 'Disembarkation 10:00. Transfer to Rémy de Haenen Airport for private departure.' },
    ],
    documents: [
      { name: 'Charter Agreement — Chen Family', type: 'contract', date: '2025-10-15' },
      { name: 'APA Receipt — $42,000', type: 'finance', date: '2025-11-02' },
      { name: 'St. Barths Customs & Immigration', type: 'regulatory', date: '2025-12-20' },
      { name: 'Safety Briefing Form', type: 'safety', date: '2025-12-29' },
      { name: 'Guest Preference Sheets', type: 'preferences', date: '2025-12-01' },
      { name: 'Final APA Statement', type: 'finance', date: '2026-01-06' },
    ],
    apa: 42000,
    apaSpent: 39800,
    costs: [
      { id: 'cost-ch3-1', category: 'Fuel',          desc: 'Gustavia fuel dock',                    amount: 6800,  date: '2025-12-28', notes: '' },
      { id: 'cost-ch3-2', category: 'Provisioning',  desc: 'Chen family NYE provisions',            amount: 9200,  date: '2025-12-27', notes: '' },
      { id: 'cost-ch3-3', category: 'Port / marina', desc: 'Gustavia harbour fees × 7 nights',     amount: 3400,  date: '2025-12-29', notes: '' },
      { id: 'cost-ch3-4', category: 'Broker',        desc: 'Burgess commission 15%',               amount: 31500,  date: '2025-12-29', notes: 'Invoiced on charter fee' },
      { id: 'cost-ch3-5', category: 'Crew',          desc: 'Crew gratuity advance',                 amount: 4000,  date: '2026-01-05', notes: 'From APA' },
    ],
    apaExpenses: [
      { id: 'apa-ch3-1', category: 'Fuel',          desc: 'Pre-charter fill — Gustavia',            amount: 8200,  date: '2025-12-28' },
      { id: 'apa-ch3-2', category: 'Provisioning',  desc: 'Chen family NYE provisions — gourmet',  amount: 14800, date: '2025-12-27' },
      { id: 'apa-ch3-3', category: 'Port / marina', desc: 'Gustavia harbour dues × 7 nights',      amount: 3800,  date: '2025-12-29' },
      { id: 'apa-ch3-4', category: 'Crew',          desc: 'Crew gratuity — NYE charter',            amount: 8400,  date: '2026-01-05' },
      { id: 'apa-ch3-5', category: 'Watersports',   desc: 'Scuba guide, Seabob sessions',           amount: 2600,  date: '2026-01-02' },
      { id: 'apa-ch3-6', category: 'Other',         desc: 'NYE fireworks & entertainment',          amount: 2000,  date: '2025-12-31' },
    ],
    quote: {
      ref: 'Q-2025-003',
      status: 'completed',
      issued: '2025-09-10',
      sentDate: '2025-09-10',
      acceptedDate: '2025-10-15',
      validUntil: '2025-10-08',
      payments: [
        { id: 'dep', label: '50% Deposit', amount: 105000, due: '2025-11-01', paid: true, paidDate: '2025-10-28', wire: 'charter' },
        { id: 'bal', label: 'Balance (50%)', amount: 105000, due: '2025-11-29', paid: true, paidDate: '2025-11-25', wire: 'charter' },
        { id: 'apa', label: 'APA Advance', amount: 42000, due: '2025-12-29', paid: true, paidDate: '2025-12-20', wire: 'apa' },
      ],
      wireCharter: {
        bank: 'First Caribbean International Bank',
        city: 'George Town, Cayman Islands',
        accountName: 'Lady M Charter LLC',
        iban: 'KY12 FCIB 0001 2345 6789 01',
        swift: 'FCIBKYKX',
        ref: 'Q-2025-003 · CHEN FAMILY',
      },
      wireAPA: {
        bank: 'Butterfield Bank',
        city: 'George Town, Cayman Islands',
        accountName: 'Lady M Operations Account',
        iban: 'KY12 BUFF 0001 9876 5432 10',
        swift: 'BUFBKYKX',
        ref: 'APA-Q-2025-003 · CHEN FAMILY',
      },
    },
  },
];

FM.guests = [
  { id: 'g1', name: 'William Day', relation: 'Principal guest', initials: 'WD', color: '#A78BFA',
    dietary: 'No restrictions', allergies: 'None', preferences: 'Whisky drinker, prefers single malt. Keen fisherman.',
    cabin: 'Master Stateroom', dob: '1968-03-14' },
  { id: 'g2', name: 'Claire Day', relation: 'Guest', initials: 'CD', color: '#F97316',
    dietary: 'Vegetarian', allergies: 'Tree nuts', preferences: 'Loves yoga on the sundeck. Green juices in the morning.',
    cabin: 'Master Stateroom', dob: '1972-08-22' },
  { id: 'g3', name: 'James Day', relation: 'Guest', initials: 'JD', color: '#60A5FA',
    dietary: 'No restrictions', allergies: 'None', preferences: 'Jet ski, paddleboard. Likes spicy food.',
    cabin: 'VIP Stateroom', dob: '1998-05-11' },
  { id: 'g4', name: 'Sophie Day', relation: 'Guest', initials: 'SD', color: '#4ADE80',
    dietary: 'Vegan', allergies: 'Shellfish, gluten', preferences: 'No alcohol. Loves snorkelling and marine life.',
    cabin: 'VIP Stateroom', dob: '2001-01-30' },
  { id: 'g5', name: 'Robert Harlow', relation: 'Guest', initials: 'RH', color: '#FACC15',
    dietary: 'No restrictions', allergies: 'None', preferences: 'Wine enthusiast — Burgundy and Champagne. Golf on shore.',
    cabin: 'Guest Stateroom 1', dob: '1965-07-04' },
  { id: 'g6', name: 'Diana Harlow', relation: 'Guest', initials: 'DH', color: '#F87171',
    dietary: 'Pescatarian', allergies: 'Dairy', preferences: 'Pilates. Fresh fruit at breakfast. Prefers light lunches.',
    cabin: 'Guest Stateroom 1', dob: '1969-11-15' },
  // ch-003 — Chen Family New Year
  { id: 'g7', name: 'David Chen', relation: 'Principal guest', initials: 'DC', color: '#22D3EE',
    dietary: 'No restrictions', allergies: 'None', preferences: 'Keen kite-surfer and sailor. Prefers Asian cuisine and fresh sashimi.',
    cabin: 'Master Stateroom', dob: '1970-06-12' },
  { id: 'g8', name: 'Linda Chen', relation: 'Guest', initials: 'LC', color: '#4ADE80',
    dietary: 'Pescatarian', allergies: 'None', preferences: 'Yoga and pilates at sunrise. Prefers light, healthy food. Loves green juices.',
    cabin: 'Master Stateroom', dob: '1974-09-03' },
  { id: 'g9', name: 'Alex Chen', relation: 'Guest', initials: 'AC', color: '#F97316',
    dietary: 'No restrictions', allergies: 'Tree nuts', preferences: 'Scuba diving — PADI advanced. Loves sushi and spicy ramen.',
    cabin: 'VIP Stateroom', dob: '1999-03-22' },
  { id: 'g10', name: 'Maya Chen', relation: 'Guest', initials: 'MC', color: '#A78BFA',
    dietary: 'Vegan', allergies: 'None', preferences: 'Avid reader. Loves smoothies and plant-based dishes. No alcohol.',
    cabin: 'VIP Stateroom', dob: '2002-11-08' },
  // ch-002 — Rossi Group Mediterranean
  { id: 'g11', name: 'Marco Rossi', relation: 'Principal guest', initials: 'MR', color: '#FACC15',
    dietary: 'No restrictions', allergies: 'None', preferences: 'Wine collector — Barolo and Brunello. Fine dining enthusiast. Evening cigars on aft deck.',
    cabin: 'Master Stateroom', dob: '1965-04-18' },
  { id: 'g12', name: 'Giulia Rossi', relation: 'Guest', initials: 'GR', color: '#F87171',
    dietary: 'Vegetarian', allergies: 'Shellfish', preferences: 'Art and architecture lover. Light Mediterranean food. Limoncello on the sundeck.',
    cabin: 'Master Stateroom', dob: '1968-07-25' },
  { id: 'g13', name: 'Luca Bianchi', relation: 'Guest', initials: 'LB', color: '#60A5FA',
    dietary: 'No restrictions', allergies: 'None', preferences: 'Open-water swimmer. Loves pasta and grilled seafood. Prosecco at sunset.',
    cabin: 'Guest Stateroom 1', dob: '1972-01-30' },
  { id: 'g14', name: 'Sofia Bianchi', relation: 'Guest', initials: 'SB', color: '#A78BFA',
    dietary: 'Pescatarian', allergies: 'Dairy', preferences: 'Prefers light dishes. Morning swim. Aperol Spritz at golden hour.',
    cabin: 'Guest Stateroom 1', dob: '1975-11-12' },
];

FM.guestRequests = [
  { id: 'gr1', charter: 'ch-001', guest: 'g1', time: 'Today 09:14', type: 'F&B', text: 'Could we have a bottle of Glenfarclas 25yr on the sundeck this evening? And some smoked salmon bites?', status: 'done', assignee: 'c4' },
  { id: 'gr2', charter: 'ch-001', guest: 'g3', time: 'Today 10:32', type: 'Watersports', text: 'Can we get the jet ski ready for around 14:00 at Shoal Bay? James and I want to go out.', status: 'open', assignee: 'c5' },
  { id: 'gr3', charter: 'ch-001', guest: 'g2', time: 'Today 08:00', type: 'Wellness', text: 'Is it possible to do yoga on the foredeck at 07:00 tomorrow before breakfast?', status: 'done', assignee: 'c4' },
  { id: 'gr4', charter: 'ch-001', guest: 'g4', time: 'Yesterday 19:45', type: 'F&B', text: 'Can the chef do a fully gluten-free, vegan dinner tomorrow night? Thai or Japanese style.', status: 'open', assignee: 'c8' },
  { id: 'gr5', charter: 'ch-001', guest: 'g5', time: 'Yesterday 21:00', type: 'F&B', text: 'Could you open the Petrus 2015 from the cellar list for dinner tonight?', status: 'done', assignee: 'c4' },
  // ch-003 — Chen Family (all completed)
  { id: 'gr6', charter: 'ch-003', guest: 'g7', time: '30 Dec 09:00', type: 'Watersports', text: 'Is kite-surfing possible at Grand Cul-de-Sac tomorrow? What equipment do we have on board?', status: 'done', assignee: 'c5' },
  { id: 'gr7', charter: 'ch-003', guest: 'g9', time: '31 Dec 22:00', type: 'F&B', text: 'NYE toast — can we open the Krug Grande Cuvée at midnight? And have some caviar on the side?', status: 'done', assignee: 'c4' },
  { id: 'gr8', charter: 'ch-003', guest: 'g8', time: '30 Dec 07:30', type: 'Wellness', text: 'Pilates mat session on the sundeck at 07:30 each morning if possible. Do you have blocks and straps?', status: 'done', assignee: 'c4' },
  { id: 'gr9', charter: 'ch-003', guest: 'g10', time: '2 Jan 12:00', type: 'F&B', text: 'Can the chef do a fully vegan, gluten-free dinner tonight? Japanese style would be amazing.', status: 'done', assignee: 'c8' },
];

FM.activeCharter = () => FM.charters.find(c => (c.vessel === FM.currentVesselId || FM.currentVesselId === 'all') && c.status === 'active');
FM.charterGuest = id => FM.guests.find(g => g.id === id);

/* ── TENDER FLEET ── */
FM.fleet = [
  {
    id: 'f1', vessel: 'v1', name: 'Lady M Jr', type: 'Tender', make: 'Castoldi', model: 'Jet 12', year: 2021,
    loa: '7.2m', beam: '2.5m', engine: 'Twin Castoldi 4-stroke 300hp total', fuel: 'petrol',
    hours: 847, fuelPct: 85, status: 'in-water',
    lastService: '2026-02-10', nextServiceHours: 950,
    color: '#60A5FA', reg: 'KYA-TDR-001', photo: 'img/castoldi-jet-12.jpg',
    notes: 'Primary guest tender. Equipped with VHF, nav lights, fire extinguisher, 6× life jackets.',
  },
  {
    id: 'f2', vessel: 'v1', name: 'Shadow', type: 'Tender', make: 'Williams', model: 'Turbojet 485', year: 2023,
    loa: '4.85m', beam: '1.9m', engine: 'Yanmar 4JH57 57hp', fuel: 'diesel',
    hours: 234, fuelPct: 92, status: 'davits',
    lastService: '2026-03-15', nextServiceHours: 450,
    color: '#4ADE80', reg: 'KYA-TDR-002', photo: 'img/williams-turbojet-485.jpg',
    notes: 'Crew and provisions tender. Stored on aft davits. Monthly impeller check required.',
  },
  {
    id: 'f3', vessel: 'v1', name: 'Jet Ski 1', type: 'PWC', make: 'Sea-Doo', model: 'GTX 230', year: 2022,
    loa: '3.4m', beam: '1.2m', engine: 'Rotax 1630 ACE 230hp', fuel: 'petrol',
    hours: 312, fuelPct: 70, status: 'swim-platform',
    lastService: '2026-01-20', nextServiceHours: 400,
    color: '#FACC15', reg: 'KYA-PWC-001', photo: 'img/jet-ski-1.avif',
    notes: 'Guest use only. Helmet stored in starboard watersports locker. Max 2 riders.',
  },
  {
    id: 'f4', vessel: 'v1', name: 'Jet Ski 2', type: 'PWC', make: 'Sea-Doo', model: 'GTX 230', year: 2022,
    loa: '3.4m', beam: '1.2m', engine: 'Rotax 1630 ACE 230hp', fuel: 'petrol',
    hours: 298, fuelPct: 65, status: 'swim-platform',
    lastService: '2026-01-20', nextServiceHours: 400,
    color: '#F97316', reg: 'KYA-PWC-002', photo: 'img/jet-ski-2.avif',
    notes: 'Guest use only. Inspect hull and wear ring every 50 hours.',
  },
  {
    id: 'f5', vessel: 'v1', name: 'Seabob 1', type: 'Seabob', make: 'Seabob', model: 'F5 SR', year: 2023,
    loa: '1.6m', beam: '0.5m', engine: 'Electric motor 10kW', fuel: 'electric',
    hours: 88, fuelPct: 100, status: 'charged',
    lastService: '2026-02-01', nextServiceHours: 200,
    color: '#A78BFA', reg: null, photo: 'img/seabob-f5.webp',
    notes: 'Charge takes 3.5 hours. Max depth 40m. Inspect impeller o-rings monthly.',
  },
];

/* ── FLEET ACTIVITY LOG ── */
FM.fleetLog = [
  { id: 'fl1', craftId: 'f1', type: 'hours',  date: '2026-04-30', crew: 'c5', hours: 847,  note: 'Guest transfer run × 3, Shoal Bay' },
  { id: 'fl2', craftId: 'f3', type: 'fuel',   date: '2026-04-30', crew: 'c5', litres: 42,  cost: 126,  fuelPct: 70,  note: 'Fuelled dockside before watersports afternoon' },
  { id: 'fl3', craftId: 'f1', type: 'fuel',   date: '2026-04-29', crew: 'c5', litres: 110, cost: 330,  fuelPct: 85,  note: 'Full top-up at Gustavia fuel dock' },
  { id: 'fl4', craftId: 'f4', type: 'hours',  date: '2026-04-28', crew: 'c7', hours: 298,  note: 'Jet ski 2 — guest session 1.5hrs, Anguilla' },
  { id: 'fl5', craftId: 'f2', type: 'hours',  date: '2026-04-28', crew: 'c5', hours: 234,  note: 'Provisions run to town quay × 2' },
  { id: 'fl6', craftId: 'f5', type: 'charge', date: '2026-04-27', crew: 'c7', fuelPct: 100, note: 'Seabob fully charged overnight — 3.5h charge cycle' },
  { id: 'fl7', craftId: 'f3', type: 'hours',  date: '2026-04-27', crew: 'c7', hours: 312,  note: 'Jet ski 1 — guest session 2hrs, Île Fourchue' },
  { id: 'fl8', craftId: 'f1', type: 'hours',  date: '2026-04-26', crew: 'c5', hours: 843,  note: 'Beach BBQ tender runs — 4 trips' },
];

/* ── PLANNED MAINTENANCE SYSTEM ── */
FM.pms = [
  // PORT ENGINE
  { id: 'pms1', vessel: 'v1', system: 'Propulsion', asset: 'Port CAT C32', task: 'Engine oil & filter change', interval: '250 hrs', lastHours: 2750, lastDate: '2026-01-15', currentHours: 3047, dueHours: 3000, assignee: 'c3', status: 'overdue', wo: 'WO-001' },
  { id: 'pms2', vessel: 'v1', system: 'Propulsion', asset: 'Port CAT C32', task: 'Fuel filter replacement',    interval: '500 hrs', lastHours: 2500, lastDate: '2025-10-01', currentHours: 3047, dueHours: 3000, assignee: 'c3', status: 'overdue', wo: null },
  { id: 'pms3', vessel: 'v1', system: 'Propulsion', asset: 'Port CAT C32', task: 'Raw water impeller check',   interval: '1000 hrs', lastHours: 2000, lastDate: '2025-06-10', currentHours: 3047, dueHours: 3000, assignee: 'c3', status: 'overdue', wo: null },
  { id: 'pms4', vessel: 'v1', system: 'Propulsion', asset: 'Port CAT C32', task: 'V-belt inspection & replace', interval: '1000 hrs', lastHours: 2000, lastDate: '2025-06-10', currentHours: 3047, dueHours: 3000, assignee: 'c3', status: 'overdue', wo: null },
  // STBD ENGINE
  { id: 'pms5', vessel: 'v1', system: 'Propulsion', asset: 'Stbd CAT C32', task: 'Engine oil & filter change', interval: '250 hrs', lastHours: 2740, lastDate: '2026-01-15', currentHours: 3041, dueHours: 2990, assignee: 'c3', status: 'overdue', wo: null },
  { id: 'pms6', vessel: 'v1', system: 'Propulsion', asset: 'Stbd CAT C32', task: 'Fuel filter replacement',    interval: '500 hrs', lastHours: 2490, lastDate: '2025-10-01', currentHours: 3041, dueHours: 2990, assignee: 'c3', status: 'overdue', wo: null },
  // GENERATOR
  { id: 'pms7', vessel: 'v1', system: 'Electrical',  asset: 'Northern Lights 20kW Gen', task: 'Oil & filter change', interval: '250 hrs', lastHours: 8600, lastDate: '2026-02-20', currentHours: 8847, dueHours: 8850, assignee: 'c3', status: 'due-soon', wo: null },
  { id: 'pms8', vessel: 'v1', system: 'Electrical',  asset: 'Northern Lights 20kW Gen', task: 'Spark plug replacement', interval: '500 hrs', lastHours: 8350, lastDate: '2025-11-01', currentHours: 8847, dueHours: 8850, assignee: 'c3', status: 'due-soon', wo: null },
  // TENDER
  { id: 'pms9',  vessel: 'v1', system: 'Tender Fleet', asset: 'Lady M Jr (Castoldi)', task: 'Annual service — impeller, belts, zincs', interval: '100 hrs / annual', lastHours: 750, lastDate: '2026-02-10', currentHours: 847, dueHours: 950, assignee: 'c5', status: 'upcoming', wo: null },
  { id: 'pms10', vessel: 'v1', system: 'Tender Fleet', asset: 'Jet Ski 1 & 2 (Sea-Doo)', task: '100-hour service — oil, spark plugs, wear ring', interval: '100 hrs', lastHours: 250, lastDate: '2026-01-20', currentHours: 312, dueHours: 350, assignee: 'c5', status: 'upcoming', wo: null },
  // SAFETY
  { id: 'pms11', vessel: 'v1', system: 'Safety / Fire', asset: 'Life raft × 2', task: 'Annual service & repack', interval: 'Annual', lastHours: null, lastDate: '2025-10-08', currentHours: null, dueHours: null, dueDate: '2026-10-08', assignee: 'c2', status: 'upcoming', wo: null },
  { id: 'pms12', vessel: 'v1', system: 'Safety / Fire', asset: 'Fire extinguishers × 12', task: 'Annual pressure check & certification', interval: 'Annual', lastHours: null, lastDate: '2026-01-14', currentHours: null, dueHours: null, dueDate: '2027-01-14', assignee: 'c3', status: 'upcoming', wo: null },
  // HULL
  { id: 'pms13', vessel: 'v1', system: 'Hull', asset: 'Shaft anodes', task: 'Zinc anode replacement', interval: '6 months', lastHours: null, lastDate: '2026-01-10', currentHours: null, dueHours: null, dueDate: '2026-07-10', assignee: 'c5', status: 'upcoming', wo: null },
  { id: 'pms14', vessel: 'v1', system: 'Hull', asset: 'Antifouling', task: 'Bottom paint — full haul & repaint', interval: '18 months', lastHours: null, lastDate: '2025-04-01', currentHours: null, dueHours: null, dueDate: '2026-10-01', assignee: 'c5', status: 'upcoming', wo: null },
  // WATERMAKER
  { id: 'pms15', vessel: 'v1', system: 'Systems', asset: 'Spectra Newport 400 Watermaker', task: 'Membrane flush & pickling', interval: 'Every 4 weeks idle', lastHours: null, lastDate: '2026-04-10', currentHours: null, dueHours: null, dueDate: '2026-05-10', assignee: 'c3', status: 'due-soon', wo: null },
];

/* ── VESSEL LOGBOOK ── */
FM.logbook = [
  { id: 'lb1', vessel: 'v1', date: '2026-05-08', watch: 'c2', portHrs: 3047, stbdHrs: 3041, genHrs: 8847, position: "18°11'N 63°03'W", location: 'Shoal Bay East, Anguilla — at anchor', weather: 'SE 14kt, partly cloudy, 29°C, seas 2–3ft', status: 'at-anchor', notes: 'Anchored Shoal Bay East 08:30, 18ft. Guests ashore 10:00 via tender. Jet skis deployed 09:45 — all returned 16:30. All crew aboard 17:00. Sundowner cocktails on deck 17:30.' },
  { id: 'lb2', vessel: 'v1', date: '2026-05-07', watch: 'c2', portHrs: 3043, stbdHrs: 3037, genHrs: 8832, position: "18°13'N 63°04'W", location: 'Sandy Ground, Anguilla — marina berth', weather: 'ESE 12kt, clear, 28°C', status: 'berthed', notes: 'Berthed Sandy Ground 17:00 after day passage from St. Barths (64nm). Port engine coolant temp peaked 91°C during passage — WO-001 escalated. Guests dinner ashore at Veya. Dmitri completed tender engine flush.' },
  { id: 'lb3', vessel: 'v1', date: '2026-05-06', watch: 'c2', portHrs: 3038, stbdHrs: 3032, genHrs: 8818, position: "17°55'N 62°51'W", location: 'Île Fourchue, St. Barths — at anchor', weather: 'NE 8kt, sunny, 30°C', status: 'at-anchor', notes: 'Anchored Île Fourchue 09:00, 22ft. Morning snorkel — excellent visibility 25m+. Beach picnic by tender 12:30. Uneventful. Departed 16:00.' },
  { id: 'lb4', vessel: 'v1', date: '2026-05-05', watch: 'c2', portHrs: 3036, stbdHrs: 3030, genHrs: 8810, position: "17°54'N 62°51'W", location: 'Gustavia, St. Barths — harbour', weather: 'NE 10kt, partly cloudy, 29°C', status: 'berthed', notes: 'Guests embarked 18:00 — 6 pax, all crew aboard 16:00. Safety briefing completed 17:30. Welcome cocktails and dinner on aft deck. Port engine CAT thermostat replaced by Dmitri 14:00 (WO-001 partial resolution).' },
  { id: 'lb5', vessel: 'v1', date: '2026-05-04', watch: 'c2', portHrs: 3036, stbdHrs: 3030, genHrs: 8800, position: "17°54'N 62°51'W", location: 'Gustavia, St. Barths — harbour', weather: 'NE 15kt, clear, 27°C', status: 'berthed', notes: 'Charter preparation day. Blue Water Provisioning delivery received 10:00 — 100% complete. Fuel bunkered 1,200L diesel. Ana Costa (provisioner) on board 13:00–16:00. All bilge compartments checked — clear.' },
  { id: 'lb6', vessel: 'v1', date: '2026-05-02', watch: 'c2', portHrs: 3035, stbdHrs: 3029, genHrs: 8790, position: "17°54'N 62°51'W", location: 'Gustavia, St. Barths — harbour', weather: 'E 12kt, partly cloudy, 28°C', status: 'berthed', notes: 'CAT dealer Jim Farley on board 09:00–14:00 for port engine inspection. Thermostat confirmed faulty — replacement ordered. Generator load test completed — pass. AV system firmware update by YachtAV Solutions 15:00.' },
];

/* ── INVENTORY ── */
FM.inventory = [
  { id:'inv-01', vessel:'v1', name:'Engine Oil — CAT DEO-ULS 15W-40', category:'Engineering', qty:24, unit:'L',     reorderAt:10, location:'ER Locker A2',      cost:8.5  },
  { id:'inv-02', vessel:'v1', name:'Hydraulic Oil — Repsol Telex 46',  category:'Engineering', qty:40, unit:'L',     reorderAt:15, location:'ER Locker A1',      cost:6.2  },
  { id:'inv-03', vessel:'v1', name:'Coolant 50/50 Premix',             category:'Engineering', qty:4,  unit:'L',     reorderAt:10, location:'ER Shelf',          cost:12.0 },
  { id:'inv-04', vessel:'v1', name:'Fuel Filter — Racor 1000FG',       category:'Engineering', qty:6,  unit:'units', reorderAt:2,  location:'ER Locker B1',      cost:42.0 },
  { id:'inv-05', vessel:'v1', name:'Raw Water Impeller — CAT C32',     category:'Engineering', qty:2,  unit:'units', reorderAt:1,  location:'ER Locker B2',      cost:62.0 },
  { id:'inv-06', vessel:'v1', name:'Life Jackets — Adult',             category:'Safety',      qty:18, unit:'units', reorderAt:18, location:'Crew Mess Locker',   cost:185  },
  { id:'inv-07', vessel:'v1', name:'Life Jackets — Child',             category:'Safety',      qty:4,  unit:'units', reorderAt:4,  location:'Crew Mess Locker',   cost:120  },
  { id:'inv-08', vessel:'v1', name:'EPIRB Batteries',                  category:'Safety',      qty:2,  unit:'units', reorderAt:2,  location:'Bridge Locker',      cost:95   },
  { id:'inv-09', vessel:'v1', name:'Fire Extinguisher CO2 — 5kg',      category:'Safety',      qty:8,  unit:'units', reorderAt:8,  location:'Various',            cost:140  },
  { id:'inv-10', vessel:'v1', name:'Sunscreen SPF50 — Guest',          category:'Provisions',  qty:12, unit:'bottles',reorderAt:4,  location:'Deck Box',          cost:22   },
  { id:'inv-11', vessel:'v1', name:'Sparkling Water — San Pellegrino', category:'Provisions',  qty:48, unit:'bottles',reorderAt:24, location:'Galley Storage',    cost:3.5  },
  { id:'inv-12', vessel:'v1', name:'Red Wine — Burgundy Pinot Noir',   category:'Provisions',  qty:24, unit:'bottles',reorderAt:12, location:'Wine Cellar',       cost:45   },
  { id:'inv-13', vessel:'v1', name:'Champagne — Moët & Chandon',       category:'Provisions',  qty:6,  unit:'bottles',reorderAt:6,  location:'Wine Cellar',       cost:55   },
  { id:'inv-14', vessel:'v1', name:'Deck Scrub Brushes',               category:'Deck',        qty:4,  unit:'units', reorderAt:2,  location:'Deck Locker',        cost:28   },
  { id:'inv-15', vessel:'v1', name:'Teak Cleaner — 5L',                category:'Deck',        qty:2,  unit:'containers',reorderAt:1,location:'Deck Locker',      cost:45   },
  { id:'inv-16', vessel:'v1', name:'Zinc Anodes — Shaft 40mm',         category:'Deck',        qty:4,  unit:'units', reorderAt:4,  location:'Aft Deck Locker',    cost:18   },
];

/* ── BUDGET ── */
FM.budget = [
  { id:'bud-01', vessel:'v1', year:2026, category:'Fuel & Lubricants',    budgeted:95000,  actualOverride:null },
  { id:'bud-02', vessel:'v1', year:2026, category:'Crew Salaries',         budgeted:380000, actualOverride:168000 },
  { id:'bud-03', vessel:'v1', year:2026, category:'Maintenance & Repairs', budgeted:85000,  actualOverride:22400  },
  { id:'bud-04', vessel:'v1', year:2026, category:'Provisioning',          budgeted:45000,  actualOverride:null   },
  { id:'bud-05', vessel:'v1', year:2026, category:'Port & Marina Fees',    budgeted:38000,  actualOverride:null   },
  { id:'bud-06', vessel:'v1', year:2026, category:'Insurance',             budgeted:62000,  actualOverride:62000  },
  { id:'bud-07', vessel:'v1', year:2026, category:'Communications & IT',   budgeted:12000,  actualOverride:5400   },
  { id:'bud-08', vessel:'v1', year:2026, category:'Safety & Compliance',   budgeted:8000,   actualOverride:1200   },
];

/* ── HOURS OF REST ── */
FM.hoursOfRest = [
  { id:'hor-01', vessel:'v1', crewId:'c2', date:'2026-05-06', workHours:10, restHours:14 },
  { id:'hor-02', vessel:'v1', crewId:'c2', date:'2026-05-05', workHours:8,  restHours:16 },
  { id:'hor-03', vessel:'v1', crewId:'c2', date:'2026-05-04', workHours:12, restHours:12 },
  { id:'hor-04', vessel:'v1', crewId:'c2', date:'2026-05-03', workHours:9,  restHours:15 },
  { id:'hor-05', vessel:'v1', crewId:'c2', date:'2026-05-02', workHours:11, restHours:13 },
  { id:'hor-06', vessel:'v1', crewId:'c2', date:'2026-05-01', workHours:8,  restHours:16 },
  { id:'hor-07', vessel:'v1', crewId:'c2', date:'2026-04-30', workHours:14, restHours:10 },
  { id:'hor-08', vessel:'v1', crewId:'c3', date:'2026-05-06', workHours:11, restHours:13 },
  { id:'hor-09', vessel:'v1', crewId:'c3', date:'2026-05-05', workHours:10, restHours:14 },
  { id:'hor-10', vessel:'v1', crewId:'c3', date:'2026-05-04', workHours:9,  restHours:15 },
  { id:'hor-11', vessel:'v1', crewId:'c3', date:'2026-05-03', workHours:13, restHours:11 },
  { id:'hor-12', vessel:'v1', crewId:'c3', date:'2026-05-02', workHours:8,  restHours:16 },
  { id:'hor-13', vessel:'v1', crewId:'c3', date:'2026-05-01', workHours:10, restHours:14 },
  { id:'hor-14', vessel:'v1', crewId:'c3', date:'2026-04-30', workHours:11, restHours:13 },
  { id:'hor-15', vessel:'v1', crewId:'c5', date:'2026-05-06', workHours:15, restHours:9  },
  { id:'hor-16', vessel:'v1', crewId:'c5', date:'2026-05-05', workHours:10, restHours:14 },
  { id:'hor-17', vessel:'v1', crewId:'c5', date:'2026-05-04', workHours:9,  restHours:15 },
  { id:'hor-18', vessel:'v1', crewId:'c5', date:'2026-05-03', workHours:11, restHours:13 },
  { id:'hor-19', vessel:'v1', crewId:'c5', date:'2026-05-02', workHours:8,  restHours:16 },
  { id:'hor-20', vessel:'v1', crewId:'c5', date:'2026-05-01', workHours:12, restHours:12 },
  { id:'hor-21', vessel:'v1', crewId:'c5', date:'2026-04-30', workHours:10, restHours:14 },
  { id:'hor-22', vessel:'v1', crewId:'c4', date:'2026-05-06', workHours:9,  restHours:15 },
  { id:'hor-23', vessel:'v1', crewId:'c4', date:'2026-05-05', workHours:10, restHours:14 },
  { id:'hor-24', vessel:'v1', crewId:'c4', date:'2026-05-04', workHours:11, restHours:13 },
  { id:'hor-25', vessel:'v1', crewId:'c4', date:'2026-05-03', workHours:8,  restHours:16 },
  { id:'hor-26', vessel:'v1', crewId:'c4', date:'2026-05-02', workHours:9,  restHours:15 },
  { id:'hor-27', vessel:'v1', crewId:'c4', date:'2026-05-01', workHours:10, restHours:14 },
  { id:'hor-28', vessel:'v1', crewId:'c4', date:'2026-04-30', workHours:11, restHours:13 },
];

/* ── VESSEL DOCUMENTS ── */
FM.vesselDocs = [
  { id:'vd-01', vessel:'v1', name:'Certificate of Registry',              category:'Registration', expires:'2027-06-30', docRef:'COR-2024-v1',    uploadedAt:'2024-01-15', notes:'Cayman Islands Shipping Registry' },
  { id:'vd-02', vessel:'v1', name:'International Tonnage Certificate',    category:'Registration', expires:null,         docRef:'ITC-2019-v1',    uploadedAt:'2024-01-15', notes:'' },
  { id:'vd-03', vessel:'v1', name:'Radio Station Licence',                category:'Registration', expires:'2027-03-01', docRef:'RSL-2024-4812',  uploadedAt:'2024-03-01', notes:'Cayman Islands — ship station' },
  { id:'vd-04', vessel:'v1', name:'Hull & Machinery Insurance Policy',    category:'Insurance',    expires:'2026-12-31', docRef:'HM-2026-LM001',  uploadedAt:'2026-01-10', notes:'Pantaenius — $12.5M hull value' },
  { id:'vd-05', vessel:'v1', name:'P&I Club Certificate',                 category:'Insurance',    expires:'2027-02-20', docRef:'PI-2026-789',    uploadedAt:'2026-02-10', notes:'West of England P&I — $100M liability' },
  { id:'vd-06', vessel:'v1', name:'Charter Agreement — Day Family',       category:'Contracts',    expires:null,         docRef:'CH-2026-001',    uploadedAt:'2026-03-20', notes:'MYBA charter agreement — Bermuda' },
  { id:'vd-07', vessel:'v1', name:'Charter Agreement — Rossi Group',      category:'Contracts',    expires:null,         docRef:'CH-2026-002',    uploadedAt:'2026-04-05', notes:'MYBA charter agreement — Mediterranean' },
  { id:'vd-08', vessel:'v1', name:'VSAT Service Agreement — KVH',         category:'Contracts',    expires:'2027-01-01', docRef:'VSAT-2025-44',   uploadedAt:'2025-01-15', notes:'KVH — Iridium backup' },
  { id:'vd-09', vessel:'v1', name:'Engine Room Manual — CAT C32 Vol 1',   category:'Manuals',      expires:null,         docRef:'MAN-CAT-C32-1',  uploadedAt:'2024-06-01', notes:'Operation & maintenance manual' },
  { id:'vd-10', vessel:'v1', name:'Safety Management Manual',             category:'Manuals',      expires:null,         docRef:'SMM-v3-2025',    uploadedAt:'2025-11-01', notes:'ISM Code compliant — v3' },
  { id:'vd-11', vessel:'v1', name:'Voyage & Emergency Plan',              category:'Manuals',      expires:null,         docRef:'VEP-2025-LM',    uploadedAt:'2025-09-01', notes:'Includes muster list & fire plan' },
  { id:'vd-12', vessel:'v1', name:'Naiad Gyro Stabilizer Manual',         category:'Manuals',      expires:null,         docRef:'MAN-NAI-G300',   uploadedAt:'2024-06-01', notes:'Gyro-300 installation & ops manual' },
];

/* ── NOTIFICATIONS ── */
FM.notifications = [
  { id:'n1', type:'alert', title:'Port engine coolant temp high', sub:'91°C during last passage — WO-001 open', time:'2 min ago', read:false, wo:'WO-001' },
  { id:'n2', type:'alert', title:'PMS overdue — 6 tasks', sub:'Port & stbd engine oil changes past due', time:'1 hr ago', read:false },
  { id:'n3', type:'info',  title:'Lady M Jr service upcoming', sub:'Next service at 950 hrs — 103 hrs remaining', time:'3 hrs ago', read:true },
  { id:'n4', type:'info',  title:'Provisions delivery confirmed', sub:'Blue Water Provisioning — 5 May 08:00', time:'Yesterday', read:true },
  { id:'n5', type:'info',  title:'Charter contract signed', sub:'Rossi Group — Jul 10–24', time:'2 days ago', read:true },
];

/* ── CHECKLIST LIBRARY ── */
FM.checklists = [
  {
    id: 'cl0', category: 'Departure', name: 'Pre-departure Operations', scope: 'all', builtin: true, estimatedTime: '2 hrs',
    sections: [
      { team: 'Captain / Operations', items: [
        'Crew notified of departure',
        'Weather forecast checked',
        'Cruising permit and port documentation in order',
        'All ship\'s paperwork valid',
        'Health visas and protocols for port of call confirmed',
        'Provisions and stores sufficient for passage',
        'Destination courtesy flag onboard and in good order',
        'MARPOL regulations for port of call checked',
        'Fuel bunkered — quantity sufficient for passage',
        'All port formalities completed',
        'Crew passports and SIRBs collected and in date',
        'Crew drills confirmed (Fire, MOB, Abandon Ship)',
        'Insurance informed — crew list updated',
        'Tender tow plan reviewed',
        'All bills and marina charges closed out',
        'Marina notified of departure time',
        'Garbage receipt collected',
        'VTS / Pilot notified of departure (if required)',
        'Departure notification sent to management / owner',
        'Dock staff gratuity prepared (if applicable)',
        'Shoes and hoses collected from dock',
      ]},
      { team: 'Bridge / Navigation', items: [
        'Passage plan prepared — berth to berth',
        'Ports of refuge identified',
        'ECS and charts updated within past week',
        'Notice to Mariners checked',
        'Arrival and anchoring protocols reviewed',
        'Navigation equipment checked and operational',
        'Radars operational — heading confirmed',
        'Navigation lights tested (port, stbd, stern, masthead)',
        'Radio checks completed — VHF on correct channel',
        'All handheld VHF / UHF radios charged',
        'Horn operational',
        'Departure tide checked (if applicable)',
        'Log book opened and started',
        'Crew hours of rest up to date',
        'Drill and safety matrix up to date',
        'Steering gear tested — test logged',
        'Anchors readied for departure',
        'Marina keys and electric cards returned (if applicable)',
        'Radar set to correct range',
        'Grab bag and ship\'s papers at hand',
        'All alarms audible',
        'All hatches and portholes secured',
        'Crew briefed on weather, stowage, and passage details',
      ]},
      { team: 'Engineering', items: [
        'Engineering pre-departure checklist initiated',
        'All bilge alarms checked and operational',
        'Engine room, bow thruster, lazarette, and tender garage bilges dry',
        'Main engines started and warmed up',
        'Bow thruster tested',
        'Stern thruster tested',
        'Stabilizers tested and operational',
        'Fire alarm checked',
        'Generator started — vessel on generator power',
        'Shore power cord disconnected and stowed',
        'Engine room ventilation on',
        'All electrical breakers on',
        'Propulsion check completed',
        'Engineering checklist signed off',
      ]},
      { team: 'Deck', items: [
        'Stow for sea checklist completed',
        'Tender bilges dry and pumps operational',
        'Tender engine started and checked',
        'Tender sea cocks closed — sink secured for sea',
        'Tender anchor spray hood in place',
        'Tender within towing policy — shackles moused',
        'Tender tow lines readied and checked',
        'Tender tow briefing completed with crew',
        'Lines singled up for departure',
        'Navigation lights on (if departing after dark)',
        'Marina called — cleared for departure',
        'All trash removed from vessel and dock',
        'Crane hooks secured',
        'Lines and fenders stowed after casting off',
      ]},
    ]
  },
  { id:'cl1', category:'Departure', name:'Pre-departure Safety Checklist', scope:'all', builtin:true, steps:['All hatches and ports secured','Life jackets confirmed accessible — 1 per person + 20% spares','EPIRB armed and registered','Fire extinguishers inspected and tagged','Bilge pumps tested — auto and manual','Navigation lights tested (port, stbd, stern, masthead)','MOB equipment at helm station','DSC radio tested — MMSI confirmed','Engine room fire suppression armed','Crew briefed on muster stations','VHF channel 16 monitored','Weather checked — forecast acceptable'] },
  { id:'cl2', category:'Departure', name:'Engine Room Pre-departure', scope:'all', builtin:true, steps:['Engine oil levels — port and stbd','Coolant levels — port and stbd','Gear oil levels checked','Raw water strainer clear','Impeller last replacement date confirmed','Belts inspected — no cracking or wear','Bilge dry or at acceptable level','Sea cocks open','Generator ready and tested','Fuel level confirmed — range acceptable for passage'] },
  { id:'cl3', category:'Arrival', name:'Arrival & Berthing Checklist', scope:'all', builtin:true, steps:['Anchor light rigged (if anchoring)','Fenders deployed — correct side','Lines prepared — bow, stern, springs','Shore power connection ready (if berthing)','Customs / immigration documentation ready','Waste holding tank capacity checked','Provisioning requirements noted for next leg','Guest and crew disembarkation briefed'] },
  { id:'cl4', category:'Charter', name:'Guest Embarkation Checklist', scope:'charter', builtin:true, steps:['Guest cabins inspected and signed off','Welcome amenities in place — champagne, fruit, flowers','Safety briefing materials printed or loaded on tablet','Emergency card in each cabin','Guest preference sheets reviewed with chef','Tender ready for airport transfers','Crew in uniform and briefed on guests','Gangway or boarding platform ready and safe','Guest luggage storage plan confirmed with chief stew'] },
  { id:'cl5', category:'Charter', name:'Guest Disembarkation Checklist', scope:'charter', builtin:true, steps:['Guest luggage retrieved from all cabins','Customs and immigration forms signed','APA reconciliation complete — statement printed and reviewed','Gratuity received and distributed per captain','Guest feedback form presented','Departure gift packed and ready','Transfers confirmed — car, helicopter, or tender','Shore-side agent briefed on arrival time','Thank-you card from captain signed and ready'] },
  { id:'cl6', category:'Maintenance', name:'Weekly Engine Room Inspection', scope:'all', builtin:true, steps:['Check all fluid levels (oil, coolant, gear oil, hydraulic)','Inspect bilge — run pump auto test','Check raw water strainers and clean if needed','Inspect shaft seals — drip rate acceptable','Check exhaust manifold — no unusual colour or smoke','Inspect fuel filters for water contamination','Verify all through-hulls operate correctly','Log all readings in maintenance record'] },
  { id:'cl7', category:'Safety', name:'Monthly Safety Equipment Check', scope:'all', builtin:true, steps:['EPIRB: hydrostatic release date, battery expiry','Life raft: hydrostatic release date, cylinder weight','Flares: quantity and expiry dates','Fire extinguishers: pressure gauge and inspection tag','Life jackets: condition, lights, and whistle','Smoke / CO detectors: test and battery check','First aid kit: contents and expiry of medications','Immersion suits: condition and zip test'] },
  { id:'cl8', category:'Passage', name:'Night Watch Handover', scope:'all', builtin:true, steps:['Course and speed confirmed with outgoing watch','Weather conditions and forecast briefed','Traffic noted on AIS — any TCPA alerts?','Engine room last check time noted','Fuel level logged','VHF channel 16 confirmed monitoring','Next waypoint and ETA confirmed','Any anomalies or concerns briefed in writing in the log'] },
  { id:'cl9', category:'Maintenance', name:'Sea-Doo GTX 230 — Fuel Filter Change', scope:'all', builtin:true, photo:'🚤', partNumber:'BRP 529036068', estimatedTime:'30 min', steps:['Ensure engine is cool and ignition off','Remove seat by pressing rear latch and lifting','Locate fuel tank — filter is on the port fuel line','Pinch fuel line clamp with pliers and slide back','Pull fuel line off filter inlet — have rag ready','Slide filter off outlet line — note arrow direction','Install new BRP fuel filter — arrow must point toward engine','Reconnect both fuel lines — slide clamps over barbs','Press clamps firmly until they click into position','Reinstall seat — press until latched','Start engine and run 2 minutes — check for fuel smell or leaks','Log replacement date and hours in maintenance record'] },
  { id:'cl10', category:'Maintenance', name:'Sea-Doo — 100 Hour Service', scope:'all', builtin:true, photo:'🚤', partNumber:'Various BRP', estimatedTime:'3–4 hrs', steps:['Flush engine with fresh water — run flush port 5 min with hose','Drain oil from Rotax engine — warm engine first','Replace oil filter (BRP 420956741)','Refill with BRP XPS 4-Stroke 5W-40 oil — 4.2L','Inspect and replace spark plugs × 2 (BRP 420897914)','Remove and inspect wear ring for scoring or cracks','Inspect impeller — replace if chipped or damaged','Check hull drain plugs — replace O-rings if worn','Lubricate throttle cable and handlebar pivot points','Inspect and test reverse gate','Check bilge for fuel or water contamination','Verify all hose clamps tight — no cracking','Test all functions: forward, reverse, brakes, trim','Check registration is current and displayed','Log service at correct hour count'] },
  { id:'cl11', category:'Maintenance', name:'Tender Annual Service — Outboard', scope:'all', builtin:true, photo:'⛵', estimatedTime:'4–5 hrs', steps:['Flush outboard with fresh water 15 min via flush port','Change lower unit gear oil — drain and refill','Replace raw water pump impeller — inspect housing for wear','Replace primary fuel filter — Racor 500FG or equivalent','Replace inline fuel filter if fitted','Inspect and clean throttle body','Inspect spark plugs — replace if fouled or >100hrs','Torque propeller nut — check anode condition','Inspect steering cables — lubricate pivot points','Check engine mounting bolts for tightness','Test trim and tilt — full range of motion','Engine flush after test run','Update service sticker on engine cowl','Log in maintenance record'] },
  { id:'cl12', category:'Maintenance', name:'Generator 250-Hour Service', scope:'all', builtin:true, photo:'⚡', estimatedTime:'2 hrs', steps:['Allow generator to cool — minimum 30 min','Change oil and oil filter — use specified grade','Replace fuel filter — primary and secondary','Inspect and clean air filter — replace if dirty','Check coolant level and condition','Inspect drive belts — replace if cracked or worn','Check zinc anodes if raw-water cooled — replace if >50% depleted','Test at full load for 30 minutes — monitor temperatures','Check exhaust backpressure — not to exceed spec','Log service date, hours, and oil grade in record'] },
  { id:'cl13', category:'Maintenance', name:'Watermaker Membrane Flush & Pickle', scope:'all', builtin:true, photo:'💧', estimatedTime:'45 min', steps:['Bypass production to drain — do not fill tanks','Flush membranes with fresh water at low pressure for 20 min','If vessel idle >4 weeks: apply food-grade pickling solution (Katadyn Preserve)','Circulate pickle solution through membranes for 5 min','Close inlet and outlet valves to hold solution in membranes','Log flush date and solution used','Schedule next flush — every 3–4 weeks if idle','Before returning to service: flush pickle out 20 min before production'] },
  { id:'cl14', category:'Safety', name:'Fire & Flooding Emergency Drill', scope:'all', builtin:true, steps:['Brief all crew on scenario before drill','Sound alarm — record time all crew at muster stations','Assign roles: pump operator, damage control, communications','Simulate flooding: verify bilge pump activation in auto mode','Simulate fire: verify fire extinguisher access and crew knowledge','Demonstrate EPIRB manual activation (do not transmit)','Confirm all crew know location of life raft','Debrief — record any gaps found','Log drill date and crew attendance'] },
];

/* ── VESSEL CERTIFICATES ── */
FM.vesselCerts = [
  { id:'vc1',  vessel:'v1', name:'Certificate of Registry',                  category:'Registry',  issuer:'Cayman Islands Shipping Registry', issued:'2023-06-01', expires:'2028-06-01', docRef:'CI-2023-0142' },
  { id:'vc2',  vessel:'v1', name:'Safety Management Certificate (ISM)',       category:'ISM',       issuer:'Bureau Veritas',                   issued:'2024-01-15', expires:'2026-07-15', docRef:'BV-SMC-2024-0891' },
  { id:'vc3',  vessel:'v1', name:'Load Line Certificate',                     category:'SOLAS',     issuer:'Bureau Veritas',                   issued:'2023-11-01', expires:'2026-05-15', docRef:'BV-LLC-2023-1204' },
  { id:'vc4',  vessel:'v1', name:'Safety Equipment Certificate',              category:'SOLAS',     issuer:'Bureau Veritas',                   issued:'2023-11-01', expires:'2026-05-01', docRef:'BV-SEC-2023-1205' },
  { id:'vc5',  vessel:'v1', name:'Radio Safety Certificate',                  category:'SOLAS',     issuer:'Bureau Veritas',                   issued:'2023-11-01', expires:'2026-11-01', docRef:'BV-RSC-2023-1206' },
  { id:'vc6',  vessel:'v1', name:'Tonnage Certificate',                       category:'Registry',  issuer:'Cayman Islands Shipping Registry', issued:'2018-03-15', expires:null,         docRef:'CI-TC-2018-0088' },
  { id:'vc7',  vessel:'v1', name:'P&I Club Certificate',                      category:'Insurance', issuer:'Skuld P&I',                        issued:'2026-02-20', expires:'2027-02-20', docRef:'SKULD-2026-1456' },
  { id:'vc8',  vessel:'v1', name:'Hull & Machinery Insurance',                category:'Insurance', issuer:'Zurich Marine',                    issued:'2026-02-20', expires:'2027-02-20', docRef:'ZM-2026-8823' },
  { id:'vc9',  vessel:'v1', name:'Minimum Safe Manning Document',             category:'Flag State',issuer:'Cayman Islands Shipping Registry', issued:'2023-06-01', expires:'2028-06-01', docRef:'CI-MSD-2023-0143' },
  { id:'vc10', vessel:'v1', name:'Anti-Fouling System Certificate',           category:'MARPOL',    issuer:'Bureau Veritas',                   issued:'2023-08-10', expires:'2028-08-10', docRef:'BV-AFC-2023-0577' },
  { id:'vc11', vessel:'v1', name:'International Oil Pollution Prevention',    category:'MARPOL',    issuer:'Bureau Veritas',                   issued:'2023-06-01', expires:'2028-06-01', docRef:'BV-IOPP-2023-0991' },
  { id:'vc12', vessel:'v1', name:'Yacht Classification Certificate',          category:'Class',     issuer:'Bureau Veritas',                   issued:'2023-11-01', expires:'2028-11-01', docRef:'BV-CLASS-2023-7712' },
];

/* ── CREW CERTIFICATES ── */
FM.crewCerts = [
  { id:'cc1',  crewId:'c2', name:'STCW II/2 — Master 3000GT',         category:'STCW',    issuer:'MCA UK',                           issued:'2021-03-10', expires:'2026-06-10', docRef:'MCA-II2-7789' },
  { id:'cc2',  crewId:'c2', name:'ENG1 Medical Certificate',           category:'Medical', issuer:'Approved Medical Examiner',        issued:'2025-01-15', expires:'2027-01-15', docRef:'ENG1-2025-4412' },
  { id:'cc3',  crewId:'c2', name:'Cayman Islands Endorsement',         category:'Flag',    issuer:'Cayman Islands Shipping Registry', issued:'2021-03-20', expires:'2026-06-20', docRef:'CI-END-2021-0456' },
  { id:'cc4',  crewId:'c2', name:'GMDSS GOC Radio Operator',          category:'STCW',    issuer:'MCA UK',                           issued:'2021-03-10', expires:'2026-06-10', docRef:'MCA-GOC-7790' },
  { id:'cc5',  crewId:'c3', name:'STCW III/2 — Chief Engineer 3000kW',category:'STCW',    issuer:'MCA UK',                           issued:'2022-05-18', expires:'2027-05-18', docRef:'MCA-III2-9912' },
  { id:'cc6',  crewId:'c3', name:'ENG1 Medical Certificate',           category:'Medical', issuer:'Approved Medical Examiner',        issued:'2025-03-10', expires:'2027-03-10', docRef:'ENG1-2025-5503' },
  { id:'cc7',  crewId:'c3', name:'Cayman Islands Endorsement',         category:'Flag',    issuer:'Cayman Islands Shipping Registry', issued:'2022-06-01', expires:'2027-06-01', docRef:'CI-END-2022-0881' },
  { id:'cc8',  crewId:'c4', name:'STCW II/1 — OOW 500GT',            category:'STCW',    issuer:'ANFR France',                      issued:'2023-09-01', expires:'2028-09-01', docRef:'ANFR-II1-2023-3301' },
  { id:'cc9',  crewId:'c4', name:'ENG1 Medical Certificate',           category:'Medical', issuer:'Approved Medical Examiner',        issued:'2024-11-20', expires:'2026-11-20', docRef:'ENG1-2024-7712' },
  { id:'cc10', crewId:'c5', name:'STCW II/1 — OOW 500GT',            category:'STCW',    issuer:'MCA UK',                           issued:'2022-08-14', expires:'2026-08-14', docRef:'MCA-II1-2022-5544' },
  { id:'cc11', crewId:'c5', name:'ENG1 Medical Certificate',           category:'Medical', issuer:'Approved Medical Examiner',        issued:'2025-02-28', expires:'2027-02-28', docRef:'ENG1-2025-4490' },
  { id:'cc12', crewId:'c6', name:'STCW — Ratings Certificate',        category:'STCW',    issuer:'MCA UK',                           issued:'2024-04-10', expires:'2029-04-10', docRef:'MCA-RAT-2024-2210' },
  { id:'cc13', crewId:'c6', name:'ENG1 Medical Certificate',           category:'Medical', issuer:'Approved Medical Examiner',        issued:'2024-04-10', expires:'2026-04-10', docRef:'ENG1-2024-2211' },
  { id:'cc14', crewId:'c7', name:'STCW — Ratings Certificate',        category:'STCW',    issuer:'MCA UK',                           issued:'2023-11-05', expires:'2028-11-05', docRef:'MCA-RAT-2023-9901' },
  { id:'cc15', crewId:'c7', name:'ENG1 Medical Certificate',           category:'Medical', issuer:'Approved Medical Examiner',        issued:'2025-05-01', expires:'2027-05-01', docRef:'ENG1-2025-9902' },
];

/* ── DRILLS ── */
FM.drills = [
  { id:'dr1', vessel:'v1', type:'fire',         date:'2026-04-15', conductor:'c2', crew:['c2','c3','c4','c5','c6','c7'],     duration:25, location:'Engine room scenario — aft bilge',     notes:'All crew mustered at stations within 3 minutes. BA sets checked. Extinguishers deployed correctly. No deficiencies noted.', status:'completed' },
  { id:'dr2', vessel:'v1', type:'abandon-ship', date:'2026-04-01', conductor:'c2', crew:['c2','c3','c4','c5','c6','c7','c8'],duration:40, location:'Aft deck — liferaft stations',         notes:'Full muster completed. EPIRB and SART locations verified by all crew. Liferaft hydrostatic release inspected. Immersion suits checked.', status:'completed' },
  { id:'dr3', vessel:'v1', type:'man-overboard', date:'2026-04-22', conductor:'c2', crew:['c2','c5','c7'],                   duration:18, location:'Underway — St. Barths passage',        notes:'Oscar buoy and dan buoy deployed. Recovery time 4 min 20 sec at 7 knots. Rescue sling deployed successfully.', status:'completed' },
  { id:'dr4', vessel:'v1', type:'oil-spill',    date:'2026-03-18', conductor:'c3', crew:['c3','c5','c7'],                   duration:20, location:'Engine room / aft deck',               notes:'SOPEP locker contents checked. Boom deployment practiced. Oil spill reporting procedure reviewed with crew.', status:'completed' },
  { id:'dr5', vessel:'v1', type:'fire',         date:'2026-05-15', conductor:'c2', crew:[],                                 duration:null, location:'',                                   notes:'', status:'scheduled' },
  { id:'dr6', vessel:'v1', type:'abandon-ship', date:'2026-05-01', conductor:'c2', crew:[],                                 duration:null, location:'',                                   notes:'', status:'scheduled' },
];

/* ── NON-CONFORMANCES ── */
FM.nonConformances = [
  { id:'nc1', vessel:'v1', ref:'NC-2026-001', date:'2026-04-20', type:'near-miss',       title:'Unsecured toolbox in engine room during passage',    description:'Toolbox found unsecured on engine room workbench during swell conditions. Slid approximately 30cm before crew noticed and secured it.',             raisedBy:'c3', assignee:'c2', status:'closed', correctiveAction:'All tools now stowed in dedicated lockable drawers. Daily engine room inspection before departure added to departure checklist.', closedDate:'2026-04-22' },
  { id:'nc2', vessel:'v1', ref:'NC-2026-002', date:'2026-04-28', type:'non-conformance', title:'Fire extinguisher inspection overdue — aft deck',     description:'Aft deck CO2 extinguisher annual inspection sticker shows April 2025. Overdue by one month for annual inspection.',                             raisedBy:'c5', assignee:'c3', status:'open',   correctiveAction:'', closedDate:null },
  { id:'nc3', vessel:'v1', ref:'NC-2026-003', date:'2026-05-01', type:'observation',     title:'Guest safety briefing delayed before departure',      description:'Charter guests boarded during fuelling operations. Safety briefing not completed until 45 minutes after scheduled departure time.',               raisedBy:'c2', assignee:'c4', status:'open',   correctiveAction:'', closedDate:null },
];

/* ── SAFETY MEETINGS ── */
FM.safetyMeetings = [
  { id:'sm1', vessel:'v1', date:'2026-04-28', conductor:'c2', attendees:['c2','c3','c4','c5','c6','c7','c8'], topic:'Charter season preparation & emergency procedure review',  notes:'Reviewed updated muster list. Confirmed guest safety brief procedure: brief must be completed before gangway is lifted. Engine room access protocol during charter reviewed with all HoDs.', duration:35 },
  { id:'sm2', vessel:'v1', date:'2026-04-07', conductor:'c2', attendees:['c2','c3','c4','c5','c7'],          topic:'Near-miss debrief — NC-2026-001 unsecured tools',           notes:'Root cause discussed. Agreed on lockable drawer stowage for all engine room tools. C3 to inspect and sign off before next departure.', duration:20 },
  { id:'sm3', vessel:'v1', date:'2026-03-15', conductor:'c2', attendees:['c2','c3','c4','c5','c6','c7','c8'], topic:'MARPOL compliance & waste management procedures',           notes:'Garbage management plan reviewed. Crew reminded of no-discharge zones for Caribbean waters. SOPEP locker restocked.', duration:25 },
];

/* ── UTILS ── */
FM.getWO = id => FM.workOrders.find(w => w.id === id);
FM.getCrew = id => FM.crew.find(c => c.id === id);
FM.vesselWOs = vid => FM.workOrders.filter(w => w.vessel === vid);
FM.openWOs = vid => FM.vesselWOs(vid).filter(w => w.status !== 'done');

FM.priorityLabel = p => ({ high: 'High', medium: 'Medium', low: 'Low' }[p] || p);
FM.statusLabel   = s => ({ open: 'Open', 'in-progress': 'In progress', done: 'Done', 'on-hold': 'On hold' }[s] || s);
FM.teamLabel     = t => ({ engineering: 'Engineering', deck: 'Deck', interior: 'Interior', charter: 'Charter' }[t] || t);

FM.crewColor = id => { const c = FM.getCrew(id); return c ? c.color : '#9A9A92'; };
FM.crewInitials = id => { const c = FM.getCrew(id); return c ? c.initials : '—'; };
FM.crewName = id => { const c = FM.getCrew(id); return c ? c.name : 'Unassigned'; };

/* ── KNOWLEDGE BASE ── */
FM.kbArticles = [

  /* PROPULSION */
  {
    id:'kb-p1', vessel:'v1', system:'propulsion', title:'Daily Engine Checks',
    summary:'Pre-departure checklist for both main engines before every underway.',
    content:'Run these checks every morning before departure or any planned engine start. Both port and starboard engines follow the same procedure. Allow 5–10 minutes per engine.',
    steps:[
      'Confirm bilge is clear before entering engine room — no standing water.',
      'Check port engine oil level: dipstick should read between MIN and MAX. Top up with Caterpillar DEO-ULS 15W-40 if below halfway.',
      'Check starboard engine oil level in the same way.',
      'Inspect coolant overflow bottle on each engine — should be at COLD FULL mark.',
      'Check raw water strainers: basket should be clear of debris. Clean if more than one-third blocked.',
      'Visually inspect all raw water and coolant hoses for softness, cracking, or weeping at clamps.',
      'Confirm seacocks for engine raw water intakes are fully open (handle parallel to pipe).',
      'Check gearbox oil level (dipstick beside transmission) — both sides.',
      'Confirm throttles are in neutral before attempting to start.',
      'Start engines, confirm raw water flow from exhaust within 20 seconds of start.',
    ],
    notes:[
      'If raw water does not appear at exhaust within 30 seconds, shut down immediately and inspect impeller.',
      'Record hours at each check in the engine log — useful for scheduling 250hr service intervals.',
      'Fresh oil on the bilge floor around the sump is not normal. Log it and investigate before departing.',
    ],
    relatedVendors:[], relatedAssets:[], updatedAt:'2026-03-10', author:'Chief Eng. Santos',
  },
  {
    id:'kb-p2', vessel:'v1', system:'propulsion', title:'Engine Service Intervals',
    summary:'Scheduled maintenance milestones for main engines, gearboxes, and shafts.',
    content:"Lady M's main engines are twin Caterpillar C18 diesels. All service intervals below are based on engine hours shown on the ECM display at the helm, not elapsed calendar time.",
    steps:[],
    notes:[],
    body:[
      { heading:'250-Hour Service', items:['Engine oil and filter change (both engines)', 'Gearbox oil check and top-up', 'Fuel water separators: drain and inspect element', 'Belt tension check on all auxiliary drives', 'Raw water impeller inspection (replace if any vane deformation)'] },
      { heading:'500-Hour Service', items:['All 250hr items', 'Replace raw water impellers (mandatory)', 'Zinc anodes: inspect and replace if more than 50% consumed', 'Coolant sample for analysis', 'Valve clearance check (Cat-certified only)', 'Injector cleaning and spray pattern test'] },
      { heading:'1,000-Hour Service', items:['All 500hr items', 'Full injector replacement', 'Turbocharger inspection', 'Heat exchanger cleaning', 'Flexible engine mounts: inspect for deterioration'] },
      { heading:'Annual (regardless of hours)', items:['Fuel polishing — both day tanks and main tank', 'Shaft seal inspection (lip seal or dripless)', 'Propeller shaft alignment check', 'Cutlass bearing condition check', 'Intercooler cleaning'] },
    ],
    relatedVendors:[], relatedAssets:[], updatedAt:'2026-01-20', author:'Chief Eng. Santos',
  },
  {
    id:'kb-p3', vessel:'v1', system:'propulsion', title:'Overheating Alarm — First Response',
    summary:'What to do if a high-temperature alarm fires on either main engine.',
    content:'A high coolant or exhaust temperature alarm requires immediate action. Do not ignore and hope it clears. Overheating for even a few minutes can cause serious internal damage.',
    steps:[
      'Note which engine (port or starboard) and what parameter (coolant temp, exhaust temp, or raw water flow alarm).',
      'Reduce throttle to idle on the affected engine immediately.',
      'If underway, engage the other engine to maintain steerage.',
      'Check raw water flow at the exhaust: if absent or weak, the impeller has likely failed.',
      'Check raw water strainer basket: if blocked, clear it with engine at idle.',
      'If raw water is flowing normally, check coolant level in the overflow bottle — a sudden drop indicates a hose failure or head gasket issue.',
      'If alarm does not clear within 2 minutes at idle, shut down the engine.',
      'Do not restart until root cause is identified and corrected.',
    ],
    notes:[
      'The most common cause is a failed raw water impeller. Keep two spare impellers per engine in the parts locker.',
      'Impeller replacement takes approximately 20 minutes with the right tool (impeller puller is in the red toolbox).',
      'A blocked raw water strainer is the second most common cause — check this first as it takes 60 seconds to clear.',
    ],
    relatedVendors:[], relatedAssets:[], updatedAt:'2026-02-14', author:'Chief Eng. Santos',
  },

  /* ELECTRICAL */
  {
    id:'kb-e1', vessel:'v1', system:'electrical', title:'Shore Power Connection',
    summary:'Connecting and disconnecting 50A shore power at a marina.',
    content:"Lady M accepts 50A / 240V shore power via the connector on the starboard aft deck. Always follow this sequence to avoid arcing, damage to the inverter/charger, or tripping marina breakers.",
    steps:[
      'At the main panel, set the SHORE POWER selector to OFF.',
      'At the marina pedestal, confirm pedestal breaker is off before handling the cable.',
      'Inspect the shore cord connector and receptacle for damage or corrosion.',
      'Connect shore cord to vessel first, then to marina pedestal.',
      'Turn on the marina pedestal breaker.',
      'On the vessel main panel, turn SHORE POWER selector to ON.',
      'Confirm the green SHORE POWER AVAILABLE light is illuminated on the panel.',
      'Set INVERTER/CHARGER to SHORE mode (Victron Quattro: press MODE until SHORE is shown).',
      'Confirm battery charger has started: check Victron VRM display or Color Control GX.',
    ],
    notes:[
      'If the marina breaker trips immediately, the shore cord or vessel wiring has a fault. Do not reset and retry — investigate.',
      'In tropical marinas (Caribbean), always coil shore cord off the dock to prevent water ingress at the pedestal end.',
      'Disconnection sequence is the reverse: vessel selector OFF, then pedestal breaker OFF, then unplug pedestal, then vessel.',
    ],
    relatedVendors:[], relatedAssets:[], updatedAt:'2026-01-08', author:'Chief Eng. Santos',
  },
  {
    id:'kb-e2', vessel:'v1', system:'electrical', title:'Generator Transfer Procedure',
    summary:'Switching from shore power to generator and back without interruption.',
    content:'Use this procedure when leaving a berth, during power outages, or when shore power quality is poor. The Victron Quattro inverter/charger handles automatic transfer between shore and generator — this procedure is for controlled manual transfer.',
    steps:[
      'Start the generator from the engine room panel or helm station.',
      'Allow generator to warm up at no load for 2 minutes.',
      'Confirm generator voltage and frequency are stable: should read 240V ±5% and 50Hz ±1Hz on the Maretron display.',
      'At the main switchboard, turn the GENERATOR ACB breaker to ON — the transfer will happen automatically via the Victron.',
      'Turn the SHORE POWER selector to OFF.',
      'Confirm all critical loads (AC, fridge, nav electronics) remained on through the transfer.',
    ],
    notes:[
      'Never turn off shore power before starting the generator — there will be a power gap that resets all electronics.',
      'The generator should not be loaded to more than 80% of its rated 50kVA. Shed large loads (electric cooker, watermaker) before transfer if vessel is fully loaded.',
      'To return to shore power: connect shore cord first, confirm availability light, then ACB transfer back, then switch generator to cool-down, then shut down after 3 min.',
    ],
    relatedVendors:[], relatedAssets:[], updatedAt:'2026-01-08', author:'Chief Eng. Santos',
  },

  /* NAVIGATION */
  {
    id:'kb-n1', vessel:'v1', system:'navigation', title:'Passage Planning Checklist',
    summary:'Everything to confirm before departing on any offshore or coastal passage.',
    content:"The captain must complete this checklist and sign the logbook before any passage over 20nm or when overnight sailing is expected.",
    steps:[
      'Download latest weather forecast from PredictWind Pro for route and ETA window.',
      'Check NAVTEX and SafetyNET for any NAVAREA IV notices, TSS advisories, or range activities on route.',
      'Plot waypoints on chart plotter and confirm route clears all hazards with minimum 0.5nm clearance.',
      'Calculate ETA and fuel burn at planned speed — confirm sufficient fuel in tank (minimum 30% reserve at destination).',
      'File a voyage plan with marina or agent at destination and leave copy with shore contact.',
      'Confirm all navigation lights are functioning (run test from helm panel).',
      'Test VHF Ch16 and SSB (if fitted) before departure.',
      'Brief all crew on passage route, expected conditions, watch rotation, and emergency muster points.',
      'Confirm SART and EPIRB are in bracket and hydrostatic release is within service date.',
      'Check radar is operational — run a brief scan before departure.',
    ],
    notes:[
      'Night passages require a mandatory minimum of two qualified crew on watch rotation.',
      'Log departure time, position, and weather conditions in the deck log before leaving harbour.',
      'Caribbean squall season (July–November): be particularly cautious of convective weather between 14:00–18:00 local.',
    ],
    relatedVendors:[], relatedAssets:[], updatedAt:'2026-03-01', author:'Capt. Martinez',
  },
  {
    id:'kb-n2', vessel:'v1', system:'navigation', title:'GMDSS Daily Radio Check',
    summary:'Daily DSC test and radio check required by SOLAS and MCA for Class A vessels.',
    content:'Lady M is equipped with Icom M605 VHF with DSC controller and Icom M802 SSB. GMDSS routine tests must be logged daily while at sea.',
    steps:[
      'Press MENU on Icom M605 → DSC → TEST CALL.',
      'Select DSC DISTRESS TEST (not a real distress call — this is the pink test button sequence).',
      'If in range of a coast station, a test call will confirm DSC is operational. Log the response.',
      'Tune M802 SSB to the appropriate offshore working frequency (4125 kHz Caribbean).',
      'Make a radio check call: "All stations, all stations, this is MY Lady M, MMSI 319123456, radio check, over."',
      'Log result in deck log with time, frequency, and any response received.',
    ],
    notes:[
      'MMSI for Lady M is 319123456. Confirm this is programmed into both the M605 and M802 DSC controllers.',
      'EPIRB registered to Lady M: Jotron Tron 60S, 406MHz, beacon ID ending in 456. Registration must be renewed annually with COSPAS-SARSAT.',
      'Do not accidentally send a real distress call during testing. The pink button on the M605 requires a 3-second hold to initiate — do not hold for more than 1 second during test.',
    ],
    relatedVendors:[], relatedAssets:[], updatedAt:'2025-11-15', author:'Capt. Martinez',
  },

  /* PLUMBING & WATERMAKER */
  {
    id:'kb-w1', vessel:'v1', system:'plumbing', title:'Watermaker Daily Start & Stop',
    summary:'How to run and shut down the Spectra Newport 1000 watermaker for daily freshwater production.',
    content:'The watermaker produces 1,000 litres per hour of fresh water. A typical run produces enough water for one full day of operations in about 90 minutes. Run early morning to avoid peak electrical load.',
    steps:[
      'Open the sea water supply seacock for the watermaker (located starboard forward in the engine room, labeled WMAKER IN).',
      'Check the pre-filter housing — replace cartridge if visually brown or if pressure gauge reads more than 10 PSI drop across it.',
      'Turn the power switch ON at the watermaker control panel.',
      'Set MODE to PRODUCTION and press START.',
      'For the first 3 minutes, fresh water output is diverted to drain (flush cycle) — this is normal.',
      'After flush, open the fresh water line valve to route output to the main tank.',
      'Monitor product water TDS on the display — should read below 500 ppm. Above 1,000 ppm indicates membrane or system issue.',
      'To stop: press STOP on the panel. The unit runs a short flush cycle automatically.',
      'Close the seacock after the system fully stops.',
    ],
    notes:[
      'Never run the watermaker in a marina, harbour, or close to a fuel dock — contaminated intake will damage the membranes.',
      'If the unit has been idle for more than 3 days, run a 15-minute pickle/preservation flush before returning to production mode.',
      'Fresh water tanks on Lady M hold 5,000 litres total across two tanks. Check the tank gauge before and after each run.',
    ],
    relatedVendors:[], relatedAssets:[], updatedAt:'2026-02-28', author:'Chief Eng. Santos',
  },
  {
    id:'kb-w2', vessel:'v1', system:'plumbing', title:'Bilge Pump Testing',
    summary:'Weekly manual test procedure to confirm all bilge pumps are functional.',
    content:'Lady M has six electric bilge pumps: engine room (port and starboard), forward bilge, aft bilge, lazarette, and tender garage. Each should be tested manually once per week and during safety checks.',
    steps:[
      'Locate each bilge pump float switch and bilge control panel (starboard side, engine room entry).',
      'On the panel, turn each zone switch to MAN (manual) — the pump should activate immediately.',
      'Confirm the pump can be heard running and that water is being expelled at the overboard discharge.',
      'Return switch to AUTO after confirming operation.',
      'Check for any unusual sounds (dry running, grinding) that may indicate pump wear.',
      'Inspect bilge for any unusual oily sheen, dark water, or floating debris — log any concerns.',
    ],
    notes:[
      'The engine room bilge pumps are set to auto-activate at 25mm water depth. A manual test does not test float switch function — wiggle the float manually to confirm switch activation.',
      'Oil in the bilge must not be pumped overboard under MARPOL. Collect in the sludge tank and discharge at a certified facility. Log all bilge water disposals.',
    ],
    relatedVendors:[], relatedAssets:[], updatedAt:'2025-12-05', author:'Chief Eng. Santos',
  },

  /* HVAC */
  {
    id:'kb-h1', vessel:'v1', system:'hvac', title:'AC System Startup',
    summary:'Bringing the main chiller and zone units online at the start of the season or after a lay-up.',
    content:'Lady M runs a chilled-water central AC system by Marine Air. There is one main seawater-cooled chiller and individual fan-coil units in each space. This startup procedure is for beginning of season or after more than 2 weeks with system off.',
    steps:[
      'Open the raw water seacock for the chiller (marked HVAC CIRC, aft starboard engine room).',
      'Check the raw water strainer basket for the chiller circuit — clean if necessary.',
      'At the main electrical panel, turn HVAC MAIN breaker to ON.',
      'At the chiller control panel (forward engine room bulkhead), set to AUTO.',
      'Allow the chiller 10 minutes to reach set temperature before turning on zone fan-coil units.',
      'Turn on individual cabin thermostats — set to AUTO, fan MEDIUM, desired temperature.',
      'Check chiller display for any active fault codes after 15 minutes of operation.',
    ],
    notes:[
      'In hot weather (ambient above 35°C), the chiller may struggle to reach set point. This is normal — reduce AC load by closing external hatches and blinds.',
      'Weekly: run all fan-coil units on maximum fan speed for 30 minutes to prevent mould build-up in coil drain trays.',
      'Monthly: check and clean condensate drain lines on each zone unit. Blocked drains cause ceiling water damage.',
    ],
    relatedVendors:[], relatedAssets:[], updatedAt:'2026-04-01', author:'Chief Eng. Santos',
  },

  /* SAFETY */
  {
    id:'kb-s1', vessel:'v1', system:'safety', title:'Emergency Shutdown Procedure',
    summary:'How to safely shut down all main systems in the event of fire, flooding, or vessel emergency.',
    content:"The emergency stop panel is located at the helm station (red panel, starboard side) and at the engine room entry. Know where both are located before every voyage. This procedure is for 'abandon or fight' scenarios where shutting down machinery is required.",
    steps:[
      'Sound the general alarm (helm panel, red ALARM button) before taking any further action.',
      'If fire: activate the appropriate fire suppression system zone at the helm panel.',
      'At the emergency stop panel, press ENGINE ROOM E-STOP to shut down both main engines simultaneously.',
      'Shut down the generator using the generator E-STOP button on the same panel.',
      'Turn the MAIN AC PANEL breaker to OFF to isolate AC distribution.',
      'Close the fuel supply valves at the day tanks — port and starboard, engine room aft bulkhead.',
      'Close all sea cocks if flooding: forward bilge, engine room intakes, AC chiller intake.',
      'Confirm EPIRB and SART are removed from bracket and ready to deploy if abandoning vessel.',
    ],
    notes:[
      'Shutting down both engines removes all propulsion and steering. Only do this if the risk from continuing to run the engines exceeds the risk of loss of control.',
      'The Halon/FM-200 engine room suppression system activates automatically via heat detector. Manual activation switch is at the helm. Do not enter the engine room for 15 minutes after system discharge.',
    ],
    relatedVendors:[], relatedAssets:[], updatedAt:'2026-03-22', author:'Capt. Martinez',
  },
  {
    id:'kb-s2', vessel:'v1', system:'safety', title:'Fire Extinguisher Locations',
    summary:'Where each extinguisher is located, what type it is, and when it was last serviced.',
    content:'Lady M carries 14 portable fire extinguishers across all zones, plus fixed suppression in the engine room and generator space. All portable units require annual inspection — check the service tag on each one.',
    steps:[],
    notes:[],
    body:[
      { heading:'Engine Room (4 units)', items:['2x CO2 5kg — forward and aft bulkhead', '2x Dry Powder 9kg — engine room entry, starboard'] },
      { heading:'Accommodation (6 units)', items:['Galley: 1x CO2 2kg wet chemical (next to range)', 'Master stateroom: 1x CO2 2kg (bedside cabinet)', 'VIP stateroom: 1x CO2 2kg', 'Guest staterooms 1 & 2: 1x CO2 2kg each', 'Main saloon: 1x CO2 2kg (forward port corner)'] },
      { heading:'Deck (4 units)', items:['Helm station: 1x CO2 2kg (port helm seat)', 'Foredeck: 1x Dry Powder 9kg (forward anchor locker)', 'Tender garage: 1x Dry Powder 9kg (entry)', 'Aft deck: 1x CO2 2kg (aft deck cabinet)'] },
    ],
    relatedVendors:[], relatedAssets:[], updatedAt:'2026-04-01', author:'Capt. Martinez',
  },
  {
    id:'kb-s3', vessel:'v1', system:'safety', title:'Life Raft & EPIRB Locations',
    summary:'Where safety equipment is stowed, hydrostatic release service dates, and deployment instructions.',
    content:'All safety equipment positions are marked on the vessel emergency plan posted in each cabin. Crew must be briefed on locations during pre-departure safety brief.',
    steps:[
      'Life raft: stowed on the flybridge deck, port side, in white fibreglass canister. Hydrostatic release (Hammar H20) service due October 2026.',
      'EPIRB: mounted in white bracket at helm station, starboard side. Jotron Tron 60S. Battery replacement due January 2027. Annual registration renewal via COSPAS-SARSAT.',
      'SART (Search and Rescue Transponder): stowed in grab bag, helm station locker.',
      'Grab bag: waterproof red bag in helm station locker. Contains flares (check expiry annually), SART, personal PLBs (4x), first aid basics, ship papers copies.',
      'Immersion suits: 8 suits total, stowed in deck locker forward of helm. One per crew member — confirm correct size labels.',
      'Lifebuoys: 2x ring buoys with dan buoy and drogue, one each side of helm station.',
    ],
    notes:[
      'To deploy life raft: remove lashing, throw canister into water, pull activation line firmly — canister will inflate automatically.',
      'Hydrostatic release activates at 2–4 metres depth if vessel sinks without raft being deployed manually.',
      'Test personal PLBs monthly by confirming green LED indicator is flashing (self-test mode, no transmission).',
    ],
    relatedVendors:[], relatedAssets:[], updatedAt:'2026-03-22', author:'Capt. Martinez',
  },

  /* DECK */
  {
    id:'kb-d1', vessel:'v1', system:'deck', title:'Anchoring Procedure',
    summary:"How to anchor Lady M safely, select scope, and confirm the anchor is holding.",
    content:'Lady M has a 60kg Bruce anchor with 80m of 16mm short-link chain. The anchor windlass is electric, controlled from the foredeck panel. Always appoint a dedicated crew member to the bow for the full anchoring sequence.',
    steps:[
      'Select an anchorage that provides shelter from the forecast wind direction and has swinging room of at least 3x your scope (typically 150–200m radius).',
      'Approach the anchorage bow-to-wind at dead slow. Aim to stop the vessel with zero forward way.',
      'Confirm the depth on the chart plotter sounder — add 2m for tidal range if applicable.',
      'Calculate scope: minimum 5:1 depth-to-chain ratio in settled conditions, 7:1 or more in strong winds. E.g. 8m depth = minimum 40m chain.',
      'Lower the anchor to the bottom using the windlass DOWN button. Do not drop freely — lower under control.',
      'Once anchor is on the bottom, pay out chain at idle reverse. Keep tension light as chain is deployed.',
      'When target scope is deployed, apply moderate reverse to set the anchor. Increase to full reverse briefly to test hold.',
      'Take two-bearing or GPS anchor watch position. Log position in deck log.',
      'Set anchor watch alarm on chart plotter (circle radius 20m).',
    ],
    notes:[
      'In areas with poor holding (weed, rock), consider two shots of chain and a bridle setup.',
      'Never anchor closer than 30m to another vessel without agreeing with the other skipper first.',
      'In squall conditions, let out extra chain to increase holding power — additional chain weight adds catenary.',
    ],
    relatedVendors:[], relatedAssets:[], updatedAt:'2026-02-01', author:'Capt. Martinez',
  },
  {
    id:'kb-d2', vessel:'v1', system:'deck', title:'Tender Launch & Recovery',
    summary:'Safe procedure for launching and recovering the yacht tender using the aft crane.',
    content:'Lady M carries a Williams TurboJet 505 tender and a Seabob F5S watertoy. The tender is stored in the aft garage and launched by the hydraulic transom platform and crane davit. Two crew minimum for all tender operations.',
    steps:[
      'Confirm tender fuel tank is full and safety lanyard is attached to helm.',
      'Open transom garage door using switch at aft deck control panel.',
      'One crew member stands by in the garage to guide the tender out; one operates the crane control pendant.',
      'Attach crane hook to bow lifting eye. Confirm pin is locked.',
      'Lower tender to water slowly. Crew in garage holds bow line to prevent swinging.',
      'When tender touches water, disconnect crane hook and attach bow line to cleat.',
      'Start tender engine at the aft platform. Confirm water flow at engine exhaust.',
      'Tender driver boards, confirms controls, and moves clear before passengers embark at the platform.',
      'Recovery is the reverse sequence — ensure tender is fully secured in garage before underway.',
    ],
    notes:[
      'Maximum crane capacity is 800kg. TurboJet 505 is approximately 480kg wet — well within limit.',
      'Never operate the crane in conditions above 25 knots wind or 1.5m swell.',
      'After saltwater use, flush tender engine with fresh water and rinse all exterior surfaces.',
    ],
    relatedVendors:[], relatedAssets:[], updatedAt:'2026-01-15', author:'Capt. Martinez',
  },

  /* AV & IT */
  {
    id:'kb-av1', vessel:'v1', system:'avit', title:'Starlink & Guest Wi-Fi',
    summary:"How Lady M's Starlink satellite internet works and how to set up the guest network.",
    content:'Lady M uses a Starlink Maritime terminal on the flybridge. Internet is distributed via a Peplink Balance 20X router with a dedicated crew network and a guest network. The system requires clear sky view — range of obstruction more than 30° above horizon will cause dropouts.',
    steps:[
      'Starlink powers on automatically when the main electrical panel is on. Allow 5 minutes for the dish to align and acquire signal.',
      'Confirm Starlink status on the Peplink router admin page (192.168.1.1 on crew network, password in captain logbook).',
      'Guest Wi-Fi SSID is "LadyM-Guest" — password is posted on the inside of the main saloon credenza door.',
      'To change the guest password: log in to Peplink admin → Wi-Fi → LadyM-Guest → edit passphrase.',
      'If internet is down, check Starlink app (iOS/Android) for outage status. A yellow status means obstructed — adjust vessel heading or wait for clear sky.',
    ],
    notes:[
      'Crew network is "LadyM-Crew" — do not share this password with charter guests. It provides access to vessel admin and Victron monitoring.',
      'Data usage during a typical charter week is 50–200GB. If guests are heavy streamers, the connection may throttle during peak hours.',
      'Starlink Maritime does not work while underway in some regions. If internet drops on passage, this is normal and expected until the vessel exits the restricted zone.',
    ],
    relatedVendors:[], relatedAssets:[], updatedAt:'2026-02-20', author:'Chief Eng. Santos',
  },
];
