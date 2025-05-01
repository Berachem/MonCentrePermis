// src/components/TopBar.tsx

import { InputText } from "primereact/inputtext";
import SideBarCustom from "../Home/SideBarCustom";

function HomePageTopBar() {
  return (
    <div className="absolute top-0 left-0 right-0 flex items-center px-2 md:px-4 z-[1000]">
      <div className="flex items-center justify-start w-full mt-5">
        {/* SideBarCustom maintenant aligné avec la barre de recherche */}
        <SideBarCustom/>
        <div className="ml-3">
          <div className="relative">
            <InputText
              placeholder="Rechercher"
              className="rounded-full shadow-md hover:shadow-lg bg-white pl-4 pr-10 py-2 w-full"
            />
            <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500">
              <i className="pi pi-search"></i>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default HomePageTopBar;
