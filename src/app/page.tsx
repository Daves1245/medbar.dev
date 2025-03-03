"use client";

import React, { useEffect, useRef } from 'react';
import { Terminal } from 'xterm';
import { FitAddon } from 'xterm-addon-fit';
import { WebLinksAddon } from 'xterm-addon-web-links';
import 'xterm/css/xterm.css';
import { useStore } from '@/store/store';
import { parseCommand } from '@/utils/cmd';
import { commands } from '@/cmdRegistry';
import { CmdResponse, Shell } from '@/types';

const TerminalComponent = () => {
  // Hold a reference to the containing div in the DOM tree - this is necessary
  // for some third party libraries like xtermjs
  const terminalRef = useRef<HTMLDivElement>(null);
  const xterm = useRef<Terminal | null>(null);
  const fitAddon = useRef<FitAddon | null>(null);

  const { shell, updateShellState, appendToHistory } = useStore();

  const initTerm = () => {
    if (!xterm.current || !terminalRef.current) {
      return;
    }

    if (fitAddon.current) {
      xterm.current.loadAddon(fitAddon.current);
    }

    // Add web links addon for clickable links
    xterm.current.loadAddon(new WebLinksAddon());

    xterm.current.open(terminalRef.current);

    // Initial welcome message
    xterm.current.write('\r\n\x1b[1;34m┌──────────────────────────────────────┐\x1b[0m\r\n');
    xterm.current.write('\x1b[1;34m│\x1b[0m \x1b[1;32mWelcome to the Interactive Terminal\x1b[0m   \x1b[1;34m│\x1b[0m\r\n');
    xterm.current.write('\x1b[1;34m└──────────────────────────────────────┘\x1b[0m\r\n\r\n');

    // Display initial prompt with current directory
    displayPrompt();

    // Handle key input
    xterm.current.onKey(({ key, domEvent }) => {
      if (!xterm.current) {
        return;
      }

      // Handle Enter key
      if (domEvent.key === 'Enter') {
        const currentLine = xterm.current.buffer.active.getLine(xterm.current.buffer.active.cursorY)?.translateToString();
        const commandText = currentLine?.substring(currentLine.indexOf('$') + 2) || '';

        xterm.current.write('\r\n');

        // Process the command
        if (commandText.trim()) {
          handleCommand(commandText.trim());
        } else {
          displayPrompt();
        }
      }

      // Handle Backspace key
      else if (domEvent.key === 'Backspace') {
        const currentLine = xterm.current.buffer.active.getLine(xterm.current.buffer.active.cursorY);
        const promptLength = shell.cwd.length + 4; // Length of "dir $ "

        if (currentLine && xterm.current.buffer.active.cursorX > promptLength) {
          xterm.current.write('\b \b');
        }
      }

      // Handle all other keys
      else {
        xterm.current.write(key);
      }
    });

    // Try to fit the terminal to its container
    if (fitAddon.current) {
      try {
        fitAddon.current.fit();
      } catch (e) {
        console.error('Error fitting terminal:', e);
      }
    }
  }

  const displayPrompt = () => {
    if (!xterm.current) return;

    // Display prompt with current directory in green, $ in white
    xterm.current.write(`\x1b[1;32m${shell.cwd}\x1b[0m \x1b[1;37m$\x1b[0m `);
  }

  const processCommand = (cmdLine: string, shellState: Shell): CmdResponse => {
    const { command, args } = parseCommand(cmdLine);

    // Check if command exists
    if (command in commands) {
      // Use type assertion to tell TypeScript this is safe
      const cmdFunction = commands[command as keyof typeof commands];
      return cmdFunction(command, args, shellState);
    }

    // Command not found
    return {
      status: 'error',
      message: `Command not found: ${command}`
    };
  };

  const handleCommand = (commandLine: string) => {
    if (!xterm.current) return;

    // Process the command using the utility function
    const result = processCommand(commandLine, shell);

    // Handle the result
    if (result.status === 'success') {
      // Special case for clear command
      if (commandLine === 'clear') {
        xterm.current.clear();
      } else if (result.output) {
        // Write the command output to the terminal
        xterm.current.write(result.output + '\r\n');
      }

      // Update the shell state
      updateShellState(result.shellState);
    } else {
      // Write the error message to the terminal
      xterm.current.write(`\x1b[1;31m${result.message}\x1b[0m\r\n`);
    }

    // Store the command in history
    appendToHistory({
      cmd: commandLine,
      output: result.status === 'success' ? result.output : result.message
    });

    // Display the prompt again
    displayPrompt();
  }

  // Handle window resize
  useEffect(() => {
    const handleResize = () => {
      if (fitAddon.current) {
        try {
          fitAddon.current.fit();
        } catch (e) {
          console.error('Error fitting terminal on resize:', e);
        }
      }
    };

    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  useEffect(() => {
    if (terminalRef.current) {
      // Initialize fit addon
      fitAddon.current = new FitAddon();

      // Initialize terminal with enhanced theme
      xterm.current = new Terminal({
        cursorBlink: true,
        fontFamily: 'var(--font-geist-mono), monospace',
        fontSize: 14,
        lineHeight: 1.2,
        fontWeight: 'normal',
        fontWeightBold: 'bold',
        drawBoldTextInBrightColors: true,
        cursorStyle: 'bar',
        cursorWidth: 2,
        theme: {
          background: '#000000',
          foreground: '#f8f8f2',
          cursor: '#f8f8f0',
          cursorAccent: '#000000',
          selectionBackground: 'rgba(255, 255, 255, 0.3)',
          black: '#000000',
          red: '#ff5555',
          green: '#50fa7b',
          yellow: '#f1fa8c',
          blue: '#bd93f9',
          magenta: '#ff79c6',
          cyan: '#8be9fd',
          white: '#bfbfbf',
          brightBlack: '#4d4d4d',
          brightRed: '#ff6e67',
          brightGreen: '#5af78e',
          brightYellow: '#f4f99d',
          brightBlue: '#caa9fa',
          brightMagenta: '#ff92d0',
          brightCyan: '#9aedfe',
          brightWhite: '#e6e6e6',
        },
        allowTransparency: true,
        scrollback: 1000,
        rightClickSelectsWord: true,
      });

      initTerm();
    }

    return () => {
      if (xterm.current) {
        xterm.current.dispose();
      }
    };
  }, []);

  return (
    <div className="h-screen w-full flex flex-col items-center justify-center bg-black p-4">
      <div className="w-full max-w-4xl rounded-lg overflow-hidden border border-gray-700 shadow-lg">
        <div className="bg-gray-900 px-4 py-2 flex items-center border-b border-gray-700">
          <div className="flex space-x-2">
            <div className="w-3 h-3 rounded-full bg-red-500"></div>
            <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
            <div className="w-3 h-3 rounded-full bg-green-500"></div>
          </div>
          <div className="ml-4 text-gray-300 text-sm font-mono">Terminal - {shell.cwd}</div>
        </div>
        <div className="h-96 w-full bg-black">
          <div ref={terminalRef} className="h-full w-full" />
        </div>
      </div>
    </div>
  );
};

export default TerminalComponent;
