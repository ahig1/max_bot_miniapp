import { useQuery } from "@tanstack/react-query";
import { API_URL } from "./common";
import { DeliveryType } from "../pages/PersonalDataForm/PersonalDataModel";

export interface OrganizationTermsSuccess {
  text: string;
}

export interface OrganizationTermsError {
  code: number;
  message: string;
}

export type OrganizationTerms = OrganizationTermsSuccess | OrganizationTermsError;

export function fetchOrganizationTerms(
  cityId: number,
  pvzId: string,
  deliveryType: DeliveryType,
  transportCompanyId: number
) {
  return fetch(
    `${API_URL}/organization_terms/?city_id=${cityId}&pvz_id=${pvzId}&delivery_type=${deliveryType}&transport_company_id=${transportCompanyId}`
  )
    .then((response) => response.json())
    .then((data) => data as OrganizationTerms);
}

export function useOrganizationTerms(
  cityId: number,
  pvzId: string,
  deliveryType: DeliveryType,
  transportCompanyId: number
) {
  return useQuery({
    queryKey: [
      "organization-terms",
      cityId,
      pvzId,
      deliveryType,
      transportCompanyId,
    ],
    queryFn: () =>
      fetchOrganizationTerms(cityId, pvzId, deliveryType, transportCompanyId),
    staleTime: Number.POSITIVE_INFINITY,
  });
}
