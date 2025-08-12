"use client";

import { useState, useEffect, useCallback } from "react";
import { PageElement } from "./PageBuilder1";

export interface HistoryState {
  elements: PageElement[];
  timestamp: number;
  description?: string;
}

export class HistoryManager {
  private history: HistoryState[] = [];
  private currentIndex: number = -1;
  private maxHistory: number = 50;
  private listeners: Set<(state: HistoryState) => void> = new Set();

  constructor(initialElements: PageElement[] = []) {
    // Initialize with the initial state
    try {
      this.history.push({
        elements: JSON.parse(JSON.stringify(initialElements)),
        timestamp: Date.now(),
        description: "Initial state",
      });
      this.currentIndex = 0;
    } catch (error) {
      console.error("Error initializing history manager:", error);
      // Push empty state if cloning fails
      this.history.push({
        elements: [],
        timestamp: Date.now(),
        description: "Initial state (fallback)",
      });
      this.currentIndex = 0;
    }
  }

  // Add a new state to history
  push(elements: PageElement[], description?: string): void {
    // Remove any states after current index (for when we undo and then make new changes)
    this.history = this.history.slice(0, this.currentIndex + 1);

    try {
      // Add new state
      const newState: HistoryState = {
        elements: JSON.parse(JSON.stringify(elements)),
        timestamp: Date.now(),
        description,
      };

      this.history.push(newState);
      this.currentIndex = this.history.length - 1;

      // Limit history size
      if (this.history.length > this.maxHistory) {
        this.history.shift();
        this.currentIndex--;
      }

      // Notify listeners
      this.notifyListeners(newState);
    } catch (error) {
      console.error("Error pushing to history:", error);
    }
  }

  // Undo to previous state
  undo(): HistoryState | null {
    if (this.currentIndex > 0) {
      this.currentIndex--;
      const state = this.history[this.currentIndex];
      this.notifyListeners(state);
      return state;
    }
    return null;
  }

  // Redo to next state
  redo(): HistoryState | null {
    if (this.currentIndex < this.history.length - 1) {
      this.currentIndex++;
      const state = this.history[this.currentIndex];
      this.notifyListeners(state);
      return state;
    }
    return null;
  }

  // Get current state
  getCurrentState(): HistoryState {
    return this.history[this.currentIndex];
  }

  // Get current elements
  getCurrentElements(): PageElement[] {
    try {
      return JSON.parse(JSON.stringify(this.getCurrentState().elements));
    } catch (error) {
      console.error("Error getting current elements from history:", error);
      return [];
    }
  }

  // Check if undo is available
  canUndo(): boolean {
    return this.currentIndex > 0;
  }

  // Check if redo is available
  canRedo(): boolean {
    return this.currentIndex < this.history.length - 1;
  }

  // Get history description for display
  getUndoDescription(): string {
    if (this.canUndo()) {
      return this.history[this.currentIndex - 1]?.description || "Undo";
    }
    return "Undo";
  }

  getRedoDescription(): string {
    if (this.canRedo()) {
      return this.history[this.currentIndex + 1]?.description || "Redo";
    }
    return "Redo";
  }

  // Subscribe to history changes
  subscribe(listener: (state: HistoryState) => void): () => void {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  // Notify all listeners of state changes
  private notifyListeners(state: HistoryState): void {
    this.listeners.forEach((listener) => {
      try {
        listener(state);
      } catch (error) {
        console.error("Error in history listener:", error);
      }
    });
  }

  // Clear history
  clear(): void {
    const currentState = this.getCurrentState();
    this.history = [currentState];
    this.currentIndex = 0;
    this.notifyListeners(currentState);
  }

  // Get history size
  getHistorySize(): number {
    return this.history.length;
  }

  // Get current position in history
  getCurrentPosition(): number {
    return this.currentIndex;
  }

  // Get full history for debugging
  getFullHistory(): HistoryState[] {
    return this.history.map((state) => ({
      ...state,
      elements: [], // Don't return actual elements for privacy
    }));
  }
}

// React hook for using history manager
export function useHistoryManager(initialElements: PageElement[] = []) {
  const [historyManager] = useState(() => new HistoryManager(initialElements));
  const [canUndo, setCanUndo] = useState(false);
  const [canRedo, setCanRedo] = useState(false);

  useEffect(() => {
    const unsubscribe = historyManager.subscribe(() => {
      setCanUndo(historyManager.canUndo());
      setCanRedo(historyManager.canRedo());
    });

    // Set initial state
    setCanUndo(historyManager.canUndo());
    setCanRedo(historyManager.canRedo());

    return unsubscribe;
  }, [historyManager]);

  const undo = useCallback(() => {
    return historyManager.undo();
  }, [historyManager]);

  const redo = useCallback(() => {
    return historyManager.redo();
  }, [historyManager]);

  const push = useCallback(
    (elements: PageElement[], description?: string) => {
      historyManager.push(elements, description);
    },
    [historyManager]
  );

  const getCurrentElements = useCallback(() => {
    return historyManager.getCurrentElements();
  }, [historyManager]);

  return {
    undo,
    redo,
    push,
    getCurrentElements,
    canUndo,
    canRedo,
    getUndoDescription: () => historyManager.getUndoDescription(),
    getRedoDescription: () => historyManager.getRedoDescription(),
    clear: () => historyManager.clear(),
    getHistorySize: () => historyManager.getHistorySize(),
    getCurrentPosition: () => historyManager.getCurrentPosition(),
  };
}

// Hook for keyboard shortcuts
export function useKeyboardShortcuts(
  onUndo: () => void,
  onRedo: () => void,
  onSave?: () => void
) {
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Check for Ctrl+Z (Undo) or Cmd+Z (Mac)
      if (
        (event.ctrlKey || event.metaKey) &&
        event.key === "z" &&
        !event.shiftKey
      ) {
        event.preventDefault();
        onUndo();
      }

      // Check for Ctrl+Shift+Z (Redo) or Ctrl+Y (Redo) or Cmd+Shift+Z (Mac)
      if (
        (event.ctrlKey || event.metaKey) &&
        ((event.key === "z" && event.shiftKey) || event.key === "y")
      ) {
        event.preventDefault();
        onRedo();
      }

      // Check for Ctrl+S (Save) or Cmd+S (Mac)
      if ((event.ctrlKey || event.metaKey) && event.key === "s" && onSave) {
        event.preventDefault();
        onSave();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [onUndo, onRedo, onSave]);
}
