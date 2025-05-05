import React, { useState, useEffect, useRef, useMemo } from "react";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";
import { InputText } from "primereact/inputtext";
import { Button } from "primereact/button";
import { Dialog } from "primereact/dialog";
import { ProgressSpinner } from "primereact/progressspinner";
import { Toast } from "primereact/toast";
import {
  getRequest,
  postRequest,
} from "../../interfaces/utils/api";
import Loader from "../utils/Loader";

interface EditCourseModalProps {
  visible: boolean;
  onHide: () => void;
  onCourseUpdated: () => void;
  courseId: string | null;
}

const EditCourseModal: React.FC<EditCourseModalProps> = ({
  visible,
  onHide,
  onCourseUpdated,
  courseId,
}) => {
  const [libelle, setLibelle] = useState("");
  const [description, setDescription] = useState("");
  const [_, setOriginalDescription] = useState(""); // Pour suivre les modifications
  const [editorMounted, setEditorMounted] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [recentUploads, setRecentUploads] = useState<
    { url: string; type: string; name: string }[]
  >([]);
  const [isSaving, setIsSaving] = useState(false);
  const quillRef = useRef<ReactQuill>(null);
  const dialogRef = useRef<HTMLDivElement>(null);
  const toastRef = useRef<Toast>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (visible && courseId) {
      setIsLoading(true);
      console.log(`Chargement du cours ${courseId} pour édition...`);

      getRequest<{
        id: string;
        libelle: string;
        description: string;
        updatedAt: string;
      }>(`/moniteurs/course/${courseId}`)
        .then((data) => {
          console.log("Données du cours récupérées:", data);
          setLibelle(data.libelle);
          setDescription(data.description);
          setOriginalDescription(data.description);
          setEditorMounted(true);
        })
        .catch((error) => {
          console.error("Erreur de chargement du cours:", error);
          showToast(
            "error",
            "Erreur",
            "Impossible de charger les informations du cours"
          );
        })
        .finally(() => {
          setIsLoading(false);
        });
    } else {
      // Réinitialiser l'état si le modal est fermé
      setLibelle("");
      setDescription("");
      setEditorMounted(false);
      setRecentUploads([]);
    }
  }, [visible, courseId]);

  const showToast = (
    severity: "success" | "info" | "warn" | "error",
    summary: string,
    detail: string
  ) => {
    if (toastRef.current) {
      toastRef.current.show({ severity, summary, detail, life: 3000 });
    }
  };

  const uploadToServer = async (file: File): Promise<string | null> => {
    setIsUploading(true);
    setUploadProgress(0);
    const formData = new FormData();
    formData.append("file", file);

    // Simuler la progression pour une meilleure UX
    const progressInterval = setInterval(() => {
      setUploadProgress((prev) => {
        const newProgress = prev + Math.random() * 10;
        return newProgress >= 90 ? 90 : newProgress;
      });
    }, 200);

    try {
      const data = await postRequest<{ url: string }, any>(
        "/moniteurs/addMycourses/upload",
        formData
      );
      clearInterval(progressInterval);
      setUploadProgress(100);

      // Ajouter aux uploads récents pour réutilisation facile
      if (data.url) {
        setRecentUploads((prev) => [
          {
            url: data.url,
            type: file.type.startsWith("image") ? "image" : "video",
            name: file.name,
          },
          ...prev.slice(0, 4), // Garder seulement les 5 derniers
        ]);
      }

      setTimeout(() => {
        setIsUploading(false);
        setUploadProgress(0);
      }, 500);

      showToast(
        "success",
        "Upload réussi",
        `Le fichier ${file.name} a été uploadé avec succès.`
      );
      return data.url;
    } catch (err: any) {
      clearInterval(progressInterval);
      setIsUploading(false);
      setUploadProgress(0);
      console.error(err);
      showToast(
        "error",
        "Erreur d'upload",
        err.message || "Un problème est survenu lors de l'upload"
      );
      return null;
    }
  };

  const handleFileSelect = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleFileChange = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    if (!event.target.files || event.target.files.length === 0) return;

    const file = event.target.files[0];

    if (!file.type.startsWith("image") && !file.type.startsWith("video")) {
      showToast(
        "error",
        "Type de fichier invalide",
        "Le fichier doit être une image ou une vidéo."
      );
      return;
    }

    const url = await uploadToServer(file);

    if (!url || !quillRef.current) return;

    const quill = quillRef.current.getEditor();
    const range = quill.getSelection(true);
    const tag = file.type.startsWith("video") ? "video" : "image";

    try {
      // Créer l'URL directe que Quill utilisera
      const directUrl = `http://localhost:8000/media/${url}`;

      // Insérer l'image avec l'URL directe + token
      quill.insertEmbed(range.index, tag, directUrl);
      quill.setSelection({ index: range.index + 1, length: 0 });
      quill.update();
    } catch (err) {
      showToast(
        "error",
        "Erreur lors de l'affichage de l'image",
        "Un problème est survenu lors de la récupération de l'image."
      );
      console.error(err);
    }

    // Réinitialiser l'input pour permettre de sélectionner le même fichier
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const imageHandler = () => {
    handleFileSelect();
  };

  const modules = useMemo(
    () => ({
      toolbar: {
        container: [
          [{ header: [1, 2, false] }],
          ["bold", "italic", "underline", "strike"],
          ["blockquote", "code-block"],
          [{ list: "ordered" }, { list: "bullet" }],
          [{ indent: "-1" }, { indent: "+1" }],
          [{ align: [] }],
          ["link", "image", "video"],
          ["clean"],
        ],
        handlers: {
          image: imageHandler,
          video: imageHandler,
        },
      },
    }),
    []
  );

  const handleDescriptionChange = (content: string) => {
    setDescription(content);
  };

  const handleSave = async () => {
    try {
      if (!libelle.trim()) {
        showToast(
          "warn",
          "Champ requis",
          "Veuillez saisir un titre pour le cours"
        );
        return;
      }

      if (!courseId) {
        showToast("error", "Erreur", "Identifiant du cours manquant");
        return;
      }

      setIsSaving(true);
      await postRequest(`/moniteurs/course/${courseId}/update`, {
        libelle,
        description,
      });

      showToast(
        "success",
        "Cours mis à jour",
        "Votre cours a été modifié avec succès"
      );
      onCourseUpdated();
      onHide();
    } catch (error) {
      console.error("Erreur lors de la mise à jour du cours:", error);
      showToast(
        "error",
        "Erreur",
        "Une erreur est survenue lors de la mise à jour du cours"
      );
    } finally {
      setIsSaving(false);
    }
  };

  const insertRecentMedia = (item: { url: string; type: string }) => {
    if (!quillRef.current) return;

    const quill = quillRef.current.getEditor();
    const range = quill.getSelection(true);

    quill.insertEmbed(
      range.index,
      item.type === "image" ? "image" : "video",
      `http://localhost:8000/media/${item.url}`
    );
    quill.setSelection({ index: range.index + 1, length: 0 });
  };

  const renderQuillEditor = () => {
    if (!visible || !editorMounted || isLoading) {
      return <div className="h-96 border border-gray-300 rounded-md"></div>;
    }

    return (
      <div className="h-[500px] w-full">
        <ReactQuill
          theme="snow"
          value={description}
          onChange={handleDescriptionChange}
          modules={modules}
          placeholder="Décrivez votre cours ici..."
          ref={quillRef}
          className="h-full"
          preserveWhitespace={true}
        />
      </div>
    );
  };

  const renderFooter = () => {
    return (
      <div className="flex justify-end gap-3 p-4">
        <Button
          label="Annuler"
          icon="pi pi-times"
          className="bg-white text-gray-600 border border-gray-300 hover:bg-gray-100 px-4 py-2 rounded-lg"
          onClick={onHide}
          disabled={isUploading || isLoading || isSaving}
        />
        <Button
          label="Enregistrer"
          icon="pi pi-save"
          className="bg-green-600 hover:bg-green-700 text-white border-0 px-4 py-2 rounded-lg"
          onClick={handleSave}
          disabled={isUploading || isLoading || isSaving}
        />
      </div>
    );
  };

  return (
    <div className="p-4 bg-white">
      <Toast ref={toastRef} position="top-right" />
      <Dialog
        header={<div className="text-green-800 font-bold text-2xl p-4 border-b-2 border-green-200">Modifier le cours</div>}
        visible={visible}
        onHide={(isUploading || isLoading || isSaving) ? () => {} : onHide}
        className="w-[80vw] min-w-[350px] max-w-7xl rounded-xl overflow-hidden relative"
        modal
        dismissableMask={!isUploading && !isLoading && !isSaving}
        closable={!isUploading && !isLoading && !isSaving}
        footer={renderFooter()}
      >
        {isSaving && (
          <div className="absolute inset-0 bg-white/70 z-50 flex items-center justify-center">
            <Loader />
          </div>
        )}
        
        <div className="p-4" ref={dialogRef}>
          {isLoading ? (
            <div className="flex items-center justify-center h-96 w-full">
              <Loader />
            </div>
          ) : (
            <>
              <div className="mb-6">
                <label htmlFor="libelle" className="block mb-2 text-lg font-bold text-green-800 border-l-4 border-green-500 pl-2">
                  Titre du cours
                </label>
                <div className="relative">
                  <InputText
                    id="libelle"
                    className="w-full border-2 border-green-200 rounded-lg px-4 py-2.5 focus:border-green-500 focus:ring-green-500 focus:outline-none transition-colors shadow-sm"
                    value={libelle}
                    onChange={(e) => setLibelle(e.target.value)}
                    placeholder="Entrez le titre du cours"
                    required
                  />
                  <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                    <i className="pi pi-book text-green-600"></i>
                  </div>
                </div>
              </div>

              {/* Barre d'outils supplémentaire pour faciliter l'insertion de médias */}
              <div className="mb-4 flex flex-wrap items-center justify-between">
                <div>
                  <Button
                    type="button"
                    icon="pi pi-image"
                    label="Ajouter une image/vidéo"
                    className="bg-green-600 hover:bg-green-700 text-white border-0 px-4 py-2 rounded-lg"
                    onClick={handleFileSelect}
                    disabled={isUploading}
                  />
                  {/* Input file caché */}
                  <input
                    type="file"
                    ref={fileInputRef}
                    className="hidden"
                    accept="image/jpeg, image/png, image/gif, video/mp4, video/webm, video/ogg"
                    onChange={handleFileChange}
                  />
                </div>
                {isUploading && (
                  <div className="flex items-center mt-2 sm:mt-0">
                    <ProgressSpinner
                      className="w-8 h-8 text-green-600"
                      strokeWidth="4"
                    />
                    <span className="ml-2 text-gray-700">
                      Upload en cours ({Math.round(uploadProgress)}%)
                    </span>
                  </div>
                )}
              </div>

              {/* Section des uploads récents */}
              {recentUploads.length > 0 && (
                <div className="mb-6">
                  <label className="block mb-2 text-lg font-bold text-green-800 border-l-4 border-green-500 pl-2">
                    Fichiers récents
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {recentUploads.map((item, index) => (
                      <div
                        key={index}
                        className="inline-flex items-center bg-green-100 text-green-800 py-1 px-3 rounded-full text-sm cursor-pointer hover:bg-green-200 transition-colors"
                        onClick={() => insertRecentMedia(item)}
                      >
                        <i className={`pi ${item.type === "image" ? "pi-image" : "pi-video"} mr-2`}></i>
                        {item.name.length > 15 ? item.name.substring(0, 12) + "..." : item.name}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="mb-6">
                <label className="block mb-2 text-lg font-bold text-green-800 border-l-4 border-green-500 pl-2">Contenu</label>
                <div className="bg-white rounded-lg shadow-md overflow-hidden border border-gray-200">
                  <div className="quill-wrapper">
                    {renderQuillEditor()}
                  </div>
                </div>
                <style>{`
                  .quill-wrapper :global(.ql-container) {
                    flex: 1;
                    overflow-y: auto;
                    font-size: 16px;
                    border-bottom-left-radius: 0.375rem;
                    border-bottom-right-radius: 0.375rem;
                  }
                  
                  .quill-wrapper :global(.ql-toolbar) {
                    background-color: #f8f9fa;
                    padding: 8px;
                    border-top-left-radius: 0.375rem;
                    border-top-right-radius: 0.375rem;
                  }
                  
                  .quill-wrapper :global(.ql-editor) {
                    min-height: 400px;
                    padding: 1rem;
                    font-family: system-ui, -apple-system, sans-serif;
                    line-height: 1.6;
                    background-color: white;
                  }
                  
                  .quill-wrapper :global(.ql-editor img) {
                    max-width: 90%;
                    max-height: 400px;
                    object-fit: contain;
                    margin: 0 auto;
                    display: block;
                  }
                  
                  .quill-wrapper :global(.ql-editor .ql-video) {
                    max-width: 90%;
                    max-height: 400px;
                    margin: 0 auto;
                    display: block;
                  }

                  @media screen and (max-width: 768px) {
                    .quill-wrapper :global(.quill) {
                      height: 300px;
                    }
                    .quill-wrapper :global(.ql-editor) {
                      min-height: 200px;
                    }
                  }
                `}</style>
              </div>
            </>
          )}
        </div>
      </Dialog>
    </div>
  );
};

export default EditCourseModal;
