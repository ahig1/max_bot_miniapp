import { useQuery } from "@tanstack/react-query";
import { API_URL } from "./common";
import { DeliveryMethod } from "./city";

export interface PVZ {
    id: number;
    address: string;
}

export interface CDEKPoint {
    code: string;
    name: string;
    workTime: string;
    note: string;
    phone: string;
    address: string;
    latitude: number;
    longitude: number;
    postalCode: string;
}

export interface PvzEntry {
    id: string;
    label: string;
}

export function fetchPvz(cityId?: number, deliveryMethod?: DeliveryMethod) {
    if (!cityId) {
        return Promise.resolve([]);
    }
    if (deliveryMethod === "pickup") {
        return fetch(`${API_URL}/order_points/?city_id=${cityId}`)
        .then(response => {
            if (!response.ok) {
                throw new Error("Failed to fetch pvzs");
            }
            return response.json()
        })
        .then(data => data as PVZ[])
        .then(pvzs => pvzs.map(pvz => ({ id: pvz.id.toString(), label: pvz.address })));
    } else if (deliveryMethod === "pickupPartner") {
        return fetch(`${API_URL}/order_points/cdek/?city_id=${cityId}`)
        .then(response => {
            if (!response.ok) {
                throw new Error("Failed to fetch pvzs");
            }
            return response.json()
        })
        .then(data => data as CDEKPoint[])
        .then(cdekPoints => cdekPoints.map(cdekPoint => ({ id: cdekPoint.code, label: `${cdekPoint.name} (${cdekPoint.address})` })));
    }
    return Promise.resolve([]);
}

export function usePvzs(cityId?: number, deliveryMethod?: DeliveryMethod) {
    return useQuery({
        queryKey: ["pvz", cityId, deliveryMethod],
        queryFn: () => fetchPvz(cityId, deliveryMethod),
        staleTime: Number.POSITIVE_INFINITY,
    });
}


