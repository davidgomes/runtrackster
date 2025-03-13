
import { useState, useEffect } from "react";
import { User, Camera } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { useProfile } from "@/context/ProfileContext";

export default function ProfilePicture() {
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [user, setUser] = useState<any>(null);
  const { toast } = useToast();
  const { setAvatarUrl: setGlobalAvatarUrl, refreshAvatar } = useProfile();

  useEffect(() => {
    const fetchUser = async () => {
      const { data } = await supabase.auth.getUser();
      if (data.user) {
        setUser(data.user);
        fetchProfile(data.user.id);
      }
    };

    fetchUser();
  }, []);

  const fetchProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("avatar_url")
        .eq("id", userId)
        .single();

      if (error) throw error;
      if (data && data.avatar_url) {
        setAvatarUrl(data.avatar_url);
        setGlobalAvatarUrl(data.avatar_url);
      }
    } catch (error: any) {
      console.error("Error fetching profile:", error.message);
    }
  };

  const uploadAvatar = async (event: React.ChangeEvent<HTMLInputElement>) => {
    if (!event.target.files || !event.target.files.length) {
      return;
    }

    const file = event.target.files[0];
    const fileExt = file.name.split(".").pop();
    const filePath = `${user.id}/${Math.random().toString(36).substring(2)}.${fileExt}`;

    setUploading(true);

    try {
      // Upload file to storage
      const { error: uploadError } = await supabase.storage
        .from("profiles")
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      // Get public URL
      const { data } = supabase.storage.from("profiles").getPublicUrl(filePath);
      
      // Update profile with avatar URL
      const { error: updateError } = await supabase
        .from("profiles")
        .update({ avatar_url: data.publicUrl })
        .eq("id", user.id);
      
      if (updateError) throw updateError;

      setAvatarUrl(data.publicUrl);
      setGlobalAvatarUrl(data.publicUrl);
      refreshAvatar(); // Trigger a refresh in other components

      toast({
        title: "Success",
        description: "Profile picture updated!",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="relative">
        <Avatar className="h-24 w-24">
          <AvatarImage src={avatarUrl || ""} alt="Profile" />
          <AvatarFallback className="bg-muted">
            <User className="h-12 w-12" />
          </AvatarFallback>
        </Avatar>
        <label 
          htmlFor="avatar-upload" 
          className="absolute -bottom-2 -right-2 rounded-full bg-primary p-2 cursor-pointer hover:bg-primary/90 transition-colors"
        >
          <Camera className="h-4 w-4 text-primary-foreground" />
          <input 
            type="file" 
            id="avatar-upload" 
            accept="image/*" 
            onChange={uploadAvatar} 
            disabled={uploading}
            className="hidden" 
          />
        </label>
      </div>
      {uploading && <p className="text-sm text-muted-foreground">Uploading...</p>}
    </div>
  );
}
