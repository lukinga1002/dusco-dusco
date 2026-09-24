import React from "react";
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog";

export default function BahashaDialog({ title, description, busy, onClose, children }) {
  return <Dialog open onOpenChange={(open) => { if (!open && !busy) onClose(); }}>
    <DialogContent className="max-h-[90dvh] w-[calc(100%_-_2rem)] overflow-y-auto rounded-2xl" onInteractOutside={(event) => { if (busy) event.preventDefault(); }}>
      <DialogTitle className="pr-5 font-display text-xl">{title}</DialogTitle>
      <DialogDescription>{description}</DialogDescription>
      {children}
    </DialogContent>
  </Dialog>;
}