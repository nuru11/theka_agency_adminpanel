const PACKAGE_STATUSES = [
  'draft',
  'active',
  'ready_for_handoff',
  'sent_to_accountant',
  'accountant_received',
  'settled',
];

const HANDOFF_STATUSES = ['pending', 'received'];

const EXPENSE_CATEGORIES = ['rent', 'salaries', 'other'];

const PROPERTY_TYPES = ['hotel', 'apartment', 'villa', 'house'];

const VEHICLE_TYPES = ['van', 'bus', 'vip'];

const PACKAGE_ITEM_TYPES = ['accommodation', 'transport', 'activity', 'sim'];

const USER_ROLES = ['superAdmin', 'officeAdmin', 'accountant', 'employee'];

module.exports = {
  PACKAGE_STATUSES,
  HANDOFF_STATUSES,
  EXPENSE_CATEGORIES,
  PROPERTY_TYPES,
  VEHICLE_TYPES,
  PACKAGE_ITEM_TYPES,
  USER_ROLES,
};
