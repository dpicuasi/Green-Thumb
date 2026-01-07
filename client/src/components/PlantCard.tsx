import { Plant, HEALTH_STATUSES } from "@shared/schema";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Droplets, Sun, Wind, Calendar } from "lucide-react";
import { format, differenceInDays } from "date-fns";
import { Link } from "wouter";
import { cn } from "@/lib/utils";

interface PlantCardProps {
  plant: Plant;
}

export function PlantCard({ plant }: PlantCardProps) {
  const needsWater = plant.nextWatering && new Date(plant.nextWatering) <= new Date();
  const daysUntilWater = plant.nextWatering 
    ? differenceInDays(new Date(plant.nextWatering), new Date()) 
    : null;

  const statusColors = {
    healthy: "bg-green-100 text-green-700 border-green-200",
    needs_attention: "bg-yellow-100 text-yellow-700 border-yellow-200",
    sick: "bg-red-100 text-red-700 border-red-200",
  };

  return (
    <Link href={`/plants/${plant.id}`}>
      <div className="group cursor-pointer">
        <Card className="overflow-hidden border-border/50 bg-card hover:shadow-lg hover:shadow-primary/5 hover:-translate-y-1 transition-all duration-300 h-full flex flex-col">
          <div className="relative aspect-[4/3] overflow-hidden bg-secondary">
            {plant.photoUrl ? (
              <img 
                src={plant.photoUrl} 
                alt={plant.name}
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-muted-foreground/30 bg-secondary/50">
                <SproutPattern />
              </div>
            )}
            
            <div className="absolute top-3 right-3 flex gap-2">
              <Badge variant="outline" className={cn("capitalize backdrop-blur-sm shadow-sm", statusColors[plant.healthStatus as keyof typeof statusColors])}>
                {plant.healthStatus?.replace('_', ' ')}
              </Badge>
            </div>
          </div>
          
          <div className="p-5 flex flex-col flex-1">
            <h3 className="font-display text-xl font-bold text-foreground mb-1 group-hover:text-primary transition-colors">
              {plant.name}
            </h3>
            <p className="text-muted-foreground text-sm mb-4 line-clamp-1">
              {plant.species || "Unknown Species"}
            </p>

            <div className="mt-auto grid grid-cols-2 gap-3">
              <div className="flex items-center gap-2 text-sm text-muted-foreground bg-secondary/30 p-2 rounded-lg">
                <Sun className="w-4 h-4 text-orange-400" />
                <span className="capitalize">{plant.location}</span>
              </div>
              
              <div className={cn(
                "flex items-center gap-2 text-sm p-2 rounded-lg transition-colors",
                needsWater ? "bg-blue-50 text-blue-700 font-medium" : "bg-secondary/30 text-muted-foreground"
              )}>
                <Droplets className={cn("w-4 h-4", needsWater && "fill-blue-400 text-blue-400")} />
                <span>
                  {needsWater 
                    ? "Water now!" 
                    : daysUntilWater !== null 
                      ? `${daysUntilWater} days` 
                      : "No schedule"}
                </span>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </Link>
  );
}

function SproutPattern() {
  return (
    <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round">
      <path d="M7 20h10" />
      <path d="M10 20c5.5-2.5.8-6.4 3-10" />
      <path d="M9.5 9.4c1.1.8 1.8 2.2 2.3 3.7-2 .4-3.5.4-4.8-.3-1.2-.6-2.3-1.9-3-4.2 2.8-.5 4.4 0 5.5.8z" />
      <path d="M14.1 6a7 7 0 0 0-1.1 4c1.9-.1 3.3-.6 4.3-1.4 1-1 1.6-2.3 1.7-4.6-2.7.1-4 1-4.9 2z" />
    </svg>
  );
}
