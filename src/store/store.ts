import { create } from 'zustand';
import { filesystem, Interaction, Shell } from '@/types';
import { produce } from 'immer';

interface TerminalState {
  shell: Shell;
  history: Interaction[];
  appendToHistory: (interaction: Interaction) => void;
  updateShellState: (newShell: Shell) => void;
}

export const useStore = create<TerminalState>((set) => ({
  shell: {
    fs: filesystem,
    cwd: "/"
  },
  history: [],

  appendToHistory: (interaction: Interaction) => set(
    produce((state: TerminalState) => {
      state.history.push(interaction);
    })
  ),

  updateShellState: (newShell: Shell) => set(
    produce((state: TerminalState) => {
      state.shell = newShell;
    })
  )
}));
