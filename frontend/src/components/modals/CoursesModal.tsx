import React, { useEffect, useState } from "react";
import { Dialog } from 'primereact/dialog';

interface CoursesModalProps {
  visible: boolean;
  onHide: () => void;
  courseId: string | null;
}

const CoursesModal: React.FC<CoursesModalProps> = ({ visible, onHide, courseId }) => {
  const [courseData, setCourseData] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (visible && courseId) {
      fetchCourseData(courseId);
    }
  }, [visible, courseId]);

  const fetchCourseData = async (id: string) => {
    setLoading(true);
    // Mock data fetch - replace with actual API call
    try {
      // Simulate API call
      setTimeout(() => {
        setCourseData({
          id,
          title: `Cours ${id}`,
          description: `Description détaillée du cours ${id}`,
          content: `Contenu du cours ${id}. Ce cours vous aidera à comprendre les concepts clés...`
        });
        setLoading(false);
      }, 500);
    } catch (error) {
      console.error("Error fetching course data:", error);
      setLoading(false);
    }
  };

  return (
    <Dialog
      visible={visible}
      onHide={onHide}
      dismissableMask={true}
      header={courseData?.title || "Chargement du cours..."}
      closeOnEscape
      style={{ width: '80vw', maxWidth: '800px' }}
      breakpoints={{ '960px': '95vw' }}
    >
      {loading ? (
        <p>Chargement du contenu...</p>
      ) : (
        <div>
          <h3>{courseData?.title}</h3>
          <p className="text-lg">{courseData?.description}</p>
          <div className="mt-4 p-3 surface-100 border-round">
            {courseData?.content}
          </div>
        </div>
      )}
    </Dialog>
  );
};

export default CoursesModal;
