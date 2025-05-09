import { useEffect, useRef, useState } from "react";
import { Button } from "primereact/button";
import { DataScroller } from "primereact/datascroller";
import { InputText } from "primereact/inputtext";
import { Paginator } from "primereact/paginator";
import { getRequest } from "../interfaces/api";
import { Toast } from "primereact/toast";
import { AutoEcole } from "../interfaces/interfaces";
import SideBarCustom from "../components/Home/SideBarCustom";
import logoApp from "../assets/images/branding/logo_moncentrepermis_green.png";
import Loader from "../components/utils/Loader";
import { Divider } from "primereact/divider";
import { InputSwitch } from "primereact/inputswitch";

export default function SchoolsPage() {
  const [loading, setLoading] = useState<boolean>(true);
  const [autoEcoles, setAutoEcoles] = useState<AutoEcole[]>([]);
  const [filteredAutoEcoles, setFilteredAutoEcoles] = useState<AutoEcole[]>([]);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [sortByDistance, setSortByDistance] = useState<boolean>(false);
  const [userLocation, setUserLocation] = useState<[number, number] | null>(
    null
  );
  const [first, setFirst] = useState(0);
  const [rows, setRows] = useState(2);
  const toast = useRef<Toast>(null);

  // Fetch user location for distance calculation
  useEffect(() => {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setUserLocation([position.coords.latitude, position.coords.longitude]);
      },
      (error) => {
        console.error(
          "Erreur lors de la récupération de la géolocalisation",
          error
        );
        /*    toast.current?.show({
                    severity: 'warn',
                    summary: 'Erreur de géolocalisation',
                    detail: 'Impossible de récupérer la géolocalisation. Tri par distance désactivé.',
                }); */
      }
    );
  }, []);

  useEffect(() => {
    const fetchAutoEcoles = async () => {
      try {
        const data = await getRequest<AutoEcole[]>("/custom/auto_ecoles");
        setAutoEcoles(data);
        setFilteredAutoEcoles(data);
        /*    toast.current?.show({
                    severity: 'success',
                    summary: 'Succès',
                    detail: "Auto-écoles récupérées avec succès",
                }); */
      } catch (error) {
        toast.current?.show({
          severity: "error",
          summary: "Erreur",
          detail: "Impossible de récupérer les auto-écoles",
        });
      }
      setLoading(false);
    };
    fetchAutoEcoles();
  }, []);

  useEffect(() => {
    let results = autoEcoles;

    if (searchTerm) {
      results = results.filter(
        (autoEcole) =>
          autoEcole.libelle?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          autoEcole.numero_agrement.includes(searchTerm) ||
          autoEcole.ville?.libelle
            .toLowerCase()
            .includes(searchTerm.toLowerCase())
      );
    }

    if (sortByDistance && userLocation) {
      results = results
        .map((autoEcole) => ({
          ...autoEcole,
          distance: calculateDistance(
            userLocation[0],
            userLocation[1],
            parseFloat(autoEcole.ville?.latitude ?? "0"),
            parseFloat(autoEcole.ville?.longitude ?? "0")
          ),
        }))
        .sort((a, b) => (a.distance ?? 0) - (b.distance ?? 0));

      toast.current?.show({
        severity: "info",
        summary: "Tri par distance",
        detail: "Les auto-écoles sont triées par distance",
      });
    }

    setFilteredAutoEcoles(results);
  }, [searchTerm, sortByDistance, userLocation, autoEcoles]);

  // Calculate distance between two coordinates in kilometers
  const calculateDistance = (
    lat1: number,
    lon1: number,
    lat2: number,
    lon2: number
  ) => {
    const R = 6371; // Radius of Earth in kilometers
    const dLat = (lat2 - lat1) * (Math.PI / 180);
    const dLon = (lon2 - lon1) * (Math.PI / 180);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1 * (Math.PI / 180)) *
        Math.cos(lat2 * (Math.PI / 180)) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  };

  const itemTemplate = (data: AutoEcole) => (
    <div className="w-full rounded-lg shadow-md bg-white hover-bg-gray-50">
      <div className="flex flex-col xl:flex-row items-start gap-4 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-2xl p-4 transition-colors duration-200">
        <div className="flex flex-col gap-2 w-full">
          <div className="text-xl font-bold text-gray-800 dark:text-gray-100 flex flex-wrap items-center gap-2">
            <span>{data.libelle}</span> 
            <span className="text-green-600 font-normal text-base">{data.numero_agrement}</span>
            {data.distance && (
              <span className="inline-flex items-center px-3 py-1 bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 text-sm font-medium rounded-full ml-2">
                {data.distance.toFixed(2)} km
              </span>
            )}
          </div>
          <div className="text-gray-600 dark:text-gray-400">{data.adresse}</div>
          <div className="text-gray-600 dark:text-gray-400">
            {`à ${data.ville?.libelle || "N/A"} (${
              data.ville?.code_postal || "N/A"
            })`}
          </div>
          <div className="flex items-center gap-2 text-gray-500 dark:text-gray-500">
            <i className="pi pi-map-marker text-green-600"></i>
            <span>{data.ville?.region || "Région inconnue"}</span>
          </div>
        </div>

        <Button
          icon="fa fa-google"
          label="Voir sur Google Maps"
          className="bg-green-600 hover:bg-green-700 border-green-600 mt-2 p-2 gap-2 rounded-lg text-white"
          onClick={() =>
            window.open(
              `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                data.adresse + " " + data.ville?.libelle
              )}`,
              "_blank"
            )
          }
        />
      </div>
      <Divider className="my-2" />
    </div>
  );

  const onPageChange = (event: { first: number; rows: number }) => {
    setFirst(event.first);
    setRows(event.rows);
  };

  return (
    <div className="bg-white dark:bg-gray-900 min-h-screen flex flex-col">
      <Toast ref={toast} />

      <div className="flex items-center justify-center w-full mt-6">
        <SideBarCustom />
        <img src={logoApp} alt="logo" className="mx-auto w-52 md:w-64" />
      </div>

      <div className="max-w-5xl mx-auto w-full px-4 md:px-6 mt-8">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-800 dark:text-white flex items-center gap-2">
            Rechercher des Auto-Écoles{" "}
            {loading ? (
              <i className="pi pi-spin pi-spinner ml-2 text-green-600"></i>
            ) : (
              <span className="text-green-600">
                sur {filteredAutoEcoles.length} au total
              </span>
            )}
          </h2>
        </div>

        <div className="mb-3 relative">
          <span className="p-input-icon-left w-full">
            <i className="pi pi-search absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500"></i>
            <InputText
              placeholder="Rechercher par nom, numéro d'agrément ou ville"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 py-2 rounded-full shadow-md border-0 focus:ring-2 focus:ring-green-500"
            />
          </span>
        </div>

        <div className="flex items-center mb-2 bg-green-50 dark:bg-green-900/20 p-3 rounded-lg">
          <h4 className="text-gray-800 dark:text-gray-200 flex items-center gap-2 m-0">
            <i className="pi pi-map-marker text-green-600"></i> 
            Trier par distance
          </h4>
          <InputSwitch
            checked={sortByDistance}
            onChange={(e) => setSortByDistance(e.value)}
            title="Trier par distance"
            className="ml-4 p-2"
          />
        </div>

        <div className="p-4">
          {loading ? (
            <div className="flex justify-center py-8">
              <Loader />
            </div>
          ) : (
            <>
              <DataScroller
                value={filteredAutoEcoles.slice(first, first + rows)}
                itemTemplate={itemTemplate}
                rows={rows}
                emptyMessage={
                  <div className="flex flex-col items-center justify-center py-8 text-gray-500 dark:text-gray-400">
                    <i className="pi pi-search-minus text-4xl mb-4 text-green-500 opacity-50"></i>
                    <p>Aucune auto-école trouvée</p>
                  </div>
                }
                className="border-none"
              />
              <Paginator
                first={first}
                rows={rows}
                totalRecords={filteredAutoEcoles.length}
                onPageChange={onPageChange}
                className="mt-4 bg-transparent border-t border-gray-200 dark:border-gray-700 pt-4"
                pt={{
                  root: { className: 'bg-transparent border-0' },
                  firstPageButton: { className: 'bg-white dark:bg-gray-700 hover:bg-green-50 dark:hover:bg-green-900/20' },
                  nextPageButton: { className: 'bg-white dark:bg-gray-700 hover:bg-green-50 dark:hover:bg-green-900/20' },
                  lastPageButton: { className: 'bg-white dark:bg-gray-700 hover:bg-green-50 dark:hover:bg-green-900/20' },
                  pageButton: { className: 'hover:bg-green-50 dark:hover:bg-green-900/20' },
                }}
              />
            </>
          )}
        </div>
      </div>
    </div>
  );
}
