import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertPlantSchema, PLANT_LOCATIONS, HEALTH_STATUSES } from "@shared/schema";
import { useCreatePlant } from "@/hooks/use-plants";
import { z } from "zod";
import { Loader2 } from "lucide-react";

type FormValues = z.infer<typeof insertPlantSchema>;

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CreatePlantDialog({ open, onOpenChange }: Props) {
  const { mutate, isPending } = useCreatePlant();
  
  const form = useForm<FormValues>({
    resolver: zodResolver(insertPlantSchema),
    defaultValues: {
      name: "",
      species: "",
      location: "indoor",
      healthStatus: "healthy",
      wateringFrequency: 7,
    },
  });

  const onSubmit = (data: FormValues) => {
    mutate(data, {
      onSuccess: () => {
        form.reset();
        onOpenChange(false);
      },
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="font-display text-2xl">Add New Plant</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 mt-4">
          <div className="space-y-2">
            <Label htmlFor="name">Plant Name</Label>
            <Input id="name" {...form.register("name")} placeholder="e.g. Monstera Mike" />
            {form.formState.errors.name && (
              <p className="text-xs text-destructive">{form.formState.errors.name.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="species">Species (Optional)</Label>
            <Input id="species" {...form.register("species")} placeholder="e.g. Monstera Deliciosa" />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Location</Label>
              <Select 
                onValueChange={(val) => form.setValue("location", val as any)}
                defaultValue={form.getValues("location")}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select location" />
                </SelectTrigger>
                <SelectContent>
                  {PLANT_LOCATIONS.map((loc) => (
                    <SelectItem key={loc} value={loc} className="capitalize">{loc}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Health</Label>
              <Select 
                onValueChange={(val) => form.setValue("healthStatus", val as any)}
                defaultValue={form.getValues("healthStatus") || "healthy"}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  {HEALTH_STATUSES.map((status) => (
                    <SelectItem key={status} value={status} className="capitalize">
                      {status.replace('_', ' ')}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="watering">Watering Frequency (Days)</Label>
            <Input 
              id="watering" 
              type="number" 
              {...form.register("wateringFrequency", { valueAsNumber: true })} 
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="photo">Photo URL (Optional)</Label>
            <Input id="photo" {...form.register("photoUrl")} placeholder="https://..." />
            <p className="text-xs text-muted-foreground">Tip: Paste an Unsplash URL for now!</p>
          </div>

          <div className="flex justify-end gap-3 mt-6">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
            <Button type="submit" disabled={isPending}>
              {isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Add Plant
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
