import { InputText } from "primereact/inputtext";

function SearchBar() {
  return (
    <div className="absolute top-0 left-0 right-0 z-500">
      <div className="flex justify-center mt-5 px-4">
        {/* Ajout d'une marge à gauche sur mobile pour éviter le bouton de menu */}
        <div className="relative w-full max-w-md ml-14 sm:ml-0">
          <InputText
            placeholder="Rechercher"
            className="rounded-full shadow-md hover:shadow-lg bg-white pl-4 pr-10 py-2 text-base w-full"
          />
          <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500">
            <i className="pi pi-search text-green-800"></i>
          </div>
        </div>
      </div>
    </div>
  );
}

export default SearchBar;
