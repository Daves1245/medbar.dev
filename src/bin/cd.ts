import { CmdFunc, CmdResponse, Shell, FileSystemNode } from '@/types';
import path from 'path';

const isDirectory = (node: unknown): node is FileSystemNode => {
  return typeof node === 'object' && node !== null && !('redirect_url' in node);
};

// Navigate to a path within the filesystem and return the node
const getNodeAtPath = (fs: Shell['fs'], fullPath: string): FileSystemNode | null => {
  if (fullPath === '/') return fs.root;

  const segments = fullPath.split('/').filter(Boolean);
  let current: FileSystemNode = fs.root;

  for (const segment of segments) {
    if (!isDirectory(current) || !(segment in current)) return null;

    // TypeScript needs this type check to ensure valid access
    const next = current[segment];
    if (!isDirectory(next)) return null;

    current = next;
  }

  return current;
};

const cd: CmdFunc = (cmd, args, shellState): CmdResponse => {
  // Default to home
  let targetPath = args.length === 0 ? '/home' : args[0];

  if (targetPath === '..') {
    const segments = shellState.cwd.split('/').filter(Boolean);
    segments.pop();
    targetPath = segments.length === 0 ? '/' : `/${segments.join('/')}`;
  } else {
    // Resolve relative or absolute path
    targetPath = targetPath.startsWith('/')
      ? path.normalize(targetPath)
      : path.normalize(`${shellState.cwd}/${targetPath}`);
  }

  // Verify the path exists and is a directory
  const node = getNodeAtPath(shellState.fs, targetPath);

  if (!node) {
    return {
      status: 'error',
      message: `cd: ${args[0] || ''}: No such directory`
    };
  }

  return {
    status: 'success',
    shellState: { ...shellState, cwd: targetPath },
    output: ''
  };
};

export default cd;
