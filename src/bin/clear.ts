import { CmdFunc, CmdResponse, Shell } from '@/types';

/**
 * Clear terminal command implementation
 */
const clear: CmdFunc = (cmd: string, args: string[], shellState: Shell): CmdResponse => {
  // Clear command doesn't change shell state, just returns success with empty output
  return {
    status: 'success',
    shellState,
    output: ''
  };
};

export default clear;
