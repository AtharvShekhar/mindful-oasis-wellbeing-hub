
import { useState } from "react";
import { Layout } from "@/components/layout/Layout";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from "recharts";
import { User, Settings, Bell, Shield, Key, Calendar, BarChart as BarChartIcon } from "lucide-react";

// Mock user data
const userData = {
  name: "Alex Johnson",
  email: "alex.johnson@example.com",
  joinDate: "March 15, 2023",
  profileImage: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1770&q=80",
};

// Mock mood data
const moodData = [
  { date: "Apr 1", mood: 3, label: "Neutral" },
  { date: "Apr 5", mood: 2, label: "Low" },
  { date: "Apr 10", mood: 4, label: "Good" },
  { date: "Apr 15", mood: 5, label: "Excellent" },
  { date: "Apr 20", mood: 3, label: "Neutral" },
  { date: "Apr 25", mood: 4, label: "Good" },
  { date: "Apr 30", mood: 4, label: "Good" },
];

// Mock session history
const sessionHistory = [
  { date: "Apr 28, 2023", therapist: "Dr. Sarah Johnson", type: "Video Session", duration: "50 minutes" },
  { date: "Apr 14, 2023", therapist: "Dr. Sarah Johnson", type: "Video Session", duration: "50 minutes" },
  { date: "Mar 31, 2023", therapist: "Dr. Michael Chen", type: "Video Session", duration: "50 minutes" },
  { date: "Mar 17, 2023", therapist: "Dr. Sarah Johnson", type: "Video Session", duration: "50 minutes" },
];

const Profile = () => {
  const [activeTab, setActiveTab] = useState("profile");
  const { toast } = useToast();
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [reminderEnabled, setReminderEnabled] = useState(true);
  const [newsletterEnabled, setNewsletterEnabled] = useState(false);

  const [formData, setFormData] = useState({
    name: userData.name,
    email: userData.email,
    phone: "555-123-4567",
    bio: "I'm working on managing anxiety and stress related to work and family life.",
    goals: "Develop better coping mechanisms for stress and improve work-life balance.",
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSaveProfile = () => {
    // In a real app, this would update the user's profile in the database
    toast({
      title: "Profile Updated",
      description: "Your profile information has been saved successfully.",
    });
  };

  return (
    <Layout>
      <div className="min-h-[calc(100vh-64px)] bg-therapy-softPurple/10 dark:bg-therapy-dark/20 py-8 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-3xl md:text-4xl font-display font-bold mb-2">Your Profile</h1>
            <p className="text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
              Manage your personal information, track your progress, and customize your settings.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <Card className="therapy-card md:col-span-1">
              <CardContent className="p-6">
                <div className="flex flex-col items-center">
                  <div className="w-32 h-32 rounded-full overflow-hidden mb-4 border-4 border-therapy-primary/20">
                    <img
                      src={userData.profileImage}
                      alt={userData.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <h2 className="text-xl font-bold">{userData.name}</h2>
                  <p className="text-gray-600 dark:text-gray-300 text-sm mb-4">{userData.email}</p>
                  <p className="text-gray-500 text-xs">Member since {userData.joinDate}</p>
                </div>

                <div className="mt-6">
                  <Tabs defaultValue="profile" orientation="vertical" value={activeTab} onValueChange={setActiveTab}>
                    <TabsList className="flex flex-col h-auto w-full">
                      <TabsTrigger value="profile" className="justify-start">
                        <User size={16} className="mr-2" />
                        Profile
                      </TabsTrigger>
                      <TabsTrigger value="analytics" className="justify-start">
                        <BarChartIcon size={16} className="mr-2" />
                        Progress
                      </TabsTrigger>
                      <TabsTrigger value="appointments" className="justify-start">
                        <Calendar size={16} className="mr-2" />
                        History
                      </TabsTrigger>
                      <TabsTrigger value="settings" className="justify-start">
                        <Settings size={16} className="mr-2" />
                        Settings
                      </TabsTrigger>
                    </TabsList>
                  </Tabs>
                </div>
              </CardContent>
            </Card>

            <div className="md:col-span-3">
              <TabsContent value="profile" className="mt-0">
                <Card className="therapy-card">
                  <CardHeader>
                    <CardTitle>Personal Information</CardTitle>
                    <CardDescription>Update your personal details and preferences</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="name">Full Name</Label>
                        <Input
                          id="name"
                          name="name"
                          value={formData.name}
                          onChange={handleInputChange}
                          className="input-therapy"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="email">Email</Label>
                        <Input
                          id="email"
                          name="email"
                          type="email"
                          value={formData.email}
                          onChange={handleInputChange}
                          className="input-therapy"
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="phone">Phone Number</Label>
                        <Input
                          id="phone"
                          name="phone"
                          value={formData.phone}
                          onChange={handleInputChange}
                          className="input-therapy"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="timezone">Timezone</Label>
                        <Input
                          id="timezone"
                          name="timezone"
                          value="Eastern Time (ET)"
                          readOnly
                          className="input-therapy bg-gray-50"
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="bio">About Me</Label>
                      <Textarea
                        id="bio"
                        name="bio"
                        value={formData.bio}
                        onChange={handleInputChange}
                        className="input-therapy min-h-[100px]"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="goals">My Wellness Goals</Label>
                      <Textarea
                        id="goals"
                        name="goals"
                        value={formData.goals}
                        onChange={handleInputChange}
                        className="input-therapy min-h-[100px]"
                      />
                    </div>
                  </CardContent>
                  <CardFooter>
                    <Button onClick={handleSaveProfile} className="btn-primary">Save Changes</Button>
                  </CardFooter>
                </Card>
              </TabsContent>

              <TabsContent value="analytics" className="mt-0">
                <Card className="therapy-card">
                  <CardHeader>
                    <CardTitle>Your Wellness Journey</CardTitle>
                    <CardDescription>Track your progress and mood over time</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-6">
                      <div>
                        <h3 className="text-lg font-medium mb-3">Mood Trends</h3>
                        <div className="h-64">
                          <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={moodData} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                              <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                              <XAxis dataKey="date" />
                              <YAxis domain={[1, 5]} ticks={[1, 2, 3, 4, 5]} />
                              <Tooltip />
                              <Line
                                type="monotone"
                                dataKey="mood"
                                stroke="#9b87f5"
                                strokeWidth={3}
                                dot={{ fill: "#9b87f5", r: 6 }}
                                activeDot={{ r: 8, stroke: "#9b87f5", strokeWidth: 2 }}
                              />
                            </LineChart>
                          </ResponsiveContainer>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <h3 className="text-lg font-medium mb-3">Mood Distribution</h3>
                          <div className="h-48">
                            <ResponsiveContainer width="100%" height="100%">
                              <BarChart
                                data={[
                                  { name: "Very Low", count: 0 },
                                  { name: "Low", count: 1 },
                                  { name: "Neutral", count: 2 },
                                  { name: "Good", count: 3 },
                                  { name: "Excellent", count: 1 },
                                ]}
                                margin={{ top: 5, right: 10, bottom: 5, left: 10 }}
                                barSize={30}
                              >
                                <XAxis dataKey="name" scale="point" />
                                <YAxis hide />
                                <Tooltip />
                                <Bar dataKey="count" fill="#9b87f5" radius={[4, 4, 0, 0]} />
                              </BarChart>
                            </ResponsiveContainer>
                          </div>
                        </div>

                        <div>
                          <h3 className="text-lg font-medium mb-3">Activity Completion</h3>
                          <div className="h-48">
                            <ResponsiveContainer width="100%" height="100%">
                              <BarChart
                                data={[
                                  { name: "Meditation", completed: 8, total: 10 },
                                  { name: "Journaling", completed: 5, total: 10 },
                                  { name: "Exercise", completed: 3, total: 10 },
                                  { name: "Reading", completed: 4, total: 10 },
                                ]}
                                margin={{ top: 5, right: 10, bottom: 5, left: 10 }}
                                barSize={30}
                                layout="vertical"
                              >
                                <XAxis type="number" hide />
                                <YAxis dataKey="name" type="category" scale="band" />
                                <Tooltip />
                                <Bar dataKey="completed" fill="#9b87f5" radius={[0, 4, 4, 0]} />
                              </BarChart>
                            </ResponsiveContainer>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="appointments" className="mt-0">
                <Card className="therapy-card">
                  <CardHeader>
                    <CardTitle>Session History</CardTitle>
                    <CardDescription>Review your past therapy sessions</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {sessionHistory.map((session, index) => (
                        <div
                          key={index}
                          className="p-4 rounded-lg border border-therapy-softPurple/20 hover:border-therapy-primary/20 transition-colors"
                        >
                          <div className="flex justify-between items-center">
                            <div>
                              <h4 className="font-medium">{session.date}</h4>
                              <p className="text-sm text-gray-600 dark:text-gray-300">
                                {session.therapist} · {session.type} · {session.duration}
                              </p>
                            </div>
                            <Button variant="outline" size="sm">
                              View Notes
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                  <CardFooter>
                    <Button asChild variant="outline" className="w-full">
                      <a href="/appointments">Schedule New Session</a>
                    </Button>
                  </CardFooter>
                </Card>
              </TabsContent>

              <TabsContent value="settings" className="mt-0">
                <Card className="therapy-card mb-6">
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Bell size={20} className="mr-2" />
                      Notifications
                    </CardTitle>
                    <CardDescription>Manage how you receive notifications</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-medium">Email Notifications</h4>
                        <p className="text-sm text-gray-600 dark:text-gray-300">
                          Receive notifications about appointments and messages
                        </p>
                      </div>
                      <Switch
                        checked={notificationsEnabled}
                        onCheckedChange={setNotificationsEnabled}
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-medium">Session Reminders</h4>
                        <p className="text-sm text-gray-600 dark:text-gray-300">
                          Receive reminders 24 hours before scheduled sessions
                        </p>
                      </div>
                      <Switch
                        checked={reminderEnabled}
                        onCheckedChange={setReminderEnabled}
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-medium">Newsletter</h4>
                        <p className="text-sm text-gray-600 dark:text-gray-300">
                          Receive our monthly wellness newsletter
                        </p>
                      </div>
                      <Switch
                        checked={newsletterEnabled}
                        onCheckedChange={setNewsletterEnabled}
                      />
                    </div>
                  </CardContent>
                </Card>

                <Card className="therapy-card mb-6">
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Shield size={20} className="mr-2" />
                      Privacy
                    </CardTitle>
                    <CardDescription>Manage your privacy settings</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-medium">Data Sharing</h4>
                        <p className="text-sm text-gray-600 dark:text-gray-300">
                          Allow anonymous data to be used for research
                        </p>
                      </div>
                      <Switch defaultChecked />
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-medium">Analytics Cookies</h4>
                        <p className="text-sm text-gray-600 dark:text-gray-300">
                          Allow us to collect usage data to improve our services
                        </p>
                      </div>
                      <Switch defaultChecked />
                    </div>
                  </CardContent>
                </Card>

                <Card className="therapy-card">
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Key size={20} className="mr-2" />
                      Account
                    </CardTitle>
                    <CardDescription>Manage your account settings</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <Button variant="outline" className="w-full justify-start">
                      Change Password
                    </Button>
                    <Button variant="outline" className="w-full justify-start">
                      Download My Data
                    </Button>
                    <Button variant="destructive" className="w-full justify-start">
                      Delete Account
                    </Button>
                  </CardContent>
                </Card>
              </TabsContent>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Profile;
