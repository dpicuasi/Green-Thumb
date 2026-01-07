import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, buildUrl } from "@shared/routes";
import { z } from "zod";
import { useToast } from "@/hooks/use-toast";

type CareLog = z.infer<typeof api.careLogs.list.responses[200]>[number];
type InsertCareLog = z.infer<typeof api.careLogs.create.input>;

export function useCareLogs(plantId: number) {
  return useQuery({
    queryKey: [api.careLogs.list.path, plantId],
    queryFn: async () => {
      if (!plantId) return [];
      const url = buildUrl(api.careLogs.list.path, { plantId });
      const res = await fetch(url, { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch care logs");
      return api.careLogs.list.responses[200].parse(await res.json());
    },
    enabled: !!plantId,
  });
}

export function useCreateCareLog() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ plantId, data }: { plantId: number; data: InsertCareLog }) => {
      const url = buildUrl(api.careLogs.create.path, { plantId });
      const res = await fetch(url, {
        method: api.careLogs.create.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
        credentials: "include",
      });

      if (!res.ok) throw new Error("Failed to log care");
      return api.careLogs.create.responses[201].parse(await res.json());
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: [api.careLogs.list.path, variables.plantId] });
      // Also invalidate plant details as lastWatered might have changed
      queryClient.invalidateQueries({ queryKey: [api.plants.get.path, variables.plantId] });
      queryClient.invalidateQueries({ queryKey: [api.plants.list.path] });
      
      toast({ title: "Care logged", description: "Great job taking care of your plant!" });
    },
  });
}
