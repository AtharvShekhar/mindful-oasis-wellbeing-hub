
import { useState, useEffect } from "react";
import { Layout } from "@/components/layout/Layout";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/components/AuthProvider";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { CalendarIcon, Edit2Icon, SaveIcon, UserIcon, ClipboardIcon, SettingsIcon, CheckIcon, BellIcon, ShieldIcon, LogOutIcon } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const Profile = () => {
  const { user, signOut } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState(null);
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState({
    full_name: "",
    bio: "",
    email: "",
    phone: "",
    avatar_url: "",
  });

  // Mock data for demonstration
  const healthMetrics = {
    mood: 75,
    sleep: 85,
    anxiety: 40,
    progress: 65,
  };

  const activityData = [
    { name: "Mon", sessions: 1 },
    { name: "Tue", sessions: 0 },
    { name: "Wed", sessions: 2 },
    { name: "Thu", sessions: 1 },
    { name: "Fri", sessions: 3 },
    { name: "Sat", sessions: 0 },
    { name: "Sun", sessions: 1 },
  ];

  useEffect(() => {
    async function loadProfile() {
      setLoading(true);
      try {
        if (user) {
          // Get profile data
          const { data, error } = await supabase
            .from("profiles")
            .select("*")
            .eq("id", user.id)
            .single();

          if (error) {
            console.error("Error fetching profile:", error);
            throw error;
          }

          setProfile(data);
          setFormData({
            full_name: data?.full_name || "",
            bio: data?.bio || "",
            email: user.email || "",
            phone: data?.phone || "",
            avatar_url: data?.avatar_url || "",
          });
        }
      } catch (error) {
        console.error("Error loading profile:", error);
        toast({
          title: "Error loading profile",
          description: "Please try again later",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    }

    loadProfile();
  }, [user, toast]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSaveProfile = async () => {
    try {
      const { error } = await supabase
        .from("profiles")
        .update({
          full_name: formData.full_name,
          bio: formData.bio,
          phone: formData.phone,
          avatar_url: formData.avatar_url,
          updated_at: new Date(),
        })
        .eq("id", user.id);

      if (error) throw error;

      toast({
        title: "Profile updated",
        description: "Your profile has been successfully updated",
      });
      setEditing(false);
    } catch (error) {
      console.error("Error updating profile:", error);
      toast({
        title: "Update failed",
        description: "There was an error updating your profile",
        variant: "destructive",
      });
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  // Calculate days since the user joined
  const calculateDaysSinceJoined = () => {
    if (!user?.created_at) return 0;
    
    const createdDate = new Date(user.created_at);
    const today = new Date();
    const diffTime = Math.abs(today - createdDate);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  return (
    <Layout>
      <div className="min-h-[calc(100vh-64px)] bg-therapy-softPurple/10 dark:bg-therapy-dark/20 py-8 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-3xl md:text-4xl font-display font-bold mb-2">My Profile</h1>
            <p className="text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
              Manage your personal information and track your therapy progress
            </p>
          </div>

          {loading ? (
            <div className="flex justify-center items-center h-64">
              <div className="text-center">
                <div className="w-8 h-8 border-4 border-t-therapy-primary border-r-transparent border-b-transparent border-l-transparent rounded-full animate-spin inline-block mb-2"></div>
                <p>Loading your profile...</p>
              </div>
            </div>
          ) : (
            <Tabs defaultValue="overview" className="space-y-8">
              <TabsList className="grid w-full max-w-md mx-auto grid-cols-3 mb-8">
                <TabsTrigger value="overview" className="flex items-center gap-2">
                  <UserIcon className="w-4 h-4" />
                  Overview
                </TabsTrigger>
                <TabsTrigger value="records" className="flex items-center gap-2">
                  <ClipboardIcon className="w-4 h-4" />
                  Records
                </TabsTrigger>
                <TabsTrigger value="settings" className="flex items-center gap-2">
                  <SettingsIcon className="w-4 h-4" />
                  Settings
                </TabsTrigger>
              </TabsList>

              <TabsContent value="overview">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {/* Profile Card */}
                  <Card className="therapy-card md:col-span-1">
                    <CardHeader className="text-center">
                      <div className="flex justify-center mb-4">
                        <Avatar className="w-24 h-24 border-4 border-therapy-softPurple/30">
                          <AvatarImage src={profile?.avatar_url || ""} alt={profile?.full_name} />
                          <AvatarFallback className="text-3xl bg-therapy-primary/20">
                            {profile?.full_name ? profile.full_name[0].toUpperCase() : "U"}
                          </AvatarFallback>
                        </Avatar>
                      </div>
                      <CardTitle className="text-2xl">{profile?.full_name || "User"}</CardTitle>
                      <CardDescription>
                        Member since {formatDate(user?.created_at)}
                        <br />
                        {calculateDaysSinceJoined()} days on the journey
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      {editing ? (
                        <div className="space-y-4">
                          <div>
                            <label className="text-sm font-medium mb-1 block">Name</label>
                            <Input
                              name="full_name"
                              value={formData.full_name}
                              onChange={handleInputChange}
                              className="input-therapy"
                            />
                          </div>
                          <div>
                            <label className="text-sm font-medium mb-1 block">Email</label>
                            <Input
                              name="email"
                              value={formData.email}
                              disabled
                              className="input-therapy bg-gray-100"
                            />
                          </div>
                          <div>
                            <label className="text-sm font-medium mb-1 block">Phone</label>
                            <Input
                              name="phone"
                              value={formData.phone}
                              onChange={handleInputChange}
                              className="input-therapy"
                            />
                          </div>
                          <div>
                            <label className="text-sm font-medium mb-1 block">Bio</label>
                            <Textarea
                              name="bio"
                              value={formData.bio}
                              onChange={handleInputChange}
                              className="input-therapy min-h-[100px]"
                            />
                          </div>
                        </div>
                      ) : (
                        <div className="space-y-4">
                          <div>
                            <h3 className="text-sm font-medium mb-1">Email</h3>
                            <p className="text-gray-600 dark:text-gray-300">{user?.email}</p>
                          </div>
                          {profile?.phone && (
                            <div>
                              <h3 className="text-sm font-medium mb-1">Phone</h3>
                              <p className="text-gray-600 dark:text-gray-300">{profile?.phone}</p>
                            </div>
                          )}
                          {profile?.bio && (
                            <div>
                              <h3 className="text-sm font-medium mb-1">About</h3>
                              <p className="text-gray-600 dark:text-gray-300">{profile?.bio}</p>
                            </div>
                          )}
                          {!profile?.bio && !profile?.phone && (
                            <div className="text-center py-4">
                              <p className="text-sm text-gray-500">
                                Complete your profile by adding more details.
                              </p>
                            </div>
                          )}
                        </div>
                      )}
                    </CardContent>
                    <CardFooter>
                      {editing ? (
                        <div className="flex w-full gap-2">
                          <Button
                            variant="outline"
                            className="w-1/2"
                            onClick={() => setEditing(false)}
                          >
                            Cancel
                          </Button>
                          <Button className="w-1/2" onClick={handleSaveProfile}>
                            <SaveIcon className="w-4 h-4 mr-2" />
                            Save
                          </Button>
                        </div>
                      ) : (
                        <Button className="w-full" onClick={() => setEditing(true)}>
                          <Edit2Icon className="w-4 h-4 mr-2" />
                          Edit Profile
                        </Button>
                      )}
                    </CardFooter>
                  </Card>

                  {/* Health Metrics Card */}
                  <Card className="therapy-card md:col-span-2">
                    <CardHeader>
                      <CardTitle className="text-xl">Your Wellness Journey</CardTitle>
                      <CardDescription>
                        Track your progress and see how far you've come
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      <div className="space-y-4">
                        <div>
                          <div className="flex justify-between mb-1">
                            <span className="text-sm font-medium">Average Mood</span>
                            <span className="text-sm font-medium">{healthMetrics.mood}%</span>
                          </div>
                          <Progress value={healthMetrics.mood} className="h-2" />
                        </div>
                        <div>
                          <div className="flex justify-between mb-1">
                            <span className="text-sm font-medium">Sleep Quality</span>
                            <span className="text-sm font-medium">{healthMetrics.sleep}%</span>
                          </div>
                          <Progress value={healthMetrics.sleep} className="h-2" />
                        </div>
                        <div>
                          <div className="flex justify-between mb-1">
                            <span className="text-sm font-medium">Anxiety Levels</span>
                            <span className="text-sm font-medium">{healthMetrics.anxiety}%</span>
                          </div>
                          <Progress value={healthMetrics.anxiety} className="h-2" />
                        </div>
                        <div>
                          <div className="flex justify-between mb-1">
                            <span className="text-sm font-medium">Overall Progress</span>
                            <span className="text-sm font-medium">{healthMetrics.progress}%</span>
                          </div>
                          <Progress value={healthMetrics.progress} className="h-2" />
                        </div>
                      </div>

                      <div>
                        <h3 className="text-lg font-medium mb-3">Recent Activity</h3>
                        <div className="h-48">
                          <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={activityData} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                              <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                              <XAxis dataKey="name" />
                              <YAxis />
                              <Tooltip
                                contentStyle={{
                                  backgroundColor: "rgba(255, 255, 255, 0.8)",
                                  borderRadius: "8px",
                                  border: "none",
                                  boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)",
                                }}
                              />
                              <Bar dataKey="sessions" fill="#9b87f5" radius={[4, 4, 0, 0]} />
                            </BarChart>
                          </ResponsiveContainer>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Achievements Card */}
                  <Card className="therapy-card md:col-span-3">
                    <CardHeader>
                      <CardTitle className="text-xl">Your Achievements</CardTitle>
                      <CardDescription>Milestones in your mental health journey</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="flex flex-wrap gap-2">
                        <Badge variant="secondary" className="px-3 py-1.5 bg-therapy-softPurple/20">
                          <CheckIcon className="w-3.5 h-3.5 mr-1.5" />
                          First Login
                        </Badge>
                        <Badge variant="secondary" className="px-3 py-1.5 bg-therapy-softPurple/20">
                          <CheckIcon className="w-3.5 h-3.5 mr-1.5" />
                          Profile Completed
                        </Badge>
                        <Badge variant="secondary" className="px-3 py-1.5 bg-therapy-softPurple/20">
                          <CheckIcon className="w-3.5 h-3.5 mr-1.5" />
                          First Mood Entry
                        </Badge>
                        <Badge variant="secondary" className="px-3 py-1.5 bg-therapy-softPurple/20">
                          <CheckIcon className="w-3.5 h-3.5 mr-1.5" />
                          First Chat Session
                        </Badge>
                        <Badge variant="secondary" className="px-3 py-1.5 bg-therapy-softPurple/20 opacity-50">
                          First Appointment
                        </Badge>
                        <Badge variant="secondary" className="px-3 py-1.5 bg-therapy-softPurple/20 opacity-50">
                          Week Streak
                        </Badge>
                        <Badge variant="secondary" className="px-3 py-1.5 bg-therapy-softPurple/20 opacity-50">
                          Month Streak
                        </Badge>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              <TabsContent value="records">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Upcoming Appointments */}
                  <Card className="therapy-card">
                    <CardHeader>
                      <CardTitle className="text-xl">Upcoming Appointments</CardTitle>
                      <CardDescription>Your scheduled therapy sessions</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="p-4 text-center border border-dashed border-gray-300 rounded-lg">
                        <CalendarIcon className="mx-auto h-12 w-12 text-gray-400 mb-2" />
                        <h3 className="text-lg font-medium mb-1">No upcoming appointments</h3>
                        <p className="text-sm text-gray-500 mb-4">
                          Schedule your next session with a therapist.
                        </p>
                        <Button variant="outline">Schedule Appointment</Button>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Recent Sessions */}
                  <Card className="therapy-card">
                    <CardHeader>
                      <CardTitle className="text-xl">Recent Sessions</CardTitle>
                      <CardDescription>History of your therapy sessions</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="p-4 text-center border border-dashed border-gray-300 rounded-lg">
                        <ClipboardIcon className="mx-auto h-12 w-12 text-gray-400 mb-2" />
                        <h3 className="text-lg font-medium mb-1">No session history</h3>
                        <p className="text-sm text-gray-500">
                          Your completed sessions will appear here.
                        </p>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Mood Journal */}
                  <Card className="therapy-card md:col-span-2">
                    <CardHeader>
                      <CardTitle className="text-xl">Mood Journal Summary</CardTitle>
                      <CardDescription>Overview of your tracked moods</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="flex justify-between items-center mb-4">
                        <div>
                          <h3 className="font-medium">Last 7 days</h3>
                          <p className="text-sm text-gray-500">Average mood: 3.8/5</p>
                        </div>
                        <Button variant="outline" size="sm">View All Entries</Button>
                      </div>
                      <div className="flex justify-between space-x-2">
                        {[3, 4, 2, 5, 3, 4, 5].map((mood, index) => (
                          <div 
                            key={index} 
                            className="flex-1 h-20 rounded-lg flex items-center justify-center"
                            style={{ backgroundColor: `rgba(155, 135, 245, ${mood * 0.15})` }}
                          >
                            <span className="text-lg font-semibold">{mood}</span>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              <TabsContent value="settings">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {/* Notification Settings */}
                  <Card className="therapy-card">
                    <CardHeader>
                      <div className="flex items-center">
                        <BellIcon className="w-5 h-5 mr-2" />
                        <CardTitle>Notifications</CardTitle>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="font-medium">Appointment Reminders</h3>
                          <p className="text-sm text-gray-500">Get notified before sessions</p>
                        </div>
                        <div>
                          <input type="checkbox" id="appointmentReminders" className="sr-only" defaultChecked />
                          <label
                            htmlFor="appointmentReminders"
                            className="relative inline-flex h-6 w-11 items-center rounded-full bg-therapy-primary/30 cursor-pointer"
                          >
                            <span className="inline-block h-4 w-4 transform rounded-full bg-white transition-transform translate-x-6" />
                          </label>
                        </div>
                      </div>
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="font-medium">Mood Tracking Reminders</h3>
                          <p className="text-sm text-gray-500">Daily reminder to log your mood</p>
                        </div>
                        <div>
                          <input type="checkbox" id="moodReminders" className="sr-only" defaultChecked />
                          <label
                            htmlFor="moodReminders"
                            className="relative inline-flex h-6 w-11 items-center rounded-full bg-therapy-primary/30 cursor-pointer"
                          >
                            <span className="inline-block h-4 w-4 transform rounded-full bg-white transition-transform translate-x-6" />
                          </label>
                        </div>
                      </div>
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="font-medium">Email Notifications</h3>
                          <p className="text-sm text-gray-500">Receive updates via email</p>
                        </div>
                        <div>
                          <input type="checkbox" id="emailNotifications" className="sr-only" />
                          <label
                            htmlFor="emailNotifications"
                            className="relative inline-flex h-6 w-11 items-center rounded-full bg-gray-200 cursor-pointer"
                          >
                            <span className="inline-block h-4 w-4 transform rounded-full bg-white transition-transform translate-x-1" />
                          </label>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Privacy Settings */}
                  <Card className="therapy-card">
                    <CardHeader>
                      <div className="flex items-center">
                        <ShieldIcon className="w-5 h-5 mr-2" />
                        <CardTitle>Privacy & Security</CardTitle>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div>
                        <Button variant="outline" className="w-full mb-2">Change Password</Button>
                        <Button variant="outline" className="w-full">Two-Factor Authentication</Button>
                      </div>
                      <div className="pt-4">
                        <h3 className="font-medium mb-2">Data Privacy</h3>
                        <p className="text-sm text-gray-500 mb-4">
                          Your data is encrypted and securely stored. We never share your personal information.
                        </p>
                        <Button variant="link" className="px-0 text-therapy-primary">
                          View Privacy Policy
                        </Button>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Account Settings */}
                  <Card className="therapy-card">
                    <CardHeader>
                      <div className="flex items-center">
                        <UserIcon className="w-5 h-5 mr-2" />
                        <CardTitle>Account</CardTitle>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div>
                        <h3 className="font-medium mb-2">Account Type</h3>
                        <div className="flex items-center space-x-2">
                          <Badge>Standard</Badge>
                          <Button variant="link" className="px-0 h-auto text-therapy-primary">
                            Upgrade Plan
                          </Button>
                        </div>
                      </div>
                      <div className="pt-2">
                        <h3 className="font-medium mb-2">Data Export</h3>
                        <Button variant="outline" className="w-full mb-2">
                          Export My Data
                        </Button>
                      </div>
                      <div className="pt-4">
                        <Button
                          variant="destructive"
                          className="w-full"
                          onClick={signOut}
                        >
                          <LogOutIcon className="w-4 h-4 mr-2" />
                          Sign Out
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>
            </Tabs>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default Profile;
