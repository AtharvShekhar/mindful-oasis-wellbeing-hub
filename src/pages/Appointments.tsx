
import { useState, useEffect } from "react";
import { Layout } from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/components/AuthProvider";
import { CalendarClock, CheckCircle, Clock, Info, MapPin, User, Video } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

const therapistData = [
  {
    id: 1,
    name: "Dr. Sarah Johnson",
    specialty: "Anxiety & Stress Management",
    image: "https://images.unsplash.com/photo-1551836022-d5d88e9218df?w=400&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTB8fHRoZXJhcGlzdHxlbnwwfHwwfHx8MA%3D%3D",
    available: ["Monday", "Wednesday", "Friday"],
    bio: "Dr. Johnson specializes in cognitive behavioral therapy and has over 10 years of experience helping clients manage anxiety and stress-related issues.",
    price: "$120 per session",
    rating: 4.8,
  },
  {
    id: 2,
    name: "Dr. Michael Chen",
    specialty: "Depression & Mood Disorders",
    image: "https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=400&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTJ8fHRoZXJhcGlzdHxlbnwwfHwwfHx8MA%3D%3D",
    available: ["Tuesday", "Thursday", "Saturday"],
    bio: "Dr. Chen combines evidence-based therapeutic approaches with mindfulness techniques to help clients overcome depression and improve their emotional wellbeing.",
    price: "$135 per session",
    rating: 4.7,
  },
  {
    id: 3,
    name: "Dr. Emily Rodriguez",
    specialty: "Trauma & PTSD",
    image: "https://images.unsplash.com/photo-1594824476967-48c8b964273f?w=400&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MjZ8fHRoZXJhcGlzdHxlbnwwfHwwfHx8MA%3D%3D",
    available: ["Monday", "Tuesday", "Thursday", "Friday"],
    bio: "Dr. Rodriguez is experienced in EMDR and other trauma-focused therapies, helping clients process and heal from traumatic experiences.",
    price: "$150 per session",
    rating: 4.9,
  },
];

const timeSlots = [
  "9:00 AM", "10:00 AM", "11:00 AM", 
  "1:00 PM", "2:00 PM", "3:00 PM", "4:00 PM", "5:00 PM"
];

const AppointmentScheduler = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("find");
  const [selectedTherapist, setSelectedTherapist] = useState(null);
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedTime, setSelectedTime] = useState("");
  const [appointmentType, setAppointmentType] = useState("video");
  const [notes, setNotes] = useState("");
  const [bookingStep, setBookingStep] = useState(0);
  const [myAppointments, setMyAppointments] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  const maxDate = new Date();
  maxDate.setMonth(maxDate.getMonth() + 2);

  const isWeekend = (date) => {
    const day = date.getDay();
    return day === 0 || day === 6;
  };

  const isAvailableDay = (date) => {
    if (!selectedTherapist) return true;
    
    const dayNames = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
    const dayName = dayNames[date.getDay()];
    return selectedTherapist.available.includes(dayName);
  };

  const isDayDisabled = (date) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    return (
      date < today || 
      date > maxDate || 
      isWeekend(date) || 
      !isAvailableDay(date)
    );
  };

  const handleTherapistSelect = (therapist) => {
    setSelectedTherapist(therapist);
    setBookingStep(1);
  };

  const handleDateSelect = (date) => {
    setSelectedDate(date);
    setBookingStep(2);
  };

  const handleTimeSelect = (time) => {
    setSelectedTime(time);
    setBookingStep(3);
  };

  const handleBookAppointment = async () => {
    if (!user) {
      toast({
        title: "Login required",
        description: "Please sign in to book an appointment",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    // For demonstration, we'll just add to local state
    // In a real application, this would be saved to a database
    try {
      const newAppointment = {
        id: Date.now().toString(),
        therapistId: selectedTherapist.id,
        therapistName: selectedTherapist.name,
        therapistImage: selectedTherapist.image,
        specialty: selectedTherapist.specialty,
        date: selectedDate,
        time: selectedTime,
        type: appointmentType,
        notes: notes,
        status: "confirmed",
      };

      setMyAppointments([...myAppointments, newAppointment]);
      
      // Reset form
      setSelectedTherapist(null);
      setSelectedDate(null);
      setSelectedTime("");
      setAppointmentType("video");
      setNotes("");
      setBookingStep(0);
      
      // Show success toast
      toast({
        title: "Appointment scheduled",
        description: `Your appointment with ${selectedTherapist.name} has been confirmed`,
      });
      
      // Switch to My Appointments tab
      setActiveTab("appointments");
    } catch (error) {
      console.error("Error booking appointment:", error);
      toast({
        title: "Booking failed",
        description: "There was an error scheduling your appointment. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const formatAppointmentDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const cancelAppointment = (id) => {
    setMyAppointments(myAppointments.filter(app => app.id !== id));
    toast({
      title: "Appointment cancelled",
      description: "Your appointment has been successfully cancelled",
    });
  };

  return (
    <Layout>
      <div className="min-h-[calc(100vh-64px)] bg-therapy-softPurple/10 dark:bg-therapy-dark/20 py-8 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-3xl md:text-4xl font-display font-bold mb-2">Therapy Appointments</h1>
            <p className="text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
              Schedule sessions with qualified therapists and manage your appointments
            </p>
          </div>

          <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-8">
            <TabsList className="grid w-full max-w-md mx-auto grid-cols-2 mb-8">
              <TabsTrigger value="find" className="flex items-center gap-2">
                <User className="w-4 h-4" />
                Find a Therapist
              </TabsTrigger>
              <TabsTrigger value="appointments" className="flex items-center gap-2">
                <CalendarClock className="w-4 h-4" />
                My Appointments
              </TabsTrigger>
            </TabsList>

            <TabsContent value="find">
              {bookingStep === 0 && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {therapistData.map(therapist => (
                    <Card key={therapist.id} className="therapy-card overflow-hidden">
                      <div className="h-48 overflow-hidden">
                        <img 
                          src={therapist.image} 
                          alt={therapist.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <CardHeader>
                        <CardTitle>{therapist.name}</CardTitle>
                        <CardDescription>{therapist.specialty}</CardDescription>
                        <div className="flex items-center mt-2">
                          <div className="flex">
                            {[...Array(5)].map((_, i) => (
                              <svg 
                                key={i} 
                                className={`w-4 h-4 ${i < Math.floor(therapist.rating) ? "text-yellow-500" : "text-gray-300"}`} 
                                fill="currentColor" 
                                viewBox="0 0 20 20"
                              >
                                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                              </svg>
                            ))}
                          </div>
                          <span className="ml-1 text-sm text-gray-500">{therapist.rating}</span>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">
                          {therapist.bio}
                        </p>
                        <div className="flex flex-wrap gap-1 mb-4">
                          {therapist.available.map(day => (
                            <span 
                              key={day} 
                              className="text-xs bg-therapy-softPurple/20 px-2 py-1 rounded-full"
                            >
                              {day}
                            </span>
                          ))}
                        </div>
                        <p className="text-sm font-medium">{therapist.price}</p>
                      </CardContent>
                      <CardFooter>
                        <Button 
                          className="w-full" 
                          onClick={() => handleTherapistSelect(therapist)}
                        >
                          Schedule Appointment
                        </Button>
                      </CardFooter>
                    </Card>
                  ))}
                </div>
              )}

              {bookingStep > 0 && selectedTherapist && (
                <Card className="therapy-card max-w-2xl mx-auto">
                  <CardHeader>
                    <div className="flex items-center gap-4">
                      <div className="w-16 h-16 rounded-full overflow-hidden">
                        <img 
                          src={selectedTherapist.image} 
                          alt={selectedTherapist.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div>
                        <CardTitle>{selectedTherapist.name}</CardTitle>
                        <CardDescription>{selectedTherapist.specialty}</CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-6">
                      {/* Step 1: Select Date */}
                      <div className={`space-y-4 ${bookingStep === 1 ? 'block' : 'hidden'}`}>
                        <h3 className="text-lg font-medium">Select a date</h3>
                        <p className="text-sm text-gray-500">
                          {selectedTherapist.name} is available on: {selectedTherapist.available.join(', ')}
                        </p>
                        <div className="flex justify-center my-4">
                          <Calendar
                            mode="single"
                            selected={selectedDate}
                            onSelect={handleDateSelect}
                            disabled={isDayDisabled}
                            className="rounded-md border"
                          />
                        </div>
                      </div>

                      {/* Step 2: Select Time */}
                      <div className={`space-y-4 ${bookingStep === 2 ? 'block' : 'hidden'}`}>
                        <h3 className="text-lg font-medium">Select a time</h3>
                        <p className="text-sm text-gray-500 mb-4">
                          Available time slots for {selectedDate?.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
                        </p>
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                          {timeSlots.map(time => (
                            <Button
                              key={time}
                              variant={selectedTime === time ? "default" : "outline"}
                              className="justify-center"
                              onClick={() => handleTimeSelect(time)}
                            >
                              {time}
                            </Button>
                          ))}
                        </div>
                      </div>

                      {/* Step 3: Appointment Details */}
                      <div className={`space-y-4 ${bookingStep === 3 ? 'block' : 'hidden'}`}>
                        <h3 className="text-lg font-medium">Appointment Details</h3>
                        
                        <div className="space-y-4">
                          <div>
                            <label className="text-sm font-medium block mb-1">Appointment Type</label>
                            <Select 
                              value={appointmentType} 
                              onValueChange={setAppointmentType}
                            >
                              <SelectTrigger className="w-full">
                                <SelectValue placeholder="Select type" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="video">
                                  <div className="flex items-center">
                                    <Video className="w-4 h-4 mr-2" />
                                    Video Call
                                  </div>
                                </SelectItem>
                                <SelectItem value="inperson">
                                  <div className="flex items-center">
                                    <MapPin className="w-4 h-4 mr-2" />
                                    In-Person
                                  </div>
                                </SelectItem>
                                <SelectItem value="phone">
                                  <div className="flex items-center">
                                    <Clock className="w-4 h-4 mr-2" />
                                    Phone Call
                                  </div>
                                </SelectItem>
                              </SelectContent>
                            </Select>
                          </div>

                          <div>
                            <label className="text-sm font-medium block mb-1">Notes (optional)</label>
                            <Textarea
                              placeholder="Any specific concerns or topics you'd like to discuss"
                              className="min-h-[100px]"
                              value={notes}
                              onChange={(e) => setNotes(e.target.value)}
                            />
                          </div>

                          <div className="p-4 bg-therapy-softPurple/10 rounded-lg">
                            <h4 className="font-medium mb-2 flex items-center">
                              <Info className="w-4 h-4 mr-2" />
                              Appointment Summary
                            </h4>
                            <ul className="space-y-2 text-sm">
                              <li className="flex justify-between">
                                <span className="text-gray-500">Therapist:</span>
                                <span className="font-medium">{selectedTherapist.name}</span>
                              </li>
                              <li className="flex justify-between">
                                <span className="text-gray-500">Date:</span>
                                <span className="font-medium">
                                  {selectedDate?.toLocaleDateString('en-US', { 
                                    weekday: 'long', 
                                    month: 'long', 
                                    day: 'numeric' 
                                  })}
                                </span>
                              </li>
                              <li className="flex justify-between">
                                <span className="text-gray-500">Time:</span>
                                <span className="font-medium">{selectedTime}</span>
                              </li>
                              <li className="flex justify-between">
                                <span className="text-gray-500">Type:</span>
                                <span className="font-medium">
                                  {appointmentType === 'video' ? 'Video Call' : 
                                   appointmentType === 'inperson' ? 'In-Person' : 'Phone Call'}
                                </span>
                              </li>
                              <li className="flex justify-between">
                                <span className="text-gray-500">Session Fee:</span>
                                <span className="font-medium">{selectedTherapist.price}</span>
                              </li>
                            </ul>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter className="flex justify-between">
                    <Button 
                      variant="outline" 
                      onClick={() => setBookingStep(Math.max(0, bookingStep - 1))}
                      disabled={bookingStep === 0 || isLoading}
                    >
                      Back
                    </Button>
                    {bookingStep < 3 ? (
                      <Button 
                        disabled={
                          (bookingStep === 1 && !selectedDate) ||
                          (bookingStep === 2 && !selectedTime) ||
                          isLoading
                        }
                        onClick={() => setBookingStep(bookingStep + 1)}
                      >
                        Continue
                      </Button>
                    ) : (
                      <Button 
                        onClick={handleBookAppointment}
                        disabled={isLoading}
                      >
                        {isLoading ? "Booking..." : "Confirm Appointment"}
                      </Button>
                    )}
                  </CardFooter>
                </Card>
              )}
            </TabsContent>

            <TabsContent value="appointments">
              <div className="max-w-3xl mx-auto">
                <Card className="therapy-card">
                  <CardHeader>
                    <CardTitle className="text-xl">My Appointments</CardTitle>
                    <CardDescription>Your scheduled therapy sessions</CardDescription>
                  </CardHeader>
                  <CardContent>
                    {myAppointments.length === 0 ? (
                      <div className="text-center py-8">
                        <CalendarClock className="w-12 h-12 mx-auto text-gray-400 mb-4" />
                        <h3 className="text-lg font-medium mb-2">No appointments scheduled</h3>
                        <p className="text-gray-500 mb-4">Book your first appointment with a therapist.</p>
                        <Button onClick={() => setActiveTab("find")}>
                          Find a Therapist
                        </Button>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {myAppointments.map(appointment => (
                          <div 
                            key={appointment.id}
                            className="p-4 rounded-lg border border-therapy-softPurple/20 hover:border-therapy-primary/20 transition-colors"
                          >
                            <div className="flex items-center justify-between mb-4">
                              <div className="flex items-center">
                                <div className="w-12 h-12 rounded-full overflow-hidden mr-4">
                                  <img 
                                    src={appointment.therapistImage}
                                    alt={appointment.therapistName}
                                    className="w-full h-full object-cover"
                                  />
                                </div>
                                <div>
                                  <h3 className="font-medium">{appointment.therapistName}</h3>
                                  <p className="text-sm text-gray-500">{appointment.specialty}</p>
                                </div>
                              </div>
                              <div className="flex items-center">
                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                  <CheckCircle className="w-3 h-3 mr-1" />
                                  {appointment.status}
                                </span>
                              </div>
                            </div>
                            
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                              <div>
                                <p className="text-xs text-gray-500 mb-1">Date</p>
                                <p className="text-sm font-medium">
                                  {formatAppointmentDate(appointment.date)}
                                </p>
                              </div>
                              <div>
                                <p className="text-xs text-gray-500 mb-1">Time</p>
                                <p className="text-sm font-medium">{appointment.time}</p>
                              </div>
                              <div>
                                <p className="text-xs text-gray-500 mb-1">Type</p>
                                <p className="text-sm font-medium">
                                  {appointment.type === 'video' ? 'Video Call' : 
                                   appointment.type === 'inperson' ? 'In-Person' : 'Phone Call'}
                                </p>
                              </div>
                            </div>
                            
                            {appointment.notes && (
                              <div className="mb-4">
                                <p className="text-xs text-gray-500 mb-1">Notes</p>
                                <p className="text-sm">{appointment.notes}</p>
                              </div>
                            )}
                            
                            <div className="flex justify-end space-x-2">
                              <Button variant="outline" size="sm">
                                {appointment.type === 'video' ? 'Join Video' : 'View Details'}
                              </Button>
                              <Button 
                                variant="outline" 
                                size="sm"
                                onClick={() => cancelAppointment(appointment.id)}
                                className="text-red-500 hover:text-red-700"
                              >
                                Cancel
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </Layout>
  );
};

export default AppointmentScheduler;
