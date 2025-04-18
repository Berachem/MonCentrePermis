import React, { useEffect, useState } from "react";
import { Dialog } from 'primereact/dialog';
import { ProgressSpinner } from 'primereact/progressspinner';

interface CoursesModalProps {
  visible: boolean;
  onHide: () => void;
  courseId: string | null;
}

interface Course {
  id: number;
  libelle: string;
  description: string;
  content?: string;
}

const CoursesModal: React.FC<CoursesModalProps> = ({ visible, onHide, courseId }) => {
  const [course, setCourse] = useState<Course | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (visible && courseId) {
      const fetchCourse = async () => {
        setLoading(true);
        try {
          const res = await fetch(`http://localhost:8000/media/cours/33`);
          if (!res.ok) throw new Error('Erreur lors de la récupération du cours');
          const data = await res.json();
          const coursData = data.cours;
  
          // Ajouter token aux URLs des images dans la description
          const token = localStorage.getItem('jwtToken');
          if (token && coursData.description) {
            coursData.description = coursData.description.replace(/src="(http:\/\/localhost:8000[^"]+)"/g, (match, url) => {
              const urlWithToken = `${url}?token=${token}`;
              return `src="${urlWithToken}"`;
            });
          }
  
          setCourse(coursData);
        } catch (error) {
          console.error(error);
        } finally {
          setLoading(false);
        }
      };
      fetchCourse();
    }
  }, [visible, courseId]);
  

  return (
    <Dialog
      header={course?.libelle || "Chargement..."}
      visible={visible}
      onHide={onHide}
      modal
      style={{ width: '90vw', maxWidth: '600px' }}
    >
      {loading ? (
        <div className="flex justify-center items-center" style={{ height: 200 }}>
          <ProgressSpinner />
        </div>
      ) : course ? (
        <div>
          <div
            className="prose max-w-full"
            dangerouslySetInnerHTML={{ __html: course.description }}
          />
        </div>
      ) : (
        <p className="text-red-500">Cours introuvable</p>
      )}
    </Dialog>
  );
};

export default CoursesModal;
