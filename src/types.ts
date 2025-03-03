export const filesystem = {
  root: {
    home: {
      projects: {
        "README.md": "projects",
        "test": "test project",
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
