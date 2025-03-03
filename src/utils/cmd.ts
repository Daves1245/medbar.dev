import { filesystem, Shell } from '@/types';

/**
 * Gets a node from the filesystem at a given path
 */
export const getNodeAtPath = (fs: Shell['fs'], path: string): any => {
  if (path === '/') return fs.root;

  const segments = path.split('/').filter(Boolean);
  let current: any = fs.root;

  for (const segment of segments) {
    if (typeof current !== 'object' || !(segment in current)) {
      return null;
    }
    current = current[segment];
  }

  return current;
};

/**
 * Checks if a path represents a directory in the filesystem
 */
export const isDirectory = (node: any): boolean => {
  return node !== null && typeof node === 'object' && !('redirect_url' in node);
};

/**
 * Checks if a path represents a file in the filesystem
 */
export const isFile = (node: any): boolean => {
  return node !== null && typeof node !== 'object';
};

/**
 * Checks if a path represents a redirect in the filesystem
 */
export const isRedirect = (node: any): boolean => {
  return node !== null && typeof node === 'object' && 'redirect_url' in node;
};

/**
 * Lists contents of a directory
 */
export const listDirectory = (dirNode: any): string[] => {
  if (!isDirectory(dirNode)) return [];
  return Object.keys(dirNode);
};

/**
 * Parses a command line into command and arguments
 */
export const parseCommand = (cmdLine: string): { command: string; args: string[] } => {
  const tokens = cmdLine.trim().split(/\s+/);
  const command = tokens[0] || '';
  const args = tokens.slice(1);
  return { command, args };
};
