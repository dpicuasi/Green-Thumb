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
import { Loader2, Camera, Upload, CheckCircle2 } from "lucide-react";
import { useState, useRef } from "react";
import { useToast } from "@/hooks/use-toast";

type FormValues = z.infer<typeof insertPlantSchema>;

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CreatePlantDialog({ open, onOpenChange }: Props) {
  const { mutate, isPending } = useCreatePlant();
  const { toast } = useToast();
  const [uploading, setUploading] = useState(false);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const form = useForm<FormValues>({
    resolver: zodResolver(insertPlantSchema),
    defaultValues: {
      name: "",
      species: "",
      location: "indoor",
      healthStatus: "healthy",
      wateringFrequency: 7,
      photoUrl: "",
    },
  });

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    const formData = new FormData();
    formData.append("image", file);

    try {
      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) throw new Error("Upload failed");

      const data = await res.json();
      form.setValue("photoUrl", data.url);
      setPhotoPreview(data.url);
      toast({
        title: "Photo uploaded",
        description: "Your plant's photo has been saved.",
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Upload failed",
        description: "Could not upload the image. Please try again.",
      });
    } finally {
      setUploading(false);
    }
  };

  const onSubmit = (data: FormValues) => {
    mutate(data, {
      onSuccess: () => {
        form.reset();
        setPhotoPreview(null);
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
            <Label>Plant Photo</Label>
            <div 
              className="relative aspect-video rounded-xl border-2 border-dashed border-border flex flex-col items-center justify-center bg-secondary/30 overflow-hidden cursor-pointer hover:bg-secondary/50 transition-colors"
              onClick={() => fileInputRef.current?.click()}
            >
              {photoPreview ? (
                <>
                  <img src={photoPreview} alt="Preview" className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                    <p className="text-white text-sm font-medium">Change Photo</p>
                  </div>
                </>
              ) : (
                <>
                  {uploading ? (
                    <Loader2 className="w-8 h-8 animate-spin text-primary" />
                  ) : (
                    <>
                      <Camera className="w-8 h-8 text-muted-foreground mb-2" />
                      <p className="text-sm text-muted-foreground">Tap to take a photo or upload</p>
                    </>
                  )}
                </>
              )}
            </div>
            <input 
              type="file" 
              ref={fileInputRef} 
              className="hidden" 
              accept="image/*" 
              capture="environment"
              onChange={handleImageUpload}
            />
            {form.getValues("photoUrl") && (
              <div className="flex items-center gap-2 text-xs text-primary mt-1">
                <CheckCircle2 className="w-3 h-3" />
                Photo ready
              </div>
            )}
          </div>

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

          <div className="flex justify-end gap-3 mt-6">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
            <Button type="submit" disabled={isPending || uploading}>
              {isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Add Plant
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
