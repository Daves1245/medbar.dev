"use client";

import React, { useCallback, useEffect, useRef } from 'react';
import { useStore } from '@/store/store';
import { parseCmd, runCmd } from '@/utils/cmd';
import type { Terminal as TerminalType } from 'xterm';
import type { FitAddon as FitAddonType } from 'xterm-addon-fit';

const TerminalComponent = () => {
  const terminalRef = useRef<HTMLDivElement>(null);
  const xterm = useRef<TerminalType | null>(null);
  const fitAddon = useRef<FitAddonType | null>(null);

  const { shell, updateShellState, appendToHistory } = useStore();

  const displayPrompt = useCallback(() => {
    if (!xterm.current) return;
    xterm.current.write(`\x1b[1;32m${shell.cwd}\x1b[0m \x1b[1;37m$\x1b[0m `);
  }, [shell.cwd, xterm]);

  const handleCommand = useCallback((commandLine: string) => {
    if (!xterm.current) return;

    const { command, args } = parseCmd(commandLine);
    const result = runCmd(command, args, shell);

    if (result.status === 'success') {
      if (commandLine === 'clear') {
        xterm.current.clear();
      } else if (result.output) {
        xterm.current.write(result.output + '\r\n');
      }
      updateShellState(result.shellState);
    } else {
      xterm.current.write(`\x1b[1;31m${result.message}\x1b[0m\r\n`);
    }

    appendToHistory({
      cmd: commandLine,
      output: result.status === 'success' ? result.output : result.message
    });

    displayPrompt();
  }, [shell, updateShellState, appendToHistory, displayPrompt]);

  // Initialize terminal only on client
  useEffect(() => {
    const initializeTerminal = async () => {
      try {
        // Dynamically import browser modules
        const { Terminal } = await import('xterm');
        const { FitAddon } = await import('xterm-addon-fit');
        const { WebLinksAddon } = await import('xterm-addon-web-links');

        // Add xterm CSS to the document head instead of importing the CSS module
        const linkElement = document.createElement('link');
        linkElement.rel = 'stylesheet';
        linkElement.href = 'https://cdn.jsdelivr.net/npm/xterm@5.1.0/css/xterm.css';
        document.head.appendChild(linkElement);

        // Create terminal instance
        fitAddon.current = new FitAddon();
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

        if (!terminalRef.current) return;

        // Setup terminal
        xterm.current.loadAddon(fitAddon.current);
        xterm.current.loadAddon(new WebLinksAddon());
        xterm.current.open(terminalRef.current);

        if (!xterm.current) return;

        xterm.current.writeln('\x1b[1;36m _ __ ___   ___  __| | |__   __ _ _ __        __| | _____   __\x1b[0m');
        xterm.current.writeln('\x1b[1;36m| \'_ ` _ \\ / _ \\/ _` | \'_ \\ / _` | \'__|      / _` |/ _ \\ \\ / /\x1b[0m');
        xterm.current.writeln('\x1b[1;36m| | | | | |  __/ (_| | |_) | (_| | |     _  | (_| |  __/\\ V / \x1b[0m');
        xterm.current.writeln('\x1b[1;36m|_| |_| |_|\\___|\\__,_|_.__/ \\__,_|_|    (_)  \\__,_|\\___| \\_/  \x1b[0m');
        xterm.current.writeln('\r');
        displayPrompt();

        // Handle key input
        xterm.current.onKey(({ key, domEvent }) => {
          if (!xterm.current) return;

          if (domEvent.key === 'Enter') {
            const currentLine = xterm.current.buffer.active.getLine(xterm.current.buffer.active.cursorY)?.translateToString();
            const commandText = currentLine?.substring(currentLine.indexOf('$') + 2) || '';
            xterm.current.write('\r\n');

            if (commandText.trim()) {
              handleCommand(commandText.trim());
            } else {
              displayPrompt();
            }
          } else if (domEvent.key === 'Backspace') {
            const promptLength = shell.cwd.length + 4;

            if (xterm.current.buffer.active.cursorX > promptLength) {
              xterm.current.write('\b \b');
            }
          } else {
            xterm.current.write(key);
          }
        });

        // Handle resize
        const handleResize = () => fitAddon.current?.fit();
        window.addEventListener('resize', handleResize);
        handleResize();

        return () => {
          window.removeEventListener('resize', handleResize);
          xterm.current?.dispose();
        };
      } catch (error) {
        console.error("Terminal initialization error:", error);
      }
    };

    initializeTerminal();
  }, [displayPrompt, handleCommand, shell.cwd.length]);

  return (
    <div className="h-screen w-full flex flex-col bg-black">
      <div className="w-full h-full flex flex-col overflow-hidden border border-gray-700 shadow-lg">
        <div className="bg-gray-900 px-4 py-2 flex items-center border-b border-gray-700">
          <div className="flex space-x-2">
            <div className="w-3 h-3 rounded-full bg-red-500"></div>
            <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
            <div className="w-3 h-3 rounded-full bg-green-500"></div>
          </div>
          <div className="ml-4 text-gray-300 text-sm font-mono">Terminal - {shell.cwd}</div>
        </div>
        <div className="flex-1 w-full bg-black">
          <div ref={terminalRef} className="h-full w-full" />
        </div>
      </div>
    </div>
  );
};

export default TerminalComponent;
