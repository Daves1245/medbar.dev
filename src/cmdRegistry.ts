import cd from '@/bin/cd';
import clear from '@/bin/clear';

// Export all available commands
export const commands = {
  cd,
  clear
};

// Export individual commands for direct import
export { default as cd } from '@/bin/cd';
export { default as clear } from '@/bin/clear';
