
export type DeliveryType = "courier" | "pickup" | "pickupPartner"

export interface DeliveryOption {
    type: DeliveryType;
    label: string;
}

export const deliveryOptions: DeliveryOption[] = [
    { type: "courier", label: "Доставка" },
    { type: "pickup", label: "Самовывоз из ПВ АвтоТО" },
    { type: "pickupPartner", label: "Самовывоз из ПВ партнёров/ТК" },
]

export interface PersonalData {
    deliveryType: DeliveryType;
    pvzId: string | undefined;
    pvzName: string | undefined;
    cityId: number;
    cityName: string;
    name: string;
    lastName: string;
    transportCompanyId: number | undefined;
}
