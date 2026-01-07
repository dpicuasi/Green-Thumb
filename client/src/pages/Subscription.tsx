import { useSubscription, useUpgradeSubscription } from "@/hooks/use-subscription";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Check, Loader2, Crown } from "lucide-react";

export default function Subscription() {
  const { data: subscription, isLoading } = useSubscription();
  const { mutate: upgrade, isPending } = useUpgradeSubscription();

  const isPremium = subscription?.tier === 'premium';

  return (
    <div className="max-w-4xl mx-auto py-10 space-y-8 text-center">
      <div>
        <h1 className="text-4xl font-display font-bold text-foreground">Upgrade Your Gardening</h1>
        <p className="text-muted-foreground text-lg mt-2 max-w-xl mx-auto">
          Get advanced insights, unlimited history, and AI-powered care advice with our premium plan.
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-8 items-start">
        {/* Free Tier */}
        <Card className="p-8 rounded-3xl border border-border bg-white shadow-sm relative overflow-hidden">
          <div className="relative z-10">
            <h3 className="text-2xl font-bold font-display text-muted-foreground">Sprout</h3>
            <div className="text-4xl font-bold mt-4">$0 <span className="text-base font-normal text-muted-foreground">/ month</span></div>
            
            <ul className="mt-8 space-y-4 text-left mx-auto max-w-xs">
              <Feature text="Track up to 5 plants" />
              <Feature text="Basic watering reminders" />
              <Feature text="Care history log" />
            </ul>

            <Button className="w-full mt-8" variant="outline" disabled>
              Current Plan
            </Button>
          </div>
        </Card>

        {/* Premium Tier */}
        <Card className="p-8 rounded-3xl border-2 border-primary bg-primary/5 shadow-xl relative overflow-hidden transform md:-translate-y-4">
          <div className="absolute top-0 right-0 bg-primary text-white text-xs font-bold px-3 py-1 rounded-bl-xl">
            RECOMMENDED
          </div>
          
          <div className="relative z-10">
            <div className="flex items-center justify-center gap-2 mb-2">
              <Crown className="w-6 h-6 text-yellow-500 fill-yellow-500" />
            </div>
            <h3 className="text-2xl font-bold font-display text-primary">Botanist</h3>
            <div className="text-4xl font-bold mt-4 text-foreground">$5 <span className="text-base font-normal text-muted-foreground">/ month</span></div>
            
            <ul className="mt-8 space-y-4 text-left mx-auto max-w-xs">
              <Feature text="Unlimited plants" checkColor="text-primary" />
              <Feature text="AI Plant Doctor" checkColor="text-primary" />
              <Feature text="Detailed care guides" checkColor="text-primary" />
              <Feature text="Priority support" checkColor="text-primary" />
            </ul>

            <Button 
              className="w-full mt-8 bg-primary hover:bg-primary/90 shadow-lg shadow-primary/25" 
              size="lg"
              onClick={() => upgrade()}
              disabled={isPending || isPremium}
            >
              {isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              {isPremium ? "Active Plan" : "Upgrade Now"}
            </Button>
            <p className="text-xs text-muted-foreground mt-3">Cancel anytime. Secure payment.</p>
          </div>
        </Card>
      </div>
    </div>
  );
}

function Feature({ text, checkColor = "text-muted-foreground" }: { text: string, checkColor?: string }) {
  return (
    <li className="flex items-center gap-3">
      <div className={`rounded-full bg-white p-1 shadow-sm ${checkColor}`}>
        <Check className="w-3 h-3" />
      </div>
      <span className="text-sm font-medium">{text}</span>
    </li>
  );
}
