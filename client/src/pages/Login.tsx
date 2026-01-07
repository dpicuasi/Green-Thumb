import { Button } from "@/components/ui/button";
import { Sprout } from "lucide-react";

export default function Login() {
  const handleLogin = () => {
    window.location.href = "/api/login";
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background relative overflow-hidden">
      {/* Background Decorative Elements */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/5 rounded-full blur-3xl" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-accent/10 rounded-full blur-3xl" />

      <div className="z-10 text-center space-y-8 max-w-md px-4">
        <div className="inline-flex items-center justify-center w-20 h-20 rounded-3xl bg-primary shadow-xl shadow-primary/20 rotate-3 mb-4">
          <Sprout className="w-10 h-10 text-primary-foreground" />
        </div>
        
        <div className="space-y-2">
          <h1 className="text-4xl md:text-5xl font-display font-bold text-foreground">
            Geranium Journal
          </h1>
          <p className="text-muted-foreground text-lg">
            Track, care for, and grow your personal plant collection with AI-powered insights.
          </p>
        </div>

        <Button 
          onClick={handleLogin}
          size="lg" 
          className="w-full text-lg h-14 rounded-xl bg-primary hover:bg-primary/90 shadow-lg shadow-primary/20 transition-all hover:-translate-y-0.5"
        >
          Login with Replit
        </Button>

        <div className="text-sm text-muted-foreground pt-8">
          <p>Join thousands of happy gardeners.</p>
        </div>
      </div>
    </div>
  );
}
