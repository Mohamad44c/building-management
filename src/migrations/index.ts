import * as migration_20260929_102525_baseline from './20260929_102525_baseline';

export const migrations = [
  {
    up: migration_20260929_102525_baseline.up,
    down: migration_20260929_102525_baseline.down,
    name: '20260929_102525_baseline'
  },
];
