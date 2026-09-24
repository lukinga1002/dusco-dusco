import { useRef } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useDuscoAuth } from "@/lib/DuscoAuthContext";
import { api } from "@/lib/duscoApi";
import { allocationSignature, canDeposit } from "@/components/dusco/deposit/depositMath";

export default function useDeposit() {
  const { user } = useDuscoAuth();
  const client = useQueryClient();
  const inFlight = useRef(false);
  const attempted = useRef(false);
  const prefix = ["dusco", user?.id];
  const mutation = useMutation({
    retry: false,
    mutationFn: async (review) => {
      attempted.current = false;
      const fresh = await api.getWallets();
      client.setQueryData([...prefix, "wallets"], fresh);
      if (!canDeposit(fresh.bahashas || []) || allocationSignature(fresh.bahashas || []) !== review.signature) throw new Error("Your bahashas or allocations have changed. Go back and review your deposit again.");
      attempted.current = true;
      return api.deposit(review.body);
    },
    onSuccess: () => { void client.invalidateQueries({ queryKey: prefix }); },
  });
  const confirm = (review) => {
    if (inFlight.current || mutation.isSuccess) return;
    inFlight.current = true;
    mutation.mutate(review, { onSettled: () => { inFlight.current = false; } });
  };
  const uncertain = mutation.isError && attempted.current && (!mutation.error.status || mutation.error.status >= 500 || mutation.error.status === 408);
  return { ...mutation, confirm, uncertain };
}