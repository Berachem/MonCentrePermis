import React from "react";
import { Dialog } from "primereact/dialog";
import { Button } from "primereact/button";

interface ConfirmationDialogProps {
  visible: boolean;
  onHide: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  confirmIcon?: string;
  severity?: "danger" | "warning" | "info" | "success";
}

const ConfirmationDialog: React.FC<ConfirmationDialogProps> = ({
  visible,
  onHide,
  onConfirm,
  title,
  message,
  confirmLabel = "Confirmer",
  cancelLabel = "Annuler",
  confirmIcon = "pi pi-check",
  severity = "danger",
}) => {
  const footer = (
    <div className="flex justify-end gap-2 mt-4">
      <Button
        label={cancelLabel}
        icon="pi pi-times"
        onClick={onHide}
        className="bg-white text-gray-600 border border-gray-300 hover:bg-gray-100 px-4 py-2 rounded-lg"
      />
      <Button
        label={confirmLabel}
        icon={confirmIcon}
        onClick={() => {
          onConfirm();
          onHide();
        }}
        className="bg-green-600 hover:bg-green-700 text-white border-0 px-4 py-2 rounded-lg"
        autoFocus
      />
    </div>
  );

  return (
    <Dialog
      header={<div className="text-green-800 font-medium text-xl">{title}</div>}
      visible={visible}
      onHide={onHide}
      footer={footer}
      closable
      className="rounded-xl shadow-lg border border-green-100 overflow-hidden max-w-md w-full mx-auto p-3 bg-white"
      modal
      closeOnEscape
    >
      <div className="flex items-center p-4 bg-green-50 rounded-lg mt-2">
        <i
          className={`${severity === "danger" ? "pi pi-exclamation-circle text-red-500" : "pi pi-exclamation-triangle text-amber-500"} text-4xl mr-4`}
        />
        <span className="font-medium text-gray-700">{message}</span>
      </div>
    </Dialog>
  );
};

export default ConfirmationDialog;
