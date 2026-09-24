import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useDuscoAuth } from "@/lib/DuscoAuthContext";
import { fetchSendFee, sourceError } from "@/components/dusco/send/sendMoneyRules";

export default function useSendFee(wallet, amount) {
  const { user } = useDuscoAuth();
  const [debouncedAmount, setDebouncedAmount] = useState(amount);
  useEffect(() => { const timer = setTimeout(() => setDebouncedAmount(amount), 400); return () => clearTimeout(timer); }, [amount]);
  const valid = !sourceError(wallet, amount);
  const settled = amount === debouncedAmount;
  const query = useQuery({
    queryKey: ["dusco", user?.id, "send-fee", wallet?.id, debouncedAmount],
    queryFn: () => fetchSendFee({ bahashaId: wallet.id, amount: debouncedAmount }),
    enabled: valid && settled, retry: false, staleTime: 0, refetchOnWindowFocus: false,
  });
  return { quote: query.data, ready: valid && settled && !query.isFetching && !query.isError && Boolean(query.data), error: valid && settled ? query.error : null, refetch: query.refetch };
}