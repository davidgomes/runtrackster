
import { LogOut, Moon, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import { useTheme } from "@/components/theme-provider";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { User } from "lucide-react";
import { useEffect, useState } from "react";

export default function Header() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { theme, setTheme } = useTheme();
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);

  useEffect(() => {
    const fetchUserAvatar = async () => {
      const { data: userData } = await supabase.auth.getUser();
      if (userData.user) {
        const { data, error } = await supabase
          .from("profiles")
          .select("avatar_url")
          .eq("id", userData.user.id)
          .single();
        
        if (!error && data && data.avatar_url) {
          setAvatarUrl(data.avatar_url);
        }
      }
    };

    fetchUserAvatar();
  }, []);

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

  const handleProfileClick = () => {
    navigate("/profile");
  };

  return (
    <header className="border-b">
      <div className="container flex items-center justify-between h-16">
        <h1 className="text-xl font-bold">Running Tracker</h1>
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setTheme(theme === "light" ? "dark" : "light")}
          >
            {theme === "light" ? (
              <Moon className="h-5 w-5" />
            ) : (
              <Sun className="h-5 w-5" />
            )}
          </Button>
          <Button variant="ghost" onClick={handleProfileClick} className="p-1">
            <Avatar className="h-8 w-8">
              <AvatarImage src={avatarUrl || ""} alt="Profile" />
              <AvatarFallback className="bg-muted">
                <User className="h-4 w-4" />
              </AvatarFallback>
            </Avatar>
          </Button>
          <Button variant="ghost" onClick={handleLogout}>
            <LogOut className="mr-2" />
            Log out
          </Button>
        </div>
      </div>
    </header>
  );
}
