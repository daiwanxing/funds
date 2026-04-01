export interface DialogProps {
  /** Dialog panel width variant */
  size?: "sm" | "md" | "lg" | "auto";
  /** Optional title shown in the header */
  title?: string;
  /** Close when clicking the backdrop (default: true) */
  closeOnBackdropClick?: boolean;
  /** Close on ESC key press (default: true) */
  closeOnEsc?: boolean;
  /** Hide the default header (including close button and title) */
  hideHeader?: boolean;
  /** Custom class for the panel */
  panelClass?: string;
}
