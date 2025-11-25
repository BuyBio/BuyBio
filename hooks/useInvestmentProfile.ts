import { apiClient } from "@/lib/api-client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

const investmentProfileKeys = {
  all: ["investment-profile"] as const,
};

export interface InvestmentProfile {
  id?: string;
  selections: string[];
  updatedAt?: string;
  createdAt?: string;
}

interface InvestmentProfileResponse {
  profile: InvestmentProfile | null;
}

const fetchInvestmentProfile = async (): Promise<InvestmentProfile | null> => {
  const response = await apiClient.get<InvestmentProfileResponse>(
    "/api/investment-profile",
  );
  return response.data.profile;
};

const saveInvestmentProfile = async (
  selections: string[],
): Promise<InvestmentProfile> => {
  const response = await apiClient.post<InvestmentProfileResponse>(
    "/api/investment-profile",
    { selections },
  );
  if (!response.data.profile) {
    throw new Error("투자 성향을 저장하지 못했습니다.");
  }
  return response.data.profile;
};

export const useInvestmentProfileQuery = () =>
  useQuery({
    queryKey: investmentProfileKeys.all,
    queryFn: fetchInvestmentProfile,
  });

export const useSaveInvestmentProfileMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: saveInvestmentProfile,
    onSuccess: (profile) => {
      queryClient.setQueryData(investmentProfileKeys.all, profile);
    },
  });
};
