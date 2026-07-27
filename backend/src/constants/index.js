const USER_ROLES = ['superAdmin', 'officeAdmin', 'accountant', 'employee'];
const STAFF_ROLES = ['officeAdmin', 'accountant', 'employee'];

const TOURIST_STATUSES = ['expected', 'received', 'departed', 'cancelled'];

const PROPERTY_TYPES = ['hotel', 'apartment', 'villa'];

const MASTER_STATUSES = ['active', 'inactive'];

const VEHICLE_TYPES = ['van', 'bus', 'vip'];

const PACKAGE_STATUSES = [
  'draft',
  'active',
  'ready_for_handoff',
  'sent_to_accountant',
  'accountant_received',
  'settled',
];

const HANDOFF_STATUSES = ['pending', 'received'];

const WALLET_TX_TYPES = ['credit', 'debit'];

const SPENDING_REASONS = ['accommodation', 'park', 'food', 'other'];

module.exports = {
  USER_ROLES,
  STAFF_ROLES,
  TOURIST_STATUSES,
  PROPERTY_TYPES,
  MASTER_STATUSES,
  VEHICLE_TYPES,
  PACKAGE_STATUSES,
  HANDOFF_STATUSES,
  WALLET_TX_TYPES,
  SPENDING_REASONS,
};
