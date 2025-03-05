import { CmdFunc } from '@/types';
import cd from '@/bin/cd';
import clear from '@/bin/clear';
import ls from '@/bin/ls';

// map of cmd string -> cmd func
export const cmdRegistry: Record<string, CmdFunc> = {
  'ls': ls,
  'cd': cd,
  'clear': clear,
};

