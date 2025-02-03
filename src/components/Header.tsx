import { LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";

export default function Header() {
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleLogout = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      navigate("/auth");
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  return (
    <header className="border-b">
      <div className="container flex items-center justify-between h-16">
        <h1 className="text-xl font-bold">Running Tracker</h1>
        <Button variant="ghost" onClick={handleLogout}>
          <LogOut className="mr-2" />
          Log out
        </Button>
      </div>
    </header>
  );
}