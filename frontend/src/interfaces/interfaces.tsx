export interface Centre {
    id: number;
    name: string;
    lat: number | null;
    long: number | null;
    formattedAddress: {
        address: string;
        city: string;
        cp: string;
    };
}