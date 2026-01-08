import { usePlant, useUpdatePlant, useDeletePlant } from "@/hooks/use-plants";
import { useCareLogs, useCreateCareLog } from "@/hooks/use-care-logs";
import { useRoute, Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Droplets, Calendar, MessageCircle, MoreVertical, Plus, Trash2, Edit } from "lucide-react";
import { format } from "date-fns";
import { Dialog, DialogContent, DialogTrigger, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CARE_TYPES, PLANT_LOCATIONS, HEALTH_STATUSES } from "@shared/schema";
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";

export default function PlantDetail() {
  const [, params] = useRoute("/plants/:id");
  const [, setLocation] = useLocation();
  const plantId = Number(params?.id);
  const { data: plant, isLoading } = usePlant(plantId);
  const { data: logs } = useCareLogs(plantId);
  const { mutate: logCare, isPending: isLogging } = useCreateCareLog();
  const { mutate: updatePlant, isPending: isUpdating } = useUpdatePlant();
  const { mutate: deletePlant, isPending: isDeleting } = useDeletePlant();
  const [careType, setCareType] = useState<string>("water");
  const [careNotes, setCareNotes] = useState("");
  const [isLogOpen, setIsLogOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const { toast } = useToast();

  // Edit form state
  const [editName, setEditName] = useState("");
  const [editSpecies, setEditSpecies] = useState("");
  const [editLocation, setEditLocation] = useState("");
  const [editFrequency, setEditFrequency] = useState(7);
  const [editHealth, setEditHealth] = useState("");

  useEffect(() => {
    if (plant) {
      setEditName(plant.name);
      setEditSpecies(plant.species || "");
      setEditLocation(plant.location);
      setEditFrequency(plant.wateringFrequency || 7);
      setEditHealth(plant.healthStatus || "healthy");
    }
  }, [plant]);

  if (isLoading) return <div className="p-8 text-center">Loading plant details...</div>;
  if (!plant) return <div className="p-8 text-center">Plant not found</div>;

  const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updatePlant({
      id: plantId,
      data: {
        name: editName,
        species: editSpecies,
        location: editLocation,
        wateringFrequency: editFrequency,
        healthStatus: editHealth
      }
    }, {
      onSuccess: () => {
        setIsEditOpen(false);
        toast({ title: "Plant updated", description: "Your changes have been saved." });
      }
    });
  };

  const handleDeleteConfirm = () => {
    deletePlant(plantId, {
      onSuccess: () => {
        setIsDeleteOpen(false);
        setLocation("/");
        toast({ title: "Plant deleted", description: "The plant has been removed from your garden." });
      }
    });
  };

  const handleQuickWater = () => {
    logCare({ 
      plantId, 
      data: { 
        type: "water", 
        notes: "Quick water action",
        date: new Date().toISOString()
      } 
    });
    // Optimistically update last watered
    updatePlant({ 
      id: plantId, 
      data: { lastWatered: new Date().toISOString() } 
    });
  };

  const handleLogSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    logCare({
      plantId,
      data: {
        type: careType,
        notes: careNotes,
        date: new Date().toISOString()
      }
    }, {
      onSuccess: () => {
        setIsLogOpen(false);
        setCareNotes("");
        // If water was logged, update the plant's lastWatered date
        if (careType === "water") {
          updatePlant({ 
            id: plantId, 
            data: { lastWatered: new Date().toISOString() } 
          });
        }
      }
    });
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-20">
      {/* Header Navigation */}
      <Link href="/">
        <Button variant="ghost" className="pl-0 hover:bg-transparent hover:text-primary mb-4">
          <ArrowLeft className="w-5 h-5 mr-2" />
          Back to Garden
        </Button>
      </Link>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Left Column: Image & Quick Actions */}
        <div className="md:col-span-1 space-y-6">
          <div className="aspect-[3/4] rounded-3xl overflow-hidden bg-secondary shadow-lg relative">
            {plant.photoUrl ? (
              <img src={plant.photoUrl} alt={plant.name} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-secondary/50 text-muted-foreground">
                No Photo
              </div>
            )}
            <Badge className="absolute top-4 right-4 capitalize bg-white/90 text-foreground backdrop-blur shadow-sm hover:bg-white">
              {plant.healthStatus?.replace('_', ' ')}
            </Badge>
          </div>

          <div className="flex flex-col gap-3">
            <Button 
              size="lg" 
              className="w-full bg-blue-600 hover:bg-blue-700 shadow-lg shadow-blue-900/20"
              onClick={handleQuickWater}
            >
              <Droplets className="w-5 h-5 mr-2" />
              Water Plant
            </Button>
            
            <Link href={`/ai-advisor?context=${plant.name}`}>
              <Button variant="outline" size="lg" className="w-full border-primary/20 hover:bg-primary/5 hover:text-primary">
                <MessageCircle className="w-5 h-5 mr-2" />
                Ask AI Advisor
              </Button>
            </Link>
          </div>
        </div>

        {/* Right Column: Details & History */}
        <div className="md:col-span-2 space-y-8">
          <div>
            <div className="flex justify-between items-start">
              <div>
                <h1 className="text-4xl font-display font-bold text-foreground mb-2">{plant.name}</h1>
                <p className="text-xl text-muted-foreground">{plant.species}</p>
              </div>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon">
                    <MoreVertical className="w-5 h-5" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => setIsEditOpen(true)} className="gap-2">
                    <Edit className="w-4 h-4" />
                    Edit Plant
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setIsDeleteOpen(true)} className="gap-2 text-destructive focus:text-destructive">
                    <Trash2 className="w-4 h-4" />
                    Delete Plant
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            {/* Edit Dialog */}
            <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
              <DialogContent className="sm:max-w-md">
                <DialogHeader>
                  <DialogTitle>Edit Plant</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleEditSubmit} className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Name</Label>
                    <Input id="name" value={editName} onChange={e => setEditName(e.target.value)} required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="species">Species (Optional)</Label>
                    <Input id="species" value={editSpecies} onChange={e => setEditSpecies(e.target.value)} />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="location">Location</Label>
                      <Select value={editLocation} onValueChange={setEditLocation}>
                        <SelectTrigger id="location">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {PLANT_LOCATIONS.map(l => (
                            <SelectItem key={l} value={l} className="capitalize">{l}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="health">Health Status</Label>
                      <Select value={editHealth} onValueChange={setEditHealth}>
                        <SelectTrigger id="health">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {HEALTH_STATUSES.map(s => (
                            <SelectItem key={s} value={s} className="capitalize">{s.replace('_', ' ')}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="frequency">Watering Frequency (days)</Label>
                    <Input 
                      id="frequency" 
                      type="number" 
                      value={editFrequency} 
                      onChange={e => setEditFrequency(Number(e.target.value))} 
                      min={1}
                    />
                  </div>
                  <DialogFooter>
                    <Button type="button" variant="outline" onClick={() => setIsEditOpen(false)}>Cancel</Button>
                    <Button type="submit" disabled={isUpdating}>
                      {isUpdating ? "Saving..." : "Save Changes"}
                    </Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>

            {/* Delete Confirmation Dialog */}
            <Dialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Delete Plant</DialogTitle>
                  <DialogDescription>
                    Are you sure you want to delete {plant.name}? This action cannot be undone and all care history will be lost.
                  </DialogDescription>
                </DialogHeader>
                <DialogFooter className="gap-2 sm:gap-0">
                  <Button variant="outline" onClick={() => setIsDeleteOpen(false)}>Cancel</Button>
                  <Button variant="destructive" onClick={handleDeleteConfirm} disabled={isDeleting}>
                    {isDeleting ? "Deleting..." : "Delete Plant"}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
            
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6">
              <DetailBox label="Location" value={plant.location} icon={null} />
              <DetailBox 
                label="Water Every" 
                value={`${plant.wateringFrequency} days`} 
                icon={<Calendar className="w-4 h-4 text-primary" />} 
              />
              <DetailBox 
                label="Last Watered" 
                value={plant.lastWatered ? format(new Date(plant.lastWatered), 'MMM d') : 'Never'} 
                icon={<Droplets className="w-4 h-4 text-blue-500" />} 
              />
              <DetailBox 
                label="Next Due" 
                value={plant.nextWatering ? format(new Date(plant.nextWatering), 'MMM d') : 'ASAP'} 
                icon={<Calendar className="w-4 h-4 text-orange-500" />} 
              />
            </div>
          </div>

          <div className="bg-white rounded-3xl border border-border/50 p-6 shadow-sm">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold font-display">Care History</h3>
              <Dialog open={isLogOpen} onOpenChange={setIsLogOpen}>
                <DialogTrigger asChild>
                  <Button variant="outline" size="sm">
                    <Plus className="w-4 h-4 mr-2" />
                    Log Activity
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <h2 className="text-xl font-bold mb-4">Log Plant Care</h2>
                  <form onSubmit={handleLogSubmit} className="space-y-4">
                    <div className="space-y-2">
                      <Label>Activity Type</Label>
                      <Select value={careType} onValueChange={setCareType}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {CARE_TYPES.map(t => (
                            <SelectItem key={t} value={t} className="capitalize">{t}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>Notes</Label>
                      <Input 
                        value={careNotes} 
                        onChange={e => setCareNotes(e.target.value)} 
                        placeholder="Added fertilizer, pruned leaves..."
                      />
                    </div>
                    <Button type="submit" className="w-full" disabled={isLogging}>
                      {isLogging ? "Saving..." : "Save Log"}
                    </Button>
                  </form>
                </DialogContent>
              </Dialog>
            </div>

            <div className="space-y-4">
              {logs && logs.length > 0 ? (
                logs.map((log) => (
                  <div key={log.id} className="flex gap-4 items-start p-3 hover:bg-secondary/20 rounded-xl transition-colors">
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                      {log.type === 'water' ? <Droplets className="w-5 h-5 text-blue-500" /> : 
                       log.type === 'prune' ? <span className="text-lg">✂️</span> : 
                       <span className="text-lg">🌿</span>}
                    </div>
                    <div>
                      <p className="font-medium capitalize text-foreground">{log.type}</p>
                      <p className="text-sm text-muted-foreground">{log.notes || "No notes added."}</p>
                    </div>
                    <div className="ml-auto text-xs text-muted-foreground font-mono">
                      {format(new Date(log.date), 'MMM d, h:mm a')}
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  No care history yet.
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function DetailBox({ label, value, icon }: { label: string, value: string, icon: React.ReactNode }) {
  return (
    <div className="bg-secondary/30 p-4 rounded-2xl border border-secondary">
      <div className="text-xs text-muted-foreground mb-1 uppercase tracking-wider">{label}</div>
      <div className="font-semibold text-foreground flex items-center gap-2 capitalize">
        {icon}
        {value}
      </div>
    </div>
  );
}
