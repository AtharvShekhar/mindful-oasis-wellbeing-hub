
import { useState, useEffect } from "react";
import { Layout } from "@/components/layout/Layout";
import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Calendar as CalendarIcon, 
  Clock, 
  Users, 
  MessageSquare, 
  User, 
  CheckCircle2, 
  XCircle, 
  AlertCircle,
  Calendar as CalendarIconSolid,
  Clock4
} from "lucide-react";
import { format, addDays, addWeeks, isSameDay, isAfter, isBefore, parseISO } from "date-fns";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/components/AuthProvider";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

// Mock therapist data
const therapists = [
  {
    id: "t1",
    name: "Dr. Sarah Johnson",
    specialty: "Anxiety & Depression",
    experience: "15 years",
    bio: "Specializes in cognitive behavioral therapy for anxiety and depression. Dr. Johnson has extensive experience helping clients develop practical strategies to manage symptoms and improve quality of life.",
    image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVuZHx8fHx8fA%3D%3D&auto=format&fit=crop&w=1374&q=80",
    availability: [10, 11, 14, 15, 16],
    nextAvailable: addDays(new Date(), 2),
  },
  {
    id: "t2",
    name: "Dr. Michael Chen",
    specialty: "Trauma & PTSD",
    experience: "12 years",
    bio: "Focuses on trauma-informed care and EMDR therapy. Dr. Chen creates a safe space for clients to process traumatic experiences and develop resilience.",
    image: "https://images.unsplash.com/photo-1560250097-0b93528c311a?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVuZHx8fHx8fA%3D%3D&auto=format&fit=crop&w=1374&q=80",
    availability: [9, 10, 13, 14, 17],
    nextAvailable: addDays(new Date(), 1),
  },
  {
    id: "t3",
    name: "Dr. Jessica Williams",
    specialty: "Relationships & Family",
    experience: "10 years",
    bio: "Specializes in couples therapy and family counseling. Dr. Williams helps clients improve communication, resolve conflicts, and build healthier relationships.",
    image: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVuZHx8fHx8fA%3D%3D&auto=format&fit=crop&w=1776&q=80",
    availability: [11, 12, 13, 15, 16],
    nextAvailable: addDays(new Date(), 3),
  },
  {
    id: "t4",
    name: "Dr. David Rodriguez",
    specialty: "Stress Management",
    experience: "8 years",
    bio: "Focuses on mindfulness-based approaches to stress management. Dr. Rodriguez helps clients develop practical coping skills for managing stress in daily life.",
    image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1770&q=80",
    availability: [9, 10, 11, 14, 16],
    nextAvailable: addDays(new Date(), 2),
  },
];

type AppointmentStatus = "Confirmed" | "Pending" | "Rescheduled" | "Cancelled" | "Completed";

type Appointment = {
  id: string;
  therapistId: string;
  therapist: string;
  date: string;
  time: string;
  type: "Video Session" | "Phone Session" | "In-Person Session";
  status: AppointmentStatus;
  notes?: string;
};

// Mock upcoming appointments
const initialAppointments: Appointment[] = [
  {
    id: "a1",
    therapistId: "t1",
    therapist: "Dr. Sarah Johnson",
    date: format(addDays(new Date(), 5), "yyyy-MM-dd"),
    time: "10:00 AM",
    type: "Video Session",
    status: "Confirmed",
    notes: "Follow-up on anxiety management techniques"
  },
  {
    id: "a2",
    therapistId: "t2",
    therapist: "Dr. Michael Chen",
    date: format(addDays(new Date(), 12), "yyyy-MM-dd"),
    time: "2:00 PM",
    type: "Video Session",
    status: "Scheduled",
  },
  {
    id: "a3",
    therapistId: "t1",
    therapist: "Dr. Sarah Johnson",
    date: format(addDays(new Date(), -7), "yyyy-MM-dd"),
    time: "3:30 PM",
    type: "Video Session",
    status: "Completed",
    notes: "Initial consultation"
  },
];

const Appointments = () => {
  const { user } = useAuth();
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [selectedTherapist, setSelectedTherapist] = useState<string | undefined>();
  const [selectedTime, setSelectedTime] = useState<string | undefined>();
  const [sessionType, setSessionType] = useState<string>("video");
  const [notes, setNotes] = useState<string>("");
  const [activeTab, setActiveTab] = useState<string>("book");
  const [appointments, setAppointments] = useState<Appointment[]>(initialAppointments);
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);
  const [isRescheduling, setIsRescheduling] = useState(false);
  const [openRescheduleDialog, setOpenRescheduleDialog] = useState(false);
  const [openCancelDialog, setOpenCancelDialog] = useState(false);
  const [rescheduleDate, setRescheduleDate] = useState<Date | undefined>(undefined);
  const [rescheduleTime, setRescheduleTime] = useState<string | undefined>();
  const [isLoading, setIsLoading] = useState(false);
  
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

    setIsLoading(true);

    // Simulate network delay
    setTimeout(() => {
      const therapist = therapists.find(t => t.name === selectedTherapist);
      
      if (!therapist) {
        toast({
          title: "Error",
          description: "Selected therapist not found.",
          variant: "destructive",
        });
        setIsLoading(false);
        return;
      }

      const newAppointment: Appointment = {
        id: `a${Date.now()}`,
        therapistId: therapist.id,
        therapist: selectedTherapist,
        date: format(selectedDate, "yyyy-MM-dd"),
        time: selectedTime,
        type: sessionType === "video" 
          ? "Video Session" 
          : sessionType === "phone" 
            ? "Phone Session" 
            : "In-Person Session",
        status: "Confirmed",
        notes: notes || undefined
      };

      setAppointments(prev => [...prev, newAppointment]);

      // Reset form
      setSelectedTherapist(undefined);
      setSelectedTime(undefined);
      setSessionType("video");
      setNotes("");
      setActiveTab("upcoming");
      
      setIsLoading(false);

      toast({
        title: "Appointment Booked!",
        description: `Your appointment with ${selectedTherapist} on ${format(selectedDate, "PPP")} at ${selectedTime} has been scheduled.`,
      });
    }, 1000);
  };

  const handleRescheduleAppointment = () => {
    if (!rescheduleDate || !rescheduleTime || !selectedAppointment) {
      toast({
        title: "Missing information",
        description: "Please select a new date and time.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    // Simulate network delay
    setTimeout(() => {
      setAppointments(prev => 
        prev.map(appointment => 
          appointment.id === selectedAppointment.id
            ? {
                ...appointment,
                date: format(rescheduleDate, "yyyy-MM-dd"),
                time: rescheduleTime,
                status: "Rescheduled"
              }
            : appointment
        )
      );

      setOpenRescheduleDialog(false);
      setIsLoading(false);
      setRescheduleDate(undefined);
      setRescheduleTime(undefined);
      setSelectedAppointment(null);

      toast({
        title: "Appointment Rescheduled",
        description: `Your appointment has been rescheduled to ${format(rescheduleDate, "PPP")} at ${rescheduleTime}.`,
      });
    }, 1000);
  };

  const handleCancelAppointment = () => {
    if (!selectedAppointment) return;

    setIsLoading(true);

    // Simulate network delay
    setTimeout(() => {
      setAppointments(prev => 
        prev.map(appointment => 
          appointment.id === selectedAppointment.id
            ? { ...appointment, status: "Cancelled" }
            : appointment
        )
      );

      setOpenCancelDialog(false);
      setIsLoading(false);
      setSelectedAppointment(null);

      toast({
        title: "Appointment Cancelled",
        description: "Your appointment has been cancelled successfully.",
      });
    }, 1000);
  };

  const generateTimeSlots = () => {
    if (!selectedTherapist || !selectedDate) return [];
    
    const therapist = therapists.find(t => t.name === selectedTherapist);
    if (!therapist) return [];
    
    return therapist.availability.map(hour => {
      const time = `${hour}:00 ${hour >= 12 ? 'PM' : 'AM'}`;
      return { hour, time };
    });
  };

  const getTherapistImage = (id: string) => {
    const therapist = therapists.find(t => t.id === id);
    return therapist?.image || "";
  };

  const getTherapistById = (id: string) => {
    return therapists.find(t => t.id === id);
  };

  const getStatusColor = (status: AppointmentStatus) => {
    switch (status) {
      case "Confirmed":
        return "bg-green-100 text-green-800 dark:bg-green-800/30 dark:text-green-300";
      case "Pending":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-800/30 dark:text-yellow-300";
      case "Rescheduled":
        return "bg-blue-100 text-blue-800 dark:bg-blue-800/30 dark:text-blue-300";
      case "Cancelled":
        return "bg-red-100 text-red-800 dark:bg-red-800/30 dark:text-red-300";
      case "Completed":
        return "bg-gray-100 text-gray-800 dark:bg-gray-700/30 dark:text-gray-300";
      default:
        return "bg-blue-100 text-blue-800 dark:bg-blue-800/30 dark:text-blue-300";
    }
  };

  const upcomingAppointments = appointments.filter(
    appointment => 
      (appointment.status === "Confirmed" || appointment.status === "Rescheduled" || appointment.status === "Pending") &&
      isAfter(parseISO(appointment.date), new Date())
  ).sort((a, b) => {
    // Sort by date first
    const dateComparison = new Date(a.date).getTime() - new Date(b.date).getTime();
    if (dateComparison !== 0) return dateComparison;
    
    // If same date, sort by time
    return a.time.localeCompare(b.time);
  });

  const pastAppointments = appointments.filter(
    appointment => 
      appointment.status === "Completed" || 
      appointment.status === "Cancelled" ||
      isBefore(parseISO(appointment.date), new Date())
  ).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

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
                <TabsTrigger value="book" className="flex items-center gap-2">
                  <CalendarIconSolid className="h-4 w-4" />
                  Book Appointment
                </TabsTrigger>
                <TabsTrigger value="upcoming" className="flex items-center gap-2">
                  <Clock4 className="h-4 w-4" />
                  My Appointments
                </TabsTrigger>
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
                      initialFocus
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
                      <Select onValueChange={(value) => setSelectedTherapist(value)} value={selectedTherapist}>
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
                        value={sessionType}
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
                      disabled={!selectedDate || !selectedTherapist || !selectedTime || isLoading}
                    >
                      {isLoading ? (
                        <>
                          <span className="animate-spin mr-2">⏳</span>
                          Processing...
                        </>
                      ) : (
                        "Book Appointment"
                      )}
                    </Button>
                  </CardFooter>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="upcoming">
              <Tabs defaultValue="upcoming" className="w-full">
                <TabsList className="w-full max-w-md mx-auto grid grid-cols-2 mb-6">
                  <TabsTrigger value="upcoming">Upcoming</TabsTrigger>
                  <TabsTrigger value="past">Past Sessions</TabsTrigger>
                </TabsList>
                
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
                                  {format(new Date(appointment.date), "PPPP")} at {appointment.time}
                                </CardDescription>
                              </div>
                              <div className="flex-shrink-0">
                                <div
                                  className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(
                                    appointment.status
                                  )}`}
                                >
                                  {appointment.status}
                                </div>
                              </div>
                            </div>
                          </CardHeader>
                          <CardContent>
                            <div className="flex items-center gap-4 mb-4">
                              <img
                                src={getTherapistImage(appointment.therapistId)}
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
                                  {format(new Date(appointment.date), "MMMM d, yyyy")}
                                </p>
                                <p className="text-sm flex items-center gap-1">
                                  <User size={14} />
                                  {appointment.type}
                                </p>
                              </div>
                            </div>
                            {appointment.notes && (
                              <div className="mt-2 p-2 bg-muted rounded-md">
                                <p className="text-sm flex items-start gap-1">
                                  <MessageSquare size={14} className="mt-0.5 flex-shrink-0" />
                                  <span>{appointment.notes}</span>
                                </p>
                              </div>
                            )}
                          </CardContent>
                          <CardFooter className="flex gap-2">
                            <Dialog open={openRescheduleDialog && selectedAppointment?.id === appointment.id} onOpenChange={(open) => {
                              setOpenRescheduleDialog(open);
                              if (open) {
                                setSelectedAppointment(appointment);
                                setRescheduleDate(new Date(appointment.date));
                              }
                            }}>
                              <DialogTrigger asChild>
                                <Button variant="outline" className="w-1/2" disabled={appointment.status === "Cancelled"}>
                                  Reschedule
                                </Button>
                              </DialogTrigger>
                              <DialogContent>
                                <DialogHeader>
                                  <DialogTitle>Reschedule Appointment</DialogTitle>
                                  <DialogDescription>
                                    Choose a new date and time for your appointment with {appointment.therapist}.
                                  </DialogDescription>
                                </DialogHeader>
                                <div className="space-y-4 py-4">
                                  <div>
                                    <label className="block text-sm font-medium mb-2">
                                      New Date
                                    </label>
                                    <Calendar
                                      mode="single"
                                      selected={rescheduleDate}
                                      onSelect={setRescheduleDate}
                                      className="rounded-md border"
                                      disabled={(date) => {
                                        const today = new Date();
                                        today.setHours(0, 0, 0, 0);
                                        return (
                                          date < today ||
                                          date.getDay() === 0 ||
                                          date.getDay() === 6
                                        );
                                      }}
                                      initialFocus
                                    />
                                  </div>
                                  <div>
                                    <label className="block text-sm font-medium mb-2">
                                      New Time
                                    </label>
                                    <Select onValueChange={setRescheduleTime} value={rescheduleTime}>
                                      <SelectTrigger className="w-full">
                                        <SelectValue placeholder="Select a time" />
                                      </SelectTrigger>
                                      <SelectContent>
                                        {getTherapistById(appointment.therapistId)?.availability.map((hour) => (
                                          <SelectItem key={hour} value={`${hour}:00 ${hour >= 12 ? 'PM' : 'AM'}`}>
                                            {`${hour}:00 ${hour >= 12 ? 'PM' : 'AM'}`}
                                          </SelectItem>
                                        ))}
                                      </SelectContent>
                                    </Select>
                                  </div>
                                </div>
                                <DialogFooter>
                                  <Button variant="outline" onClick={() => setOpenRescheduleDialog(false)}>Cancel</Button>
                                  <Button onClick={handleRescheduleAppointment} disabled={!rescheduleDate || !rescheduleTime || isLoading}>
                                    {isLoading ? "Processing..." : "Confirm Reschedule"}
                                  </Button>
                                </DialogFooter>
                              </DialogContent>
                            </Dialog>

                            <AlertDialog open={openCancelDialog && selectedAppointment?.id === appointment.id} onOpenChange={(open) => {
                              setOpenCancelDialog(open);
                              if (open) {
                                setSelectedAppointment(appointment);
                              }
                            }}>
                              <AlertDialogTrigger asChild>
                                <Button variant="destructive" className="w-1/2" disabled={appointment.status === "Cancelled"}>
                                  Cancel
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>Cancel Appointment</AlertDialogTitle>
                                  <AlertDialogDescription>
                                    Are you sure you want to cancel your appointment with {appointment.therapist} on {format(new Date(appointment.date), "MMMM d")} at {appointment.time}?
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>No, keep appointment</AlertDialogCancel>
                                  <AlertDialogAction 
                                    onClick={handleCancelAppointment}
                                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                    disabled={isLoading}
                                  >
                                    {isLoading ? "Processing..." : "Yes, cancel appointment"}
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          </CardFooter>
                        </Card>
                      ))
                    ) : (
                      <div className="col-span-2 text-center py-10">
                        <div className="w-16 h-16 mx-auto bg-muted rounded-full flex items-center justify-center mb-4">
                          <CalendarIcon className="h-8 w-8 text-muted-foreground" />
                        </div>
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

                <TabsContent value="past">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {pastAppointments.length > 0 ? (
                      pastAppointments.map((appointment) => (
                        <Card key={appointment.id} className="therapy-card">
                          <CardHeader className="pb-2">
                            <div className="flex justify-between items-start">
                              <div>
                                <CardTitle className="text-xl">{appointment.therapist}</CardTitle>
                                <CardDescription>
                                  {format(new Date(appointment.date), "PPPP")} at {appointment.time}
                                </CardDescription>
                              </div>
                              <div className="flex-shrink-0">
                                <div
                                  className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(
                                    appointment.status
                                  )}`}
                                >
                                  {appointment.status}
                                </div>
                              </div>
                            </div>
                          </CardHeader>
                          <CardContent>
                            <div className="flex items-center gap-4 mb-4">
                              <img
                                src={getTherapistImage(appointment.therapistId)}
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
                                  {format(new Date(appointment.date), "MMMM d, yyyy")}
                                </p>
                                <p className="text-sm flex items-center gap-1">
                                  <User size={14} />
                                  {appointment.type}
                                </p>
                              </div>
                            </div>
                            {appointment.notes && (
                              <div className="mt-2 p-2 bg-muted rounded-md">
                                <p className="text-sm flex items-start gap-1">
                                  <MessageSquare size={14} className="mt-0.5 flex-shrink-0" />
                                  <span>{appointment.notes}</span>
                                </p>
                              </div>
                            )}
                          </CardContent>
                          <CardFooter className="flex gap-2">
                            {appointment.status === "Completed" ? (
                              <Button variant="outline" className="w-full">
                                View Session Notes
                              </Button>
                            ) : (
                              <Button 
                                variant={appointment.status === "Cancelled" ? "outline" : "default"}
                                className="w-full"
                                onClick={() => {
                                  setSelectedTherapist(appointment.therapist);
                                  setActiveTab("book");
                                  toast({
                                    title: "Book a new appointment",
                                    description: "Please select a date and time for your new appointment."
                                  });
                                }}
                              >
                                {appointment.status === "Cancelled" ? "Book New Appointment" : "Book Follow-up"}
                              </Button>
                            )}
                          </CardFooter>
                        </Card>
                      ))
                    ) : (
                      <div className="col-span-2 text-center py-10">
                        <div className="w-16 h-16 mx-auto bg-muted rounded-full flex items-center justify-center mb-4">
                          <CalendarIcon className="h-8 w-8 text-muted-foreground" />
                        </div>
                        <p className="text-gray-500 dark:text-gray-400 mb-4">
                          You don't have any past appointments.
                        </p>
                      </div>
                    )}
                  </div>
                </TabsContent>
              </Tabs>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </Layout>
  );
};

export default Appointments;
