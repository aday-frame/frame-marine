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
      { id: 'cost-ch1-1', category: 'Fuel',          desc: 'Pre-charter fill — Gustavia',            amount: 4200, date: '2026-05-04', notes: '' },
      { id: 'cost-ch1-2', category: 'Provisioning',  desc: 'Day family provisions — Palate Foods',  amount: 8400, date: '2026-05-03', notes: '' },
      { id: 'cost-ch1-3', category: 'Port / marina', desc: 'Gustavia harbour fees',                 amount: 1200, date: '2026-05-05', notes: '' },
      { id: 'cost-ch1-4', category: 'Broker',        desc: 'Burgess commission 15%',               amount: 27750, date: '2026-05-05', notes: 'Invoiced on charter fee' },
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
      { id: 'cost-ch3-1', category: 'Fuel',          desc: 'Palma Marina fill-up',                  amount: 6800, date: '2026-01-14', notes: '' },
      { id: 'cost-ch3-2', category: 'Provisioning',  desc: 'Charter provisions',                    amount: 9200, date: '2026-01-13', notes: '' },
      { id: 'cost-ch3-3', category: 'Port / marina', desc: 'Palma, Portofino, Portopino fees',      amount: 3400, date: '2026-01-14', notes: '' },
      { id: 'cost-ch3-4', category: 'Broker',        desc: 'Northrop & Johnson commission 15%',    amount: 31500, date: '2026-01-14', notes: '' },
      { id: 'cost-ch3-5', category: 'Crew',          desc: 'Crew gratuity advance',                 amount: 4000, date: '2026-01-21', notes: 'From APA' },
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
    color: '#60A5FA', reg: 'KYA-TDR-001',
    notes: 'Primary guest tender. Equipped with VHF, nav lights, fire extinguisher, 6× life jackets.',
  },
  {
    id: 'f2', vessel: 'v1', name: 'Shadow', type: 'Tender', make: 'Williams', model: 'Turbojet 485', year: 2023,
    loa: '4.85m', beam: '1.9m', engine: 'Yanmar 4JH57 57hp', fuel: 'diesel',
    hours: 234, fuelPct: 92, status: 'davits',
    lastService: '2026-03-15', nextServiceHours: 450,
    color: '#4ADE80', reg: 'KYA-TDR-002',
    notes: 'Crew and provisions tender. Stored on aft davits. Monthly impeller check required.',
  },
  {
    id: 'f3', vessel: 'v1', name: 'Jet Ski 1', type: 'PWC', make: 'Sea-Doo', model: 'GTX 230', year: 2022,
    loa: '3.4m', beam: '1.2m', engine: 'Rotax 1630 ACE 230hp', fuel: 'petrol',
    hours: 312, fuelPct: 70, status: 'swim-platform',
    lastService: '2026-01-20', nextServiceHours: 400,
    color: '#FACC15', reg: 'KYA-PWC-001',
    notes: 'Guest use only. Helmet stored in starboard watersports locker. Max 2 riders.',
  },
  {
    id: 'f4', vessel: 'v1', name: 'Jet Ski 2', type: 'PWC', make: 'Sea-Doo', model: 'GTX 230', year: 2022,
    loa: '3.4m', beam: '1.2m', engine: 'Rotax 1630 ACE 230hp', fuel: 'petrol',
    hours: 298, fuelPct: 65, status: 'swim-platform',
    lastService: '2026-01-20', nextServiceHours: 400,
    color: '#F97316', reg: 'KYA-PWC-002',
    notes: 'Guest use only. Inspect hull and wear ring every 50 hours.',
  },
  {
    id: 'f5', vessel: 'v1', name: 'Seabob 1', type: 'Seabob', make: 'Seabob', model: 'F5 SR', year: 2023,
    loa: '1.6m', beam: '0.5m', engine: 'Electric motor 10kW', fuel: 'electric',
    hours: 88, fuelPct: 100, status: 'charged',
    lastService: '2026-02-01', nextServiceHours: 200,
    color: '#A78BFA', reg: null,
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
