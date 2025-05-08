import React, { useState, useEffect, useRef, useMemo } from "react";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";
import { InputText } from "primereact/inputtext";
import { Button } from "primereact/button";
import { Dialog } from "primereact/dialog";
import { ProgressSpinner } from "primereact/progressspinner";
import { Toast } from "primereact/toast";
import {
  postRequest,
} from "../../interfaces/api";
import Loader from "../utils/Loader";

// Template par défaut pour le contenu du cours
const DEFAULT_TEMPLATE = `<h2>🎯 Introduction</h2>
<p>Présentez votre cours et son objectif principal ici.</p>

<h2>🚀 Objectifs pédagogiques</h2>
<ul>
  <li>Premier objectif de cette leçon</li>
  <li>Deuxième objectif de cette leçon</li>
  <li>Troisième objectif de cette leçon</li>
</ul>

<h2>📚 Contenu principal</h2>
<p>Développez ici les points principaux que vous souhaitez aborder.</p>

<h2>💡 Exemple pratique</h2>
<p>Ajoutez ici des exemples concrets pour illustrer votre cours.</p>

<h2>✏️ Exercices pratiques</h2>
<p>Proposez des exercices pour mettre en application les connaissances.</p>

<h2>🏁 Conclusion</h2>
<p>Récapitulez les points essentiels de votre cours.</p>`;

interface AddCoursesProps {
  visible: boolean;
  onHide: () => void;
  onCourseAdded: () => void;
}

const AddCourses: React.FC<AddCoursesProps> = ({
  visible,
  onHide,
  onCourseAdded,
}) => {
  const [libelle, setLibelle] = useState("");
  const [description, setDescription] = useState("");
  const [editorMounted, setEditorMounted] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isSaving, setIsSaving] = useState(false);
  const [recentUploads, setRecentUploads] = useState<
    { url: string; type: string; name: string }[]
  >([]);
  const quillRef = useRef<ReactQuill>(null);
  const dialogRef = useRef<HTMLDivElement>(null);
  const toastRef = useRef<Toast>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Initialisation de l'éditeur une fois le dialogue visible
  useEffect(() => {
    if (visible) {
      const timer = setTimeout(() => {
        setEditorMounted(true);
        // Initialiser avec le template par défaut si la description est vide
        if (!description) {
          setDescription(DEFAULT_TEMPLATE);
        }
      }, 300);
      return () => clearTimeout(timer);
    } else {
      setLibelle("");
      setDescription("");
      setRecentUploads([]);
    }
  }, [visible, description]);

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
      ) as { url: string }; // Explicitly type the response
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

      // Insérer l'image avec l'URL directe + token
      quill.insertEmbed(range.index, tag, `http://localhost:8000/media/${url}`);
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

  // Version améliorée du gestionnaire d'images pour QuillJS
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

      setIsSaving(true);
      await postRequest("/moniteurs/addMycourses", {
        libelle,
        description,
      });

      showToast(
        "success",
        "Cours créé",
        "Votre cours a été ajouté avec succès"
      );
      onCourseAdded();
      onHide();
    } catch (error) {
      console.error("Erreur lors de l'enregistrement du cours:", error);
      showToast(
        "error",
        "Erreur",
        "Une erreur est survenue lors de l'enregistrement du cours"
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
    if (!visible || !editorMounted) {
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
          disabled={isUploading || isSaving}
        />
        <Button
          label="Enregistrer"
          icon="pi pi-save"
          className="bg-green-600 hover:bg-green-700 text-white border-0 px-4 py-2 rounded-lg"
          onClick={handleSave}
          disabled={isUploading || isSaving}
        />
      </div>
    );
  };

  return (
    <div>
      <Toast ref={toastRef} position="top-right" />
      <Dialog
        header={<div className="text-green-800 font-bold text-2xl p-4 border-b-2 border-green-200">Ajouter un nouveau cours</div>}
        visible={visible}
        onHide={(isUploading || isSaving) ? () => {} : onHide}
        className="w-[80vw] min-w-[350px] max-w-7xl rounded-xl overflow-hidden relative"
        modal
        dismissableMask={!isUploading && !isSaving}
        closable={!isUploading && !isSaving}
        footer={renderFooter()}
      >
        {isSaving && (
          <div className="absolute inset-0 bg-white/70 z-50 flex items-center justify-center">
            <Loader />
          </div>
        )}
        
        <div className="p-4" ref={dialogRef}>
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
        </div>
      </Dialog>
    </div>
  );
};

export default AddCourses;
