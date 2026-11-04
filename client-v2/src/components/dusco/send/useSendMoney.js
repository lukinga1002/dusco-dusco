import { useRef } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useDuscoAuth } from "@/lib/DuscoAuthContext";
import { api } from "@/lib/duscoApi";
import { fetchSendFee, sourceError } from "@/components/dusco/send/sendMoneyRules";

export default function useSendMoney() {
  const { user } = useDuscoAuth();
  const client = useQueryClient();
  const inFlight = useRef(false);
  // One key per transfer attempt, reused across retries of that attempt so a
  // repeat cannot send the money twice. Cleared on success.
  const idempotencyKey = useRef(null);
  const attempted = useRef(false);
  const prefix = ["dusco", user?.id];
  const mutation = useMutation({
    retry: false,
    mutationFn: async (review) => {
      attempted.current = false;
      const fresh = await api.getWallets();
      client.setQueryData([...prefix, "wallets"], fresh);
      const wallet = (fresh.bahashas || []).find((item) => String(item.id) === String(review.body.bahashaId));
      const problem = sourceError(wallet, review.body.amount);
      if (problem) throw new Error(problem);
      const quote = await fetchSendFee(review.body);
      if (quote.fee !== review.quote.fee || quote.feeWaived !== review.quote.feeWaived) throw new Error("Your fee has changed. Choose Edit details and review the updated fee before sending.");
      if (review.body.amount <= quote.fee) throw new Error("Your amount must be larger than the fee.");
      attempted.current = true;
      return api.withdraw(review.body, idempotencyKey.current);
    },
    onSuccess: () => { idempotencyKey.current = null; void client.invalidateQueries({ queryKey: prefix }); },
  });
  const uncertain = mutation.isError && attempted.current && (!mutation.error.status || mutation.error.status >= 500 || mutation.error.status === 408);
  const confirm = (review) => {
    if (inFlight.current || mutation.isSuccess || uncertain) return;
    if (!idempotencyKey.current) {
      idempotencyKey.current = (crypto.randomUUID?.() || `k${Date.now()}${Math.random().toString(36).slice(2)}`);
    }
    inFlight.current = true;
    mutation.mutate(review, { onSettled: () => { inFlight.current = false; } });
  };
  return { ...mutation, confirm, uncertain };
}