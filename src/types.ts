export type FileContent = string;

export interface FileSystemNode {
  [key: string]: FileSystemNode | FileContent | RedirectNode;
}

export interface RedirectNode {
  redirect_url: string;
}

export type Directory = FileSystemNode;
export type File = FileContent;

export const filesystem = {
  root: {
    home: {
      projects: {
        "README.md": {
          file_content: "projects"
        },
        "test": {
          file_content: "test project",
        }
      }
    },

    blog: {
      redirect_url: "/blog",
    },
    wiki: {
      redirect_url: "/wiki",
    }
  }
}

export type CmdResponse =
  | { status: 'success'; shellState: Shell; output: string; }
  | { status: 'error'; message: string; }

export type CmdFunc = (cmd: string, args: string[],
  shellState: Shell) => CmdResponse;

export interface Interaction {
  cmd: string;
  output: string;
}

export interface Shell {
  fs: typeof filesystem;
  cwd: string;
}

export default interface Terminal {
  shell: Shell;
  history: Interaction[];
  appendToHistory: (interaction: Interaction) => void;
}
