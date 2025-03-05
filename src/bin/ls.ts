import { CmdFunc, CmdResponse, FileSystemNode } from '@/types';

const ls: CmdFunc = (cmd, args, shellState): CmdResponse => {
  let currentNode: FileSystemNode = shellState.fs.root;

  const pathSegments = shellState.cwd.split('/').filter(segment => segment);

  for (const segment of pathSegments) {
    if (currentNode[segment] && typeof currentNode[segment] !== 'string') {
      currentNode = currentNode[segment] as FileSystemNode;
    } else {
      return {
        status: 'error',
        message: `Cannot access directory (should not be possibel): ${shellState.cwd}`
      };
    }
  }

  const output = Object.keys(currentNode);

  return {
    status: 'success',
    shellState,
    output: output.join('  ')
  };
};

export default ls;
