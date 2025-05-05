import React, { useEffect, useState } from "react";
import { Dialog } from "primereact/dialog";
import { Button } from "primereact/button";
import { ListBox } from "primereact/listbox";
import { getRequest, postRequest } from "../../interfaces/utils/api";
import { Toast } from "primereact/toast";
import Loader  from "../utils/Loader";

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
  const [isLinking, setIsLinking] = useState(false);
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
    
    setIsLinking(true);
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
    } finally {
      setIsLinking(false);
    }
  };

  return (
    <Dialog
      header={<div className="text-green-800 font-bold text-xl p-2">Lier ou créer un circuit</div>}
      visible={visible}
      onHide={isLinking ? () => {} : onHide}
      modal
      className=" border border-green-100 shadow-lg max-w-lg w-full mx-auto relative"
      closable={!isLinking}
    >
      <Toast ref={toast} />
      
      {isLinking && (
        <div className="absolute inset-0 bg-gray-50/70 z-10 flex items-center justify-center">
          <Loader />
        </div>
      )}
      
      <div className="p-4">
        <h4 className="text-lg font-semibold text-green-700 mb-3 border-l-4 border-green-500 pl-3">Choisir un circuit existant :</h4>

        {loadingLinked || loading ? (
          <div className="flex items-center justify-center py-6 bg-green-50 rounded-lg">
            <i className="pi pi-spin pi-spinner text-4xl text-green-600"></i>
            <span className="ml-3 text-green-800">Chargement des circuits...</span>
          </div>
        ) : availableCircuits.length === 0 ? (
          <div className="bg-blue-50 text-blue-800 p-4 rounded-lg border-l-4 border-blue-500 mb-4">
            <div className="flex items-start">
              <i className="pi pi-info-circle text-xl text-blue-500 mr-3 mt-0.5"></i>
              <div>
                Tous vos circuits sont déjà liés à ce cours ou vous n'avez pas
                encore créé de circuits.
              </div>
            </div>
          </div>
        ) : (
          <div className="mb-4 border border-green-200 rounded-lg overflow-hidden">
            <style>{`
              .custom-listbox .p-listbox-header .p-listbox-filter {
                height: 3rem !important;
                font-size: 1rem !important;
              }
              
              .custom-listbox .p-listbox-header {
                padding: 0.5rem !important;
              }
            `}</style>
            
            <ListBox
              options={availableCircuits}
              optionLabel="libelle"
              value={selected}
              onChange={(e) => setSelected(e.value)}
              filter
              filterPlaceholder="Rechercher un circuit..."
              emptyMessage="Aucun circuit disponible"
              className="w-full custom-listbox"
              listClassName="py-0"
              itemTemplate={(option) => (
                <div className="p-3 hover:bg-green-50 cursor-pointer border-b border-green-100 last:border-b-0">
                  <div className="flex items-center">
                    <i className="pi pi-map mr-2 text-green-600"></i>
                    <span>{option.libelle}</span>
                  </div>
                </div>
              )}
            />
          </div>
        )}
        
        <Button
          label="Lier le circuit"
          disabled={!selected || isLinking || loading || loadingLinked}
          onClick={linkCircuit}
          className="bg-green-600 hover:bg-green-700 text-white border-0 px-4 py-2 rounded-lg w-full mb-4"
          icon="pi pi-link"
        />
        
        <div className="my-4 border-t border-2 border-gray-300"></div>
        
        <div className="flex justify-between mt-4">
          <Button
            label="Annuler"
            className="bg-white text-gray-600 border border-gray-300 hover:bg-gray-100 px-4 py-2 rounded-lg gap-2"
            icon="pi pi-times"
            onClick={onHide}
            disabled={isLinking}
          />


          <Button
            label="Créer un nouveau"
            className="bg-green-600 hover:bg-green-700 text-white border-0 px-4 py-2 rounded-lg gap-2"
            icon="pi pi-plus"
            onClick={() => {
              onHide();
              onCreateNew();
            }}
            disabled={isLinking}
          />
        </div>
      </div>
    </Dialog>
  );
};

export default CircuitLinker;
