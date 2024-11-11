// src/components/TopBar.tsx

import { InputText } from "primereact/inputtext";
import { IconField } from "primereact/iconfield";
import { InputIcon } from "primereact/inputicon";
import { Chip } from "primereact/chip";
import SideBarCustom from "./SideBarCustom";

function HomePageTopBar() {
    return (
        <div className="search-container md:flex-row align-items-center md:px-4 px-2">
            <div className="flex">
                <SideBarCustom isOnMap={true} />
                <IconField iconPosition="right">
                    <InputIcon className="pi pi-search"> </InputIcon>
                    <InputText
                        placeholder="Rechercher"
                        className="border-round-3xl shadow-6 hover:shadow-8"
                    />
                </IconField>
            </div>
            <div className="chip-container">
                <Chip label="Circuits" icon="fa fa-road" className="mr-2 shadow-3" key={1} />
                <Chip label="Moniteurs" icon="fa-solid fa-chalkboard-user" className="mr-2 shadow-3" key={2} />
            </div>
        </div>
    );
};

export default HomePageTopBar;
