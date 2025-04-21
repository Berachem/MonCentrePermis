import React from "react";
import { TabView, TabPanel } from "primereact/tabview";
import CourseContent from "./CourseContent";
import { Button } from "primereact/button";
import { Circuit } from "../../interfaces/circuit.interface";

export interface Course {
  id: string;
  libelle: string;
  description: string;
}

interface ScrollableCoursesProps {
  courses: Course[];
  readOnly?: boolean;
}

const ScrollableCourses: React.FC<ScrollableCoursesProps> = ({
  courses,
  readOnly = true,
}) => {
  return (
    <div className="card w-full">
      <TabView scrollable className="w-full h-full">
        {courses.map((course) => (
          <TabPanel key={course.id} header={course.libelle}>
            {/* Circuits associés */}
            <div className="flex flex-column md:flex-row justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">Circuits associés : </h2>
              {/* TODO mettre les circuits associés */}
              <div className="flex flex-wrap gap-2 ">
                <Button
                  icon="pi pi-map"
                  label="Exemple de circuit"
                  className="p-button-outlined ml-4"
                  severity="info"
                  onClick={() =>
                    alert(`TODO rediriger vers le circuit ${course.id}`)
                  }
                />
                <Button
                  icon="pi pi-map"
                  label="Exemple de circuit"
                  className="p-button-outlined ml-4"
                  severity="info"
                  onClick={() =>
                    alert(`TODO rediriger vers le circuit ${course.id}`)
                  }
                />
              </div>
              {!readOnly && (
                <Button
                  icon="pi pi-plus"
                  label="Ajouter un circuit"
                  className="p-button-outlined ml-4"
                  onClick={() =>
                    alert(`TODO Ajouter un circuit au cours ${course.id}`)
                  }
                />
              )}
            </div>

            <CourseContent
              content={course.description}
              className="p-4 bg-gray-100 rounded-lg shadow-md w-full"
            />
            {/* Modifier / Supprimer */}
            {!readOnly && (
              <div className="flex justify-between items-center mb-4 mt-4">
                <Button
                  icon="pi pi-pencil"
                  label="Modifier"
                  className="p-button-outlined"
                  onClick={() => alert(`TODO Modifier le cours ${course.id}`)}
                />
                <Button
                  icon="pi pi-trash"
                  label="Supprimer"
                  className="p-button-outlined p-button-danger"
                  onClick={() => alert(`TODO Supprimer le cours ${course.id}`)}
                />
              </div>
            )}
          </TabPanel>
        ))}
      </TabView>
    </div>
  );
};

export default ScrollableCourses;
