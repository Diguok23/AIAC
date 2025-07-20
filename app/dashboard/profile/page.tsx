import { User, Mail, Phone, MapPin } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"

export default function DashboardProfilePage() {
  // Placeholder for user data - in a real app, this would be fetched from Supabase
  const userProfile = {
    name: "John Doe",
    email: "john.doe@example.com",
    phone: "+1 (555) 123-4567",
    address: "123 Main St, Anytown, USA",
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold tracking-tight">My Profile</h1>

      <Card>
        <CardHeader>
          <CardTitle>Personal Information</CardTitle>
          <CardDescription>Manage your profile details.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center space-x-3">
            <User className="h-5 w-5 text-muted-foreground" />
            <p className="text-sm font-medium">Name: {userProfile.name}</p>
          </div>
          <div className="flex items-center space-x-3">
            <Mail className="h-5 w-5 text-muted-foreground" />
            <p className="text-sm font-medium">Email: {userProfile.email}</p>
          </div>
          <div className="flex items-center space-x-3">
            <Phone className="h-5 w-5 text-muted-foreground" />
            <p className="text-sm font-medium">Phone: {userProfile.phone}</p>
          </div>
          <div className="flex items-center space-x-3">
            <MapPin className="h-5 w-5 text-muted-foreground" />
            <p className="text-sm font-medium">Address: {userProfile.address}</p>
          </div>
          <Button asChild>
            <Link href="/dashboard/settings">Edit Profile</Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
