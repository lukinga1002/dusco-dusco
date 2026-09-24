import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useDuscoAuth } from "@/lib/DuscoAuthContext";
import { formatTZS } from "@/lib/duscoFormat";

export default function useBahashaMutation(mutationFn, onSaved, successMessage) {
  const client = useQueryClient();
  const { user } = useDuscoAuth();
  const prefix = ["dusco", user?.id];
  return useMutation({
    mutationFn,
    retry: false,
    onSuccess: async (result) => {
      await client.invalidateQueries({ queryKey: prefix });
      const penalty = result?.penalty !== undefined ? ` Penalty charged: ${formatTZS(result.penalty)}.` : "";
      const walletsKey = [...prefix, "wallets"];
      onSaved(successMessage + penalty, client.getQueryState(walletsKey)?.status === "success" ? client.getQueryData(walletsKey) : undefined);
    },
  });
}