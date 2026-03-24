import { useQuery } from "@tanstack/react-query";
import { API_URL } from "./common";

export interface City {
    id: number;
    name: string;
}

export function fetchCities(query: string) {
    if (query.length < 3) {
        return [];
    }
    return fetch(`${API_URL}/cities/?query=${query}`)
        .then(response => {
            if (!response.ok) {
                throw new Error("Failed to fetch cities");
            }
            return response.json()
        })
        .then(data => data as City[]);
}

export function useCities(query: string) {
    return useQuery({
        queryKey: ["cities", query],
        queryFn: () => fetchCities(query),
        staleTime: Number.POSITIVE_INFINITY,
    });
}

export type DeliveryMethod = "courier" | "pickup" | "pickupPartner";

export function fetchCityDeliveryMethods(cityId: number | undefined) {
    if (!cityId) {
        return [];
    }
    return fetch(`${API_URL}/cities/${cityId}/delivery_methods/`)
        .then(response => {
            if (!response.ok) {
                throw new Error("Failed to fetch city delivery methods");
            }
            return response.json()
        })
        .then(data => data as DeliveryMethod[]);
}



export function useCityDeliveryMethods(cityId: number | undefined) {
    return useQuery({
        queryKey: ["cityDeliveryMethods", cityId],
        queryFn: () => fetchCityDeliveryMethods(cityId),
        staleTime: Number.POSITIVE_INFINITY,
    });
}

export interface TransportCompany {
    id: number;
    title: string;
    price: number;
    deliveryDayMin: number;
    deliveryDayMax: number;
    delivery: boolean;
    outputPlaceEnable: boolean;
    description: string;
    ico: string;
}

export function fetchCityTransportCompanies(cityId: number | undefined) {
    if (!cityId) {
        return [];
    }
    return fetch(`${API_URL}/cities/${cityId}/transport_companies/`)
        .then(response => {
            if (!response.ok) {
                throw new Error("Failed to fetch city transport companies");
            }
            return response.json()
        })
        .then(data => data as TransportCompany[]);
}

export function useCityTransportCompanies(cityId: number | undefined) {
    return useQuery({
        queryKey: ["cityTransportCompanies", cityId],
        queryFn: () => fetchCityTransportCompanies(cityId),
        staleTime: Number.POSITIVE_INFINITY,
    });
}
