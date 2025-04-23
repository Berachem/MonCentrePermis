import React, { useEffect, useState } from "react";
import { Dialog } from "primereact/dialog";
import { Button } from "primereact/button";
import { ListBox } from "primereact/listbox";
import { getRequest, postRequest } from "../../interfaces/utils/api";
import { Toast } from "primereact/toast";
import { Divider } from "primereact/divider";

interface Circuit {
  id: number;
  libelle: string;
}

interface CircuitLinkerProps {
  visible: boolean;
  moniteurId: string;
  coursId: string;
  onHide: () => void;
  onCreateNew: () => void;
  onLinked: () => void;
}

const CircuitLinker: React.FC<CircuitLinkerProps> = ({
  visible,
  moniteurId,
  coursId,
  onHide,
  onCreateNew,
  onLinked,
}) => {
  const [circuits, setCircuits] = useState<Circuit[]>([]);
  const [selected, setSelected] = useState<Circuit | null>(null);
  const [loading, setLoading] = useState(false);
  const toast = React.useRef<Toast>(null);

  useEffect(() => {
    if (visible) {
      setLoading(true);
      console.log(
        "Chargement des circuits pour le moniteur :",
        moniteurId,
        "..."
      );
      getRequest<Circuit[]>(`/circuits/bymoniteurs/${moniteurId}`)
        .then(setCircuits)
        .catch(() =>
          toast.current?.show({
            severity: "error",
            summary: "Erreur",
            detail: "Chargement circuits",
          })
        )
        .finally(() => setLoading(false));
      console.log(
        "Circuits chargés pour le moniteur :",
        moniteurId,
        ":",
        circuits
      );
    }
  }, [visible, moniteurId]);

  const linkCircuit = async () => {
    if (!selected) return;
    try {
      // Utiliser la nouvelle route personnalisée
      await postRequest("/circuits/link-circuit-cours", {
        circuit: selected.id,
        cours: coursId,
      });
      toast.current?.show({ severity: "success", summary: "Lien créé" });
      onLinked();
      onHide();
    } catch (error) {
      console.error("Erreur lors de la liaison:", error);
      toast.current?.show({
        severity: "error",
        summary: "Échec du lien",
        detail: "Impossible de lier le circuit au cours.",
      });
    }
  };

  return (
    <Dialog
      header="Lier ou créer un circuit"
      visible={visible}
      onHide={onHide}
      modal
    >
      <Toast ref={toast} />
      <div className="p-fluid">
        <h4>Choisir un circuit existant :</h4>
        <ListBox
          options={circuits}
          optionLabel="libelle"
          value={selected}
          onChange={(e) => setSelected(e.value)}
          filter
          loading={loading}
        />
        <div className="p-d-flex p-jc-between p-mt-3">
          <Button
            label="Lier le circuit"
            disabled={!selected}
            onClick={linkCircuit}
            className="p-button-success"
            icon="pi pi-link"
          />
          <Divider className="p-mx-2" />
          <Button
            label="Créer un nouveau"
            className="p-button-primary"
            icon="pi pi-plus"
            onClick={() => {
              onHide();
              onCreateNew();
            }}
          />
        </div>
      </div>
    </Dialog>
  );
};

export default CircuitLinker;
