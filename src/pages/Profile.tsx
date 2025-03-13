
import Header from "@/components/Header";
import ProfilePicture from "@/components/ProfilePicture";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function Profile() {
  return (
    <>
      <Header />
      <div className="container py-8">
        <Card>
          <CardHeader>
            <CardTitle>Profile</CardTitle>
            <CardDescription>
              Update your profile picture and manage your account.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col items-center">
            <ProfilePicture />
          </CardContent>
        </Card>
      </div>
    </>
  );
}
