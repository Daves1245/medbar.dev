import { CmdFunc, CmdResponse, Shell } from '@/types';
import path from 'path';

/**
 * Validates if a path exists in the virtual filesystem
 */
const pathExists = (fs: Shell['fs'], fullPath: string): boolean => {
  // Skip validation for root
  if (fullPath === '/') return true;

  // Remove trailing slash if present (except for root)
  const cleanPath = fullPath.endsWith('/') && fullPath !== '/'
    ? fullPath.slice(0, -1)
    : fullPath;

  // Split the path into segments
  const segments = cleanPath.split('/').filter(Boolean);

  // Start at root
  let current: any = fs.root;
  //
  // Navigate through each segment
  for (const segment of segments) {
    // If current is not an object or doesn't have the segment, path doesn't exist
    if (typeof current !== 'object' || !(segment in current)) {
      return false;
    }
    current = current[segment];
  }

  // Ensure the destination is a directory (object)
  return typeof current === 'object' && !('redirect_url' in current);
};

/**
 * Resolves a path (absolute or relative) against the current working directory
 */
const resolvePath = (currentPath: string, targetPath: string): string => {
  // If path is absolute, return it directly
  if (targetPath.startsWith('/')) {
    return path.normalize(targetPath);
  }

  // Otherwise, resolve relative to current directory
  return path.normalize(`${currentPath}/${targetPath}`);
};

/**
 * Change directory command implementation
 */
const cd: CmdFunc = (cmd: string, args: string[], shellState: Shell): CmdResponse => {
  // Default to home if no args
  const targetDir = args.length === 0 ? '/home' : args[0];

  // Handle special case for "cd .." (parent directory)
  if (targetDir === '..') {
    const segments = shellState.cwd.split('/').filter(Boolean);
    // Can't go up from root
    if (segments.length === 0) {
      return {
        status: 'success',
        shellState,
        output: ''  // Silently stay at root
      };
    }

    // Remove last segment
    segments.pop();
    const newPath = segments.length === 0 ? '/' : `/${segments.join('/')}`;

    return {
      status: 'success',
      shellState: {
        ...shellState,
        cwd: newPath
      },
      output: ''
    };
  }

  // Resolve the path (handles both absolute and relative paths)
  const resolvedPath = resolvePath(shellState.cwd, targetDir);

  // Check if the path exists
  if (!pathExists(shellState.fs, resolvedPath)) {
    return {
      status: 'error',
      message: `cd: ${targetDir}: No such directory`
    };
  }

  // Path exists, update current working directory
  return {
    status: 'success',
    shellState: {
      ...shellState,
      cwd: resolvedPath
    },
    output: ''
  };
};

export default cd;
