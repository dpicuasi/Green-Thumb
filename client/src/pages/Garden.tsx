import { usePlants } from "@/hooks/use-plants";
import { PlantCard } from "@/components/PlantCard";
import { Button } from "@/components/ui/button";
import { Plus, Search, Filter } from "lucide-react";
import { Input } from "@/components/ui/input";
import { CreatePlantDialog } from "@/components/CreatePlantDialog";
import { useState } from "react";
import { Skeleton } from "@/components/ui/skeleton";

export default function Garden() {
  const { data: plants, isLoading } = usePlants();
  const [search, setSearch] = useState("");
  const [isCreateOpen, setIsCreateOpen] = useState(false);

  const filteredPlants = plants?.filter(p => 
    p.name.toLowerCase().includes(search.toLowerCase()) || 
    p.species?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl md:text-4xl font-display font-bold text-foreground">My Garden</h1>
          <p className="text-muted-foreground mt-2">Manage and track your plant collection.</p>
        </div>
        
        <Button 
          onClick={() => setIsCreateOpen(true)}
          className="bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg shadow-primary/20 rounded-xl h-12 px-6"
        >
          <Plus className="w-5 h-5 mr-2" />
          Add New Plant
        </Button>
      </div>

      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
          <Input 
            placeholder="Search your plants..." 
            className="pl-10 h-12 rounded-xl bg-white border-border/50 focus:border-primary focus:ring-primary/20"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        {/* Future: Add Filter dropdown here */}
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-[300px] rounded-2xl bg-white border border-border/50 p-4 space-y-4">
              <Skeleton className="h-40 w-full rounded-xl" />
              <Skeleton className="h-6 w-3/4" />
              <Skeleton className="h-4 w-1/2" />
            </div>
          ))}
        </div>
      ) : filteredPlants?.length === 0 ? (
        <div className="text-center py-20 bg-white/50 rounded-3xl border border-dashed border-border">
          <div className="inline-flex justify-center items-center w-16 h-16 rounded-full bg-secondary mb-4">
            <Plus className="w-8 h-8 text-muted-foreground" />
          </div>
          <h3 className="text-xl font-bold text-foreground">No plants found</h3>
          <p className="text-muted-foreground mt-2 mb-6">Start your digital garden by adding your first plant.</p>
          <Button onClick={() => setIsCreateOpen(true)} variant="outline">Add Plant</Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredPlants?.map((plant) => (
            <PlantCard key={plant.id} plant={plant} />
          ))}
        </div>
      )}

      <CreatePlantDialog open={isCreateOpen} onOpenChange={setIsCreateOpen} />
    </div>
  );
}
