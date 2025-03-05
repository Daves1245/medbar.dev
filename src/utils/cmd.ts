import { CmdFunc } from '@/types';
import { cmdRegistry } from '@/cmdRegistry';

export const parseCmd = (cmdLine: string): { command: string; args: string[] } => {
  const tokens = cmdLine.trim().split(/\s+/);
  const command = tokens[0] || '';
  const args = tokens.slice(1);
  return { command, args };
};

export const runCmd: CmdFunc = (cmd, args, shellState) => {
  if (cmdRegistry[cmd] === undefined) {
    return {
      status: 'error',
      message: `${cmd}: command not found`
    }
  }

  return cmdRegistry[cmd](cmd, args, shellState);
}
