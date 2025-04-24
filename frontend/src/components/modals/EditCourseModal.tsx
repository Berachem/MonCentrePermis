import React, { useState, useEffect, useRef, useMemo } from "react";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";
import { InputText } from "primereact/inputtext";
import { Button } from "primereact/button";
import { Dialog } from "primereact/dialog";
import { ProgressSpinner } from "primereact/progressspinner";
import { Toast } from "primereact/toast";
import { Card } from "primereact/card";
import { Tag } from "primereact/tag";
import {
  getRequest,
  postRequest,
  putRequest,
} from "../../interfaces/utils/api";

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
  const [originalDescription, setOriginalDescription] = useState(""); // Pour suivre les modifications
  const [editorMounted, setEditorMounted] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [recentUploads, setRecentUploads] = useState<
    { url: string; type: string; name: string }[]
  >([]);
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
      const data = await postRequest(
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

      // Si vous avez besoin d'inclure un token dans l'URL pour que l'image soit accessible
      const token = localStorage.getItem("jwtToken");
      const urlWithToken = `${directUrl}?token=${token}`;

      // Insérer l'image avec l'URL directe + token
      quill.insertEmbed(range.index, tag, directUrl);
      quill.setSelection(range.index + 1);
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

      const response = await postRequest(
        `/moniteurs/course/${courseId}/update`,
        {
          libelle,
          description,
        }
      );

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
    quill.setSelection(range.index + 1);
  };

  const renderQuillEditor = () => {
    if (!visible || !editorMounted || isLoading) {
      return <div style={{ height: "400px", border: "1px solid #ddd" }}></div>;
    }

    return (
      <ReactQuill
        theme="snow"
        value={description}
        onChange={handleDescriptionChange}
        modules={modules}
        placeholder="Décrivez votre cours ici..."
        ref={quillRef}
        style={{ height: "500px" }}
        preserveWhitespace={true}
      />
    );
  };

  const renderFooter = () => {
    return (
      <div className="flex justify-content-end">
        <Button
          label="Annuler"
          icon="pi pi-times"
          className="p-button-text mr-2"
          onClick={onHide}
          disabled={isUploading || isLoading}
        />
        <Button
          label="Enregistrer"
          icon="pi pi-save"
          className="p-button-success"
          onClick={handleSave}
          disabled={isUploading || isLoading}
        />
      </div>
    );
  };

  return (
    <>
      <Toast ref={toastRef} position="top-right" />
      <Dialog
        header="Modifier le cours"
        visible={visible}
        onHide={isUploading || isLoading ? undefined : onHide}
        style={{ width: "80vw", minWidth: "350px" }}
        modal
        dismissableMask={!isUploading && !isLoading}
        closable={!isUploading && !isLoading}
        breakpoints={{ "960px": "90vw", "640px": "95vw" }}
        className="edit-courses-dialog"
        footer={renderFooter()}
      >
        <div className="p-fluid" ref={dialogRef}>
          {isLoading ? (
            <div
              className="flex align-items-center justify-content-center"
              style={{ height: "400px" }}
            >
              <ProgressSpinner style={{ width: "50px", height: "50px" }} />
              <span className="ml-2">Chargement du cours...</span>
            </div>
          ) : (
            <>
              <div className="mb-3">
                <label htmlFor="libelle" className="block mb-2 font-semibold">
                  Titre du cours
                </label>
                <InputText
                  id="libelle"
                  className="w-full"
                  value={libelle}
                  onChange={(e) => setLibelle(e.target.value)}
                  required
                />
              </div>

              {/* Barre d'outils supplémentaire pour faciliter l'insertion de médias */}
              <div className="mb-2 flex align-items-center justify-content-between">
                <div>
                  <Button
                    type="button"
                    icon="pi pi-image"
                    label="Ajouter une image/vidéo"
                    className="p-button-outlined p-button-secondary mr-2"
                    onClick={handleFileSelect}
                    disabled={isUploading}
                  />
                  {/* Input file caché */}
                  <input
                    type="file"
                    ref={fileInputRef}
                    style={{ display: "none" }}
                    accept="image/jpeg, image/png, image/gif, video/mp4, video/webm, video/ogg"
                    onChange={handleFileChange}
                  />
                </div>
                {isUploading && (
                  <div className="flex align-items-center">
                    <ProgressSpinner
                      style={{ width: "30px", height: "30px" }}
                      strokeWidth="4"
                    />
                    <span className="ml-2">
                      Upload en cours ({Math.round(uploadProgress)}%)
                    </span>
                  </div>
                )}
              </div>

              {/* Section des uploads récents */}
              {recentUploads.length > 0 && (
                <div className="mb-3">
                  <label className="block mb-2 font-semibold">
                    Fichiers récents
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {recentUploads.map((item, index) => (
                      <Tag
                        key={index}
                        value={
                          item.name.length > 15
                            ? item.name.substring(0, 12) + "..."
                            : item.name
                        }
                        icon={
                          item.type === "image" ? "pi pi-image" : "pi pi-video"
                        }
                        className="p-tag-info cursor-pointer"
                        onClick={() => insertRecentMedia(item)}
                      />
                    ))}
                  </div>
                </div>
              )}

              <div className="mb-4">
                <label className="block mb-2 font-semibold">Contenu</label>
                <Card className="editor-card">
                  <div
                    className="quill-container"
                    style={{ marginBottom: "20px", height: "500px" }}
                  >
                    {renderQuillEditor()}
                  </div>
                </Card>
              </div>
            </>
          )}
        </div>
      </Dialog>
      <style jsx>{`
        .edit-courses-dialog .quill-container {
          height: 550px;
        }

        .edit-courses-dialog .quill {
          height: 100%;
          display: flex;
          flex-direction: column;
          border-radius: 4px;
        }

        .edit-courses-dialog .ql-container {
          flex: 1;
          overflow-y: auto;
          font-size: 16px;
          border-bottom-left-radius: 4px;
          border-bottom-right-radius: 4px;
        }

        .edit-courses-dialog .ql-toolbar {
          border-top-left-radius: 4px;
          border-top-right-radius: 4px;
          background-color: #f8f9fa;
          padding: 8px;
        }

        .edit-courses-dialog .ql-editor {
          min-height: 500px;
          padding: 16px;
          font-family: "Arial", sans-serif;
          line-height: 1.6;
          background-color: white;
        }

        /* Limitation de la taille des images */
        .edit-courses-dialog .ql-editor img {
          max-width: 90%;
          max-height: 400px;
          object-fit: contain;
          margin: 0 auto;
          display: block;
        }

        /* Limitation de la taille des vidéos */
        .edit-courses-dialog .ql-editor .ql-video {
          max-width: 90%;
          max-height: 400px;
          margin: 0 auto;
          display: block;
        }

        .editor-card {
          box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
        }

        .editor-card .p-card-body {
          padding: 0;
        }

        .editor-card .p-card-content {
          padding: 0;
        }

        /* Amélioration responsive */
        @media screen and (max-width: 768px) {
          .edit-courses-dialog .quill-container {
            height: 300px;
          }
        }
      `}</style>
    </>
  );
};

export default EditCourseModal;
