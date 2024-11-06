import { useEffect, useRef, useState } from 'react';
import { Button } from 'primereact/button';
import { DataScroller } from 'primereact/datascroller';
import { InputText } from 'primereact/inputtext';
import { Paginator } from 'primereact/paginator';
import { Chip } from 'primereact/chip';
import { getRequest } from '../../interfaces/utils/api';
import { Toast } from 'primereact/toast';
import { AutoEcole } from '../../interfaces/interfaces';
import SideBarCustom from '../../components/utils/SideBarCustom';
import logoApp from '../../assets/images/branding/logo_moncentrepermis.png';
import Loader from '../../components/utils/Loader';
import { Divider } from 'primereact/divider';
import { InputSwitch } from "primereact/inputswitch";


export default function SchoolsPage() {
    const [loading, setLoading] = useState<boolean>(true);
    const [autoEcoles, setAutoEcoles] = useState<AutoEcole[]>([]);
    const [filteredAutoEcoles, setFilteredAutoEcoles] = useState<AutoEcole[]>([]);
    const [searchTerm, setSearchTerm] = useState<string>('');
    const [sortByDistance, setSortByDistance] = useState<boolean>(false);
    const [userLocation, setUserLocation] = useState<[number, number] | null>(null);
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
                console.error("Erreur lors de la récupération de la géolocalisation", error);
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
                const data = await getRequest<AutoEcole[]>('/custom/auto_ecoles');
                setAutoEcoles(data);
                setFilteredAutoEcoles(data);
                toast.current?.show({
                    severity: 'success',
                    summary: 'Succès',
                    detail: "Auto-écoles récupérées avec succès",
                });
            } catch (error) {
                toast.current?.show({
                    severity: 'error',
                    summary: 'Erreur',
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
                    autoEcole.libelle.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    autoEcole.numero_agrement.includes(searchTerm) ||
                    autoEcole.ville?.libelle.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }

        if (sortByDistance && userLocation) {
            results = results
                .map((autoEcole) => ({
                    ...autoEcole,
                    distance: calculateDistance(
                        userLocation[0],
                        userLocation[1],
                        parseFloat(autoEcole.ville?.latitude ?? '0'),
                        parseFloat(autoEcole.ville?.longitude ?? '0')
                    ),
                }))
                .sort((a, b) => (a.distance ?? 0) - (b.distance ?? 0));

                toast.current?.show({
                    severity: 'info',
                    summary: 'Tri par distance',
                    detail: 'Les auto-écoles sont triées par distance',
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
        <div className="col-12">
            <div className="flex flex-column xl:flex-row xl:align-items-start gap-4 hover:bg-gray-100 border-round-3xl p-4">
                <div className="flex flex-column gap-2 w-full">
                    <div className="text-xl font-bold text-900">{data.libelle} {data.numero_agrement} 
                    {data.distance && (<Chip label={`Distance : ${data.distance.toFixed(2)} km`} className='ml-2' />)}
                    
                    </div>
                    <div className="text-700">{data.adresse}</div>
                    <div className="text-700">
                        {`à ${data.ville?.libelle || 'N/A'} (${data.ville?.code_postal || 'N/A'})`}
                    </div>
                    <div className="flex align-items-center gap-2">
                        <i className="pi pi-map-marker"></i>
                        <span>{data.ville?.region || 'Région inconnue'}</span>
                    </div>
                   
                </div>

                
                    <Button
                        icon="fa fa-google"
                        label="Voir sur Google Maps"
                        className="mt-2"
                        onClick={() =>
                            window.open(
                                `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                                    data.adresse + ' ' + data.ville?.libelle
                                )}`,
                                '_blank'
                            )
                        }
                    />
      
            </div>
            <Divider />
        </div>
    );

    const onPageChange = (event: { first: number; rows: number }) => {
        setFirst(event.first);
        setRows(event.rows);
    };

    return (
        <div className="card flex flex-column">
            <Toast ref={toast} />

            <div className="flex align-items-center justify-content-center col-12 mt-4">
                <SideBarCustom />
                <img src={logoApp} alt="logo" className="mx-auto md:w-2 w-13rem" />
            </div>

            <div className="gap-4 xl:p-4 w-9 mx-auto mt-4">
                <div className="flex justify-content-between align-items-center mb-4 ">
                    <h2 className="m-0">
                        Rechercher des Auto-Écoles{' '}
                        {loading ? (
                            <i className="pi pi-spin pi-spinner ml-2"></i>
                        ) : (
                            <span className="text-primary">
                                sur {filteredAutoEcoles.length} au total
                            </span>
                        )}
                    </h2>
                </div>

                <div className="p-inputgroup mb-4">
                    <InputText
                        placeholder="Rechercher par nom, numéro d'agrément ou ville"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="border-round-3xl shadow-3"
                    />
                </div>

     

                <div className="flex align-items-center mb-4">

                <h4>
                    <i className="pi pi-sparkles text-primary"></i> {' '}
                    Trier par distance</h4> 
                    <InputSwitch checked={sortByDistance} onChange={(e) => setSortByDistance(e.value)} title='Trier par distance' className='ml-4'/>
                </div>

                
   
                          
                        
            

                {loading ? (
                    <Loader />
                ) : (
                    <>
                        <DataScroller
                            value={filteredAutoEcoles.slice(first, first + rows)}
                            itemTemplate={itemTemplate}
                            rows={rows}
                            emptyMessage="Aucune auto-école trouvée"
                        />
                        <Paginator
                            first={first}
                            rows={rows}
                            totalRecords={filteredAutoEcoles.length}
                            rowsPerPageOptions={[5, 10, 20]}
                            onPageChange={onPageChange}
                            className="mt-4"
                        />
                    </>
                )}
            </div>
        </div>
    );
}
