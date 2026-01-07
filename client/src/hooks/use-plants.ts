import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, buildUrl } from "@shared/routes";
import { z } from "zod";
import { useToast } from "@/hooks/use-toast";

// Types derived from schema
type Plant = z.infer<typeof api.plants.get.responses[200]>;
type InsertPlant = z.infer<typeof api.plants.create.input>;
type UpdatePlant = z.infer<typeof api.plants.update.input>;

export function usePlants() {
  const { toast } = useToast();
  
  return useQuery({
    queryKey: [api.plants.list.path],
    queryFn: async () => {
      const res = await fetch(api.plants.list.path, { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch plants");
      return api.plants.list.responses[200].parse(await res.json());
    },
  });
}

export function usePlant(id: number) {
  return useQuery({
    queryKey: [api.plants.get.path, id],
    queryFn: async () => {
      const url = buildUrl(api.plants.get.path, { id });
      const res = await fetch(url, { credentials: "include" });
      if (res.status === 404) return null;
      if (!res.ok) throw new Error("Failed to fetch plant");
      return api.plants.get.responses[200].parse(await res.json());
    },
    enabled: !!id,
  });
}

export function useCreatePlant() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (data: InsertPlant) => {
      const res = await fetch(api.plants.create.path, {
        method: api.plants.create.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
        credentials: "include",
      });
      
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || "Failed to create plant");
      }
      return api.plants.create.responses[201].parse(await res.json());
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.plants.list.path] });
      toast({ title: "Plant added", description: "Your new plant has been added to the garden." });
    },
    onError: (error: Error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });
}

export function useUpdatePlant() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ id, data }: { id: number; data: UpdatePlant }) => {
      const url = buildUrl(api.plants.update.path, { id });
      const res = await fetch(url, {
        method: api.plants.update.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
        credentials: "include",
      });

      if (!res.ok) throw new Error("Failed to update plant");
      return api.plants.update.responses[200].parse(await res.json());
    },
    onSuccess: (updatedPlant) => {
      queryClient.invalidateQueries({ queryKey: [api.plants.list.path] });
      queryClient.invalidateQueries({ queryKey: [api.plants.get.path, updatedPlant.id] });
      toast({ title: "Plant updated", description: "Changes have been saved successfully." });
    },
    onError: (error: Error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });
}

export function useDeletePlant() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (id: number) => {
      const url = buildUrl(api.plants.delete.path, { id });
      const res = await fetch(url, { method: api.plants.delete.method, credentials: "include" });
      if (!res.ok) throw new Error("Failed to delete plant");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.plants.list.path] });
      toast({ title: "Plant removed", description: "The plant has been removed from your garden." });
    },
  });
}
