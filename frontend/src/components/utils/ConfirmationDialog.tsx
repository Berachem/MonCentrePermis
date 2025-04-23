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
    <>
      <Button
        label={cancelLabel}
        icon="pi pi-times"
        onClick={onHide}
        className="p-button-text"
      />
      <Button
        label={confirmLabel}
        icon={confirmIcon}
        onClick={() => {
          onConfirm();
          onHide();
        }}
        severity={severity}
        autoFocus
      />
    </>
  );

  return (
    <Dialog
      header={title}
      visible={visible}
      onHide={onHide}
      footer={footer}
      closable
      className="p-fluid"
      style={{ width: "450px" }}
      modal
      closeOnEscape
    >
      <div className="confirmation-content">
        <i
          className={`pi pi-exclamation-triangle mr-3 ${
            severity === "danger" ? "text-red-500" : "text-yellow-500"
          }`}
          style={{ fontSize: "2rem" }}
        />
        <span className="font-medium">{message}</span>
      </div>
    </Dialog>
  );
};

export default ConfirmationDialog;
