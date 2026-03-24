import { OrganizationTerms as OrganizationTermsType, useOrganizationTerms } from "../../api/organizationTerms";
import { Loading } from "../../components/Loading/Loading";
import { DeliveryType } from "../PersonalDataForm/PersonalDataModel";

interface OrganizationTermsProps {
  cityId: number;
  pvzId: string;
  deliveryType: DeliveryType;
  transportCompanyId: number;
}

export function OrganizationTerms({ cityId, pvzId, deliveryType, transportCompanyId }: OrganizationTermsProps) {
  const { data, isLoading } = useOrganizationTerms(cityId, pvzId, deliveryType, transportCompanyId);
  return isLoading ? (
    <Loading />
  ) : (
    <OrganizationTermsContent data={data} />
  );
}

function OrganizationTermsContent({ data }: { data: OrganizationTermsType | undefined }) {
  if (data && "text" in data) {
    return <div dangerouslySetInnerHTML={{ __html: data.text }} />;
  }
  return (
    <>
      <div>Произошла ошибка</div>
      <div>{data?.message}</div>
    </>
  );
}

export default OrganizationTerms;
