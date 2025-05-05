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
  const [linkedCircuits, setLinkedCircuits] = useState<Circuit[]>([]);
  const [selected, setSelected] = useState<Circuit | null>(null);
  const [loading, setLoading] = useState(false);
  const [loadingLinked, setLoadingLinked] = useState(false);
  const toast = React.useRef<Toast>(null);

  // Fetch already linked circuits
  useEffect(() => {
    if (visible && coursId) {
      setLoadingLinked(true);
      getRequest<Circuit[]>(`/circuits/bycours/${coursId}`)
        .then((data) => {
          setLinkedCircuits(data || []);
        })
        .catch((err) => {
          console.error("Erreur lors du chargement des circuits liés:", err);
        })
        .finally(() => setLoadingLinked(false));
    }
  }, [visible, coursId]);

  // Fetch all circuits by the monitor
  useEffect(() => {
    if (visible && moniteurId) {
      setLoading(true);
      setSelected(null);
      console.log("Chargement des circuits pour le moniteur:", moniteurId);

      getRequest<Circuit[]>(`/circuits/bymoniteurs/${moniteurId}`)
        .then((data) => {
          setCircuits(data || []);
        })
        .catch(() => {
          toast.current?.show({
            severity: "error",
            summary: "Erreur",
            detail: "Chargement circuits",
          });
        })
        .finally(() => setLoading(false));
    }
  }, [visible, moniteurId, linkedCircuits]);

  // Filter out already linked circuits
  const availableCircuits = circuits.filter(
    (circuit) => !linkedCircuits.some((linked) => linked.id === circuit.id)
  );

  const linkCircuit = async () => {
    if (!selected) return;
    try {
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

        {loadingLinked || loading ? (
          <div className="flex align-items-center justify-content-center">
            <i
              className="pi pi-spin pi-spinner"
              style={{ fontSize: "2rem" }}
            ></i>
            <span className="ml-2">Chargement des circuits...</span>
          </div>
        ) : availableCircuits.length === 0 ? (
          <div className="p-message p-message-info">
            <div className="p-message-icon">
              <i className="pi pi-info-circle"></i>
            </div>
            <div className="p-message-text">
              Tous vos circuits sont déjà liés à ce cours ou vous n'avez pas
              encore créé de circuits.
            </div>
          </div>
        ) : (
          <ListBox
            options={availableCircuits}
            optionLabel="libelle"
            value={selected}
            onChange={(e) => setSelected(e.value)}
            filter
            emptyMessage="Aucun circuit disponible"
            className="mb-3"
          />
        )}
        <Button
          label="Lier le circuit"
          disabled={!selected}
          onClick={linkCircuit}
          className="p-button-success"
          icon="pi pi-link"
        />
        <Divider />
        <div className="flex justify-content-between mt-3">
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
