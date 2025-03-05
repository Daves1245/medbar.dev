import { CmdFunc, CmdResponse, Shell } from '@/types';

const clear: CmdFunc = (cmd: string, args: string[], shellState: Shell): CmdResponse => {
  return {
    status: 'success',
    shellState,
    output: ''
  };
};

export default clear;
