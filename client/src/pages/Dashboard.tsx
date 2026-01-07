import { usePlants } from "@/hooks/use-plants";
import { useAuth } from "@/hooks/use-auth";
import { format } from "date-fns";
import { Droplets, Calendar, AlertTriangle, ArrowRight } from "lucide-react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export default function Dashboard() {
  const { user } = useAuth();
  const { data: plants, isLoading } = usePlants();

  const needsAttention = plants?.filter(p => 
    (p.nextWatering && new Date(p.nextWatering) <= new Date()) || 
    p.healthStatus !== 'healthy'
  );

  const healthyCount = plants?.filter(p => p.healthStatus === 'healthy').length || 0;
  const totalPlants = plants?.length || 0;

  return (
    <div className="space-y-8">
      <div className="mb-8">
        <h1 className="text-4xl font-display font-bold text-foreground">
          Good Morning, {user?.firstName || "Gardener"}
        </h1>
        <p className="text-muted-foreground text-lg mt-2">
          Today is {format(new Date(), 'EEEE, MMMM do')}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard 
          label="Total Plants" 
          value={totalPlants} 
          sub="In your collection"
          loading={isLoading}
        />
        <StatCard 
          label="Healthy" 
          value={healthyCount} 
          sub={`${Math.round((healthyCount / (totalPlants || 1)) * 100)}% of garden`}
          loading={isLoading}
          color="text-green-600"
        />
        <StatCard 
          label="Needs Care" 
          value={needsAttention?.length || 0} 
          sub="Requires attention"
          loading={isLoading}
          color="text-orange-600"
        />
      </div>

      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-display font-bold">Needs Attention</h2>
          <Link href="/">
            <Button variant="link" className="text-primary">View All Garden <ArrowRight className="w-4 h-4 ml-1" /></Button>
          </Link>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Skeleton className="h-24 w-full rounded-xl" />
            <Skeleton className="h-24 w-full rounded-xl" />
          </div>
        ) : needsAttention?.length === 0 ? (
          <div className="bg-green-50 border border-green-100 rounded-2xl p-8 text-center">
            <div className="w-12 h-12 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-3">
              <SparklesIcon />
            </div>
            <h3 className="text-lg font-bold text-green-800">All plants are happy!</h3>
            <p className="text-green-600">Great job keeping up with your garden.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {needsAttention?.map(plant => (
              <Link key={plant.id} href={`/plants/${plant.id}`}>
                <div className="bg-white p-4 rounded-xl border border-border/50 shadow-sm hover:shadow-md transition-all cursor-pointer flex items-center gap-4">
                  <div className="w-16 h-16 rounded-lg bg-secondary overflow-hidden shrink-0">
                    {plant.photoUrl ? (
                      <img src={plant.photoUrl} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full bg-orange-100 flex items-center justify-center text-orange-400">
                        <AlertTriangle className="w-6 h-6" />
                      </div>
                    )}
                  </div>
                  <div>
                    <h4 className="font-bold text-foreground">{plant.name}</h4>
                    <div className="flex items-center gap-2 mt-1 text-sm text-orange-600 font-medium">
                      <Droplets className="w-3.5 h-3.5" />
                      <span>Water Now</span>
                    </div>
                  </div>
                  <div className="ml-auto">
                    <Button size="icon" variant="ghost" className="rounded-full">
                      <ArrowRight className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

function StatCard({ label, value, sub, loading, color = "text-foreground" }: any) {
  if (loading) return <Skeleton className="h-32 w-full rounded-2xl" />;
  
  return (
    <Card className="p-6 rounded-2xl border-none shadow-sm bg-white">
      <div className="text-sm text-muted-foreground uppercase tracking-wide font-medium">{label}</div>
      <div className={`text-4xl font-display font-bold mt-2 ${color}`}>{value}</div>
      <div className="text-sm text-muted-foreground mt-1">{sub}</div>
    </Card>
  );
}

function SparklesIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"/><path d="M5 3v4"/><path d="M9 5H5"/><path d="M19 15v4"/><path d="M15 17h4"/></svg>
  );
}
