// DetailCentreMap.tsx

import React from "react";
import { Dialog } from 'primereact/dialog';
import { Button } from 'primereact/button'

interface CentreDetailsProps {
    visible: boolean;
    onHide: () => void;
    centre: {
        name: string;
        address: string;
        city: string;
        postalCode: string;
    };
}

const DetailsCentreMap: React.FC<CentreDetailsProps> = ({ visible, onHide, centre }) => {
    return (
        <div className="centre-modal">
            <Dialog header={centre.name} visible={visible} style={{ width: '50vw' }} onHide={onHide}>
                <p><strong>Adresse:</strong> {centre.address}</p>
                <p><strong>Ville:</strong> {centre.city}</p>
                <p><strong>Code Postal:</strong> {centre.postalCode}</p>
                <Button label="Réussir mon Examen" className="p-button-outlined reussir"/>
            </Dialog>
        </div>
    );
};

export default DetailsCentreMap;
