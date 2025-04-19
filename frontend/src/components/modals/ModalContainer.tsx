import React from "react";
import { useModal } from "../../contexts/ModalContext";
import ProfileModal from "./ProfileModal";
import ClassesModal from "./ClassesModal";
import CoursesModal from "./CoursesModal";

/**
 * The ModalContainer component renders all application modals
 * and handles their visibility based on the modal context.
 * This centralizes modal management.
 */
const ModalContainer: React.FC = () => {
  const { activeModals, closeModal, modalParams } = useModal();

  return (
    <>
      {/* Profile Modal */}
      <ProfileModal
        visible={activeModals.profile}
        onHide={() => closeModal("profile")}
        idRequested={modalParams.profile?.idRequested || ""}
      />

      {/* Classes Modal */}
      <ClassesModal
        visible={activeModals.classes}
        onHide={() => closeModal("classes")}
        userId={modalParams.classes?.userId}
        readOnly={modalParams.classes?.readOnly}
      />

      {/* Courses Modal */}
      <CoursesModal
        visible={activeModals.courses}
        onHide={() => closeModal("courses")}
        courseId={modalParams.courses?.courseId ?? null}
      />

      {/* Add any future modals here */}
    </>
  );
};

export default ModalContainer;
