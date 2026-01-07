import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@shared/routes";
import { useToast } from "@/hooks/use-toast";

export function useSubscription() {
  return useQuery({
    queryKey: [api.subscription.get.path],
    queryFn: async () => {
      const res = await fetch(api.subscription.get.path, { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch subscription");
      return api.subscription.get.responses[200].parse(await res.json());
    },
  });
}

export function useUpgradeSubscription() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async () => {
      const res = await fetch(api.subscription.upgrade.path, {
        method: api.subscription.upgrade.method,
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to upgrade subscription");
      return api.subscription.upgrade.responses[200].parse(await res.json());
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.subscription.get.path] });
      toast({ title: "Welcome to Premium!", description: "You now have access to all advanced features." });
    },
  });
}
