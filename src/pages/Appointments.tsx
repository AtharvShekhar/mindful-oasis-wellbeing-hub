
import { useState } from "react";
import { Layout } from "@/components/layout/Layout";
import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Calendar as CalendarIcon, Clock, Users, MessageSquare, User } from "lucide-react";
import { format } from "date-fns";
import { useToast } from "@/hooks/use-toast";

// Mock therapist data
const therapists = [
  {
    id: "t1",
    name: "Dr. Sarah Johnson",
    specialty: "Anxiety & Depression",
    experience: "15 years",
    bio: "Specializes in cognitive behavioral therapy for anxiety and depression. Dr. Johnson has extensive experience helping clients develop practical strategies to manage symptoms and improve quality of life.",
    image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1374&q=80",
    availability: [10, 11, 14, 15, 16],
  },
  {
    id: "t2",
    name: "Dr. Michael Chen",
    specialty: "Trauma & PTSD",
    experience: "12 years",
    bio: "Focuses on trauma-informed care and EMDR therapy. Dr. Chen creates a safe space for clients to process traumatic experiences and develop resilience.",
    image: "https://images.unsplash.com/photo-1560250097-0b93528c311a?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1374&q=80",
    availability: [9, 10, 13, 14, 17],
  },
  {
    id: "t3",
    name: "Dr. Jessica Williams",
    specialty: "Relationships & Family",
    experience: "10 years",
    bio: "Specializes in couples therapy and family counseling. Dr. Williams helps clients improve communication, resolve conflicts, and build healthier relationships.",
    image: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1776&q=80",
    availability: [11, 12, 13, 15, 16],
  },
  {
    id: "t4",
    name: "Dr. David Rodriguez",
    specialty: "Stress Management",
    experience: "8 years",
    bio: "Focuses on mindfulness-based approaches to stress management. Dr. Rodriguez helps clients develop practical coping skills for managing stress in daily life.",
    image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1770&q=80",
    availability: [9, 10, 11, 14, 16],
  },
];

// Mock upcoming appointments
const upcomingAppointments = [
  {
    id: "a1",
    therapist: "Dr. Sarah Johnson",
    date: "2023-05-15",
    time: "10:00 AM",
    type: "Video Session",
    status: "Confirmed",
  },
  {
    id: "a2",
    therapist: "Dr. Michael Chen",
    date: "2023-05-22",
    time: "2:00 PM",
    type: "Video Session",
    status: "Scheduled",
  },
];

const Appointments = () => {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [selectedTherapist, setSelectedTherapist] = useState<string | undefined>();
  const [selectedTime, setSelectedTime] = useState<string | undefined>();
  const [sessionType, setSessionType] = useState<string>("video");
  const [notes, setNotes] = useState<string>("");
  const [activeTab, setActiveTab] = useState<string>("book");
  const { toast } = useToast();

  const handleBookAppointment = () => {
    if (!selectedDate || !selectedTherapist || !selectedTime) {
      toast({
        title: "Missing information",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }

    // In a real app, this would send data to your backend
    toast({
      title: "Appointment Booked!",
      description: `Your appointment with ${selectedTherapist} on ${format(selectedDate, "PPP")} at ${selectedTime} has been scheduled.`,
    });

    // Reset form
    setSelectedTherapist(undefined);
    setSelectedTime(undefined);
    setSessionType("video");
    setNotes("");
    setActiveTab("upcoming");
  };

  const generateTimeSlots = () => {
    if (!selectedTherapist) return [];
    
    const therapist = therapists.find(t => t.name === selectedTherapist);
    if (!therapist) return [];
    
    return therapist.availability.map(hour => {
      const time = `${hour}:00 ${hour >= 12 ? 'PM' : 'AM'}`;
      return { hour, time };
    });
  };

  const getTherapistImage = (name: string) => {
    const therapist = therapists.find(t => t.name === name);
    return therapist?.image || "";
  };

  return (
    <Layout>
      <div className="min-h-[calc(100vh-64px)] bg-therapy-softPurple/10 dark:bg-therapy-dark/20 py-8 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-3xl md:text-4xl font-display font-bold mb-2">Therapy Appointments</h1>
            <p className="text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
              Schedule sessions with our licensed therapists or manage your upcoming appointments.
            </p>
          </div>

          <Tabs defaultValue="book" value={activeTab} onValueChange={setActiveTab}>
            <div className="flex justify-center mb-6">
              <TabsList className="grid grid-cols-2 w-full max-w-md">
                <TabsTrigger value="book">Book Appointment</TabsTrigger>
                <TabsTrigger value="upcoming">Upcoming Sessions</TabsTrigger>
              </TabsList>
            </div>

            <TabsContent value="book">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <Card className="therapy-card lg:col-span-1">
                  <CardHeader>
                    <CardTitle className="text-xl">Select Date</CardTitle>
                    <CardDescription>Choose your preferred appointment date</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Calendar
                      mode="single"
                      selected={selectedDate}
                      onSelect={setSelectedDate}
                      className="rounded-md border"
                      disabled={(date) => {
                        // Disable past dates and weekends
                        const today = new Date();
                        today.setHours(0, 0, 0, 0);
                        return (
                          date < today ||
                          date.getDay() === 0 ||
                          date.getDay() === 6
                        );
                      }}
                    />
                  </CardContent>
                </Card>

                <Card className="therapy-card lg:col-span-2">
                  <CardHeader>
                    <CardTitle className="text-xl">Schedule Details</CardTitle>
                    <CardDescription>Select your therapist and session time</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">
                        Select Therapist
                      </label>
                      <Select onValueChange={(value) => setSelectedTherapist(value)}>
                        <SelectTrigger className="input-therapy">
                          <SelectValue placeholder="Choose a therapist" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectGroup>
                            <SelectLabel>Therapists</SelectLabel>
                            {therapists.map((therapist) => (
                              <SelectItem key={therapist.id} value={therapist.name}>
                                {therapist.name} - {therapist.specialty}
                              </SelectItem>
                            ))}
                          </SelectGroup>
                        </SelectContent>
                      </Select>
                    </div>

                    {selectedTherapist && (
                      <div className="p-4 rounded-lg bg-therapy-softPurple/10 dark:bg-therapy-dark/30">
                        {therapists
                          .filter((t) => t.name === selectedTherapist)
                          .map((therapist) => (
                            <div key={therapist.id} className="flex items-start gap-4">
                              <img
                                src={therapist.image}
                                alt={therapist.name}
                                className="w-16 h-16 rounded-full object-cover"
                              />
                              <div>
                                <h4 className="font-medium text-lg">{therapist.name}</h4>
                                <p className="text-sm text-gray-600 dark:text-gray-300">
                                  Specialty: {therapist.specialty}
                                </p>
                                <p className="text-sm text-gray-600 dark:text-gray-300">
                                  Experience: {therapist.experience}
                                </p>
                                <p className="text-sm mt-2">{therapist.bio}</p>
                              </div>
                            </div>
                          ))}
                      </div>
                    )}

                    <div>
                      <label className="block text-sm font-medium mb-2">
                        Available Time Slots
                      </label>
                      <div className="grid grid-cols-3 gap-2">
                        {generateTimeSlots().map(({ hour, time }) => (
                          <Button
                            key={hour}
                            variant={selectedTime === time ? "default" : "outline"}
                            className={selectedTime === time ? "bg-therapy-primary" : ""}
                            onClick={() => setSelectedTime(time)}
                          >
                            {time}
                          </Button>
                        ))}
                        {selectedTherapist && generateTimeSlots().length === 0 && (
                          <p className="col-span-3 text-gray-500 text-sm">
                            Please select a therapist and date to see available time slots.
                          </p>
                        )}
                        {!selectedTherapist && (
                          <p className="col-span-3 text-gray-500 text-sm">
                            Please select a therapist to see available time slots.
                          </p>
                        )}
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2">
                        Session Type
                      </label>
                      <Select
                        defaultValue={sessionType}
                        onValueChange={(value) => setSessionType(value)}
                      >
                        <SelectTrigger className="input-therapy">
                          <SelectValue placeholder="Select session type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="video">Video Session</SelectItem>
                          <SelectItem value="phone">Phone Session</SelectItem>
                          <SelectItem value="in-person">In-Person Session</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2">
                        Notes (Optional)
                      </label>
                      <Textarea
                        placeholder="Add any information you'd like your therapist to know before the session"
                        className="input-therapy min-h-[100px]"
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                      />
                    </div>
                  </CardContent>
                  <CardFooter>
                    <Button
                      className="w-full btn-primary"
                      onClick={handleBookAppointment}
                      disabled={!selectedDate || !selectedTherapist || !selectedTime}
                    >
                      Book Appointment
                    </Button>
                  </CardFooter>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="upcoming">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {upcomingAppointments.length > 0 ? (
                  upcomingAppointments.map((appointment) => (
                    <Card key={appointment.id} className="therapy-card">
                      <CardHeader className="pb-2">
                        <div className="flex justify-between items-start">
                          <div>
                            <CardTitle className="text-xl">{appointment.therapist}</CardTitle>
                            <CardDescription>
                              {appointment.date} at {appointment.time}
                            </CardDescription>
                          </div>
                          <div className="flex-shrink-0">
                            <div
                              className={`px-3 py-1 rounded-full text-xs font-medium ${
                                appointment.status === "Confirmed"
                                  ? "bg-green-100 text-green-800 dark:bg-green-800/30 dark:text-green-300"
                                  : "bg-blue-100 text-blue-800 dark:bg-blue-800/30 dark:text-blue-300"
                              }`}
                            >
                              {appointment.status}
                            </div>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="flex items-center gap-4 mb-4">
                          <img
                            src={getTherapistImage(appointment.therapist)}
                            alt={appointment.therapist}
                            className="w-16 h-16 rounded-full object-cover"
                          />
                          <div>
                            <p className="text-sm flex items-center gap-1">
                              <Clock size={14} />
                              {appointment.time}
                            </p>
                            <p className="text-sm flex items-center gap-1">
                              <CalendarIcon size={14} />
                              {appointment.date}
                            </p>
                            <p className="text-sm flex items-center gap-1">
                              <User size={14} />
                              {appointment.type}
                            </p>
                          </div>
                        </div>
                      </CardContent>
                      <CardFooter className="flex gap-2">
                        <Button variant="outline" className="w-1/2">
                          Reschedule
                        </Button>
                        <Button variant="destructive" className="w-1/2">
                          Cancel
                        </Button>
                      </CardFooter>
                    </Card>
                  ))
                ) : (
                  <div className="col-span-2 text-center py-10">
                    <p className="text-gray-500 dark:text-gray-400 mb-4">
                      You don't have any upcoming appointments.
                    </p>
                    <Button onClick={() => setActiveTab("book")}>
                      Book Your First Session
                    </Button>
                  </div>
                )}
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </Layout>
  );
};

export default Appointments;
