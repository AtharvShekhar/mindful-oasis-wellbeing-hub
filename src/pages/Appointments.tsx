import { useState, useEffect } from "react";
import { Layout } from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { Calendar } from "@/components/ui/calendar"; // Import the Calendar component
import { Check, ArrowRight, CalendarIcon, BrainCircuit, Sparkles } from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
} from "recharts";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/components/AuthProvider";

type Mood = {
  id: string;
  date: Date;
  mood: number; // 1-5 scale
  notes: string;
  tags: string[];
};

type QuizQuestion = {
  id: number;
  question: string;
  options: {
    value: number;
    label: string;
  }[];
};

const MOOD_LABELS: Record<number, string> = {
  1: "Very Low",
  2: "Low",
  3: "Neutral",
  4: "Good",
  5: "Excellent",
};

const MOOD_COLORS: Record<number, string> = {
  1: "#76A9FA", // Blue-ish - calming, not too negative
  2: "#93C5FD",
  3: "#C4B5FD", // Purple - neutral
  4: "#DDD6FE",
  5: "#9B87F5", // Purple - positive
};

// Mental health assessment questions
const moodQuizQuestions: QuizQuestion[] = [
  {
    id: 1,
    question: "How would you rate your overall mood today?",
    options: [
      { value: 1, label: "Very low - I feel terrible" },
      { value: 2, label: "Low - I'm feeling down" },
      { value: 3, label: "Neutral - I'm okay" },
      { value: 4, label: "Good - I'm feeling positive" },
      { value: 5, label: "Excellent - I feel great" }
    ]
  },
  {
    id: 2,
    question: "How would you rate your energy level today?",
    options: [
      { value: 1, label: "Very low energy" },
      { value: 2, label: "Low energy" },
      { value: 3, label: "Moderate energy" },
      { value: 4, label: "Good energy" },
      { value: 5, label: "High energy" }
    ]
  },
  {
    id: 3,
    question: "How would you rate your anxiety level today?",
    options: [
      { value: 5, label: "No anxiety" },
      { value: 4, label: "Slight anxiety" },
      { value: 3, label: "Moderate anxiety" },
      { value: 2, label: "High anxiety" },
      { value: 1, label: "Severe anxiety" }
    ]
  },
  {
    id: 4,
    question: "How well did you sleep last night?",
    options: [
      { value: 1, label: "Very poorly" },
      { value: 2, label: "Poorly" },
      { value: 3, label: "Average" },
      { value: 4, label: "Well" },
      { value: 5, label: "Very well" }
    ]
  },
  {
    id: 5,
    question: "How would you rate your stress level today?",
    options: [
      { value: 5, label: "No stress" },
      { value: 4, label: "Minimal stress" },
      { value: 3, label: "Moderate stress" },
      { value: 2, label: "High stress" },
      { value: 1, label: "Extreme stress" }
    ]
  }
];

const MoodTracker = () => {
  // Demo data
  const [moodHistory, setMoodHistory] = useState<Mood[]>([
    {
      id: "1",
      date: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000),
      mood: 3,
      notes: "Feeling average today. Work was okay, nothing special.",
      tags: ["work", "neutral"],
    },
    {
      id: "2",
      date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
      mood: 2,
      notes: "Stressed about the project deadline. Not sleeping well.",
      tags: ["work", "stress", "sleep"],
    },
    {
      id: "3",
      date: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000),
      mood: 4,
      notes: "Had a good session with my therapist. Feeling more positive.",
      tags: ["therapy", "positive"],
    },
    {
      id: "4",
      date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
      mood: 5,
      notes: "Great day! Finished my project and got positive feedback.",
      tags: ["work", "achievement"],
    },
    {
      id: "5",
      date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
      mood: 3,
      notes: "Back to normal. Relaxed evening with friends.",
      tags: ["social", "relaxation"],
    },
    {
      id: "6",
      date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
      mood: 4,
      notes: "Productive day. Started a new book that I'm enjoying.",
      tags: ["productive", "reading"],
    },
  ]);

  const [currentMood, setCurrentMood] = useState<number | null>(null);
  const [notes, setNotes] = useState("");
  const [tags, setTags] = useState("");
  const [activeTab, setActiveTab] = useState("tracker");
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [quizAnswers, setQuizAnswers] = useState<Record<number, number>>({});
  const [quizCompleted, setQuizCompleted] = useState(false);
  const [quizResult, setQuizResult] = useState<number | null>(null);
  const { toast } = useToast();
  const { user } = useAuth();

  const handleMoodSelect = (mood: number) => {
    setCurrentMood(mood);
  };

  const handleSubmit = () => {
    if (currentMood === null) return;

    const newMood: Mood = {
      id: Date.now().toString(),
      date: new Date(),
      mood: currentMood,
      notes: notes,
      tags: tags.split(",").map(tag => tag.trim()).filter(Boolean),
    };

    setMoodHistory(prev => [...prev, newMood]);
    setCurrentMood(null);
    setNotes("");
    setTags("");
    
    toast({
      title: "Mood tracked!",
      description: `Your ${MOOD_LABELS[currentMood].toLowerCase()} mood has been recorded.`,
    });
  };

  const handleQuizAnswer = (questionId: number, value: number) => {
    setQuizAnswers(prev => ({
      ...prev,
      [questionId]: value
    }));
  };

  const handleNextQuestion = () => {
    if (currentQuestionIndex < moodQuizQuestions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
    } else {
      // Calculate result
      const total = Object.values(quizAnswers).reduce((sum, val) => sum + val, 0);
      const average = Math.round(total / moodQuizQuestions.length);
      setQuizResult(average);
      setQuizCompleted(true);
      
      // If user completes quiz, suggest adding this to mood tracker
      if (average && !currentMood) {
        setCurrentMood(average);
        setActiveTab("tracker");
        toast({
          title: "Quiz completed!",
          description: `Your mood assessment: ${MOOD_LABELS[average]}. We've set this as your current mood.`,
        });
      }
    }
  };

  const resetQuiz = () => {
    setQuizAnswers({});
    setCurrentQuestionIndex(0);
    setQuizCompleted(false);
    setQuizResult(null);
  };

  // Calculate average mood
  const averageMood = moodHistory.length > 0
    ? (moodHistory.reduce((sum, entry) => sum + entry.mood, 0) / moodHistory.length).toFixed(1)
    : "N/A";

  // Get most common tags
  const tagCounts: Record<string, number> = {};
  moodHistory.forEach(entry => {
    entry.tags.forEach(tag => {
      tagCounts[tag] = (tagCounts[tag] || 0) + 1;
    });
  });

  const topTags = Object.entries(tagCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([tag]) => tag);

  // Chart data
  const chartData = moodHistory.map(entry => ({
    date: entry.date.toLocaleDateString("en-US", { month: "short", day: "numeric" }),
    mood: entry.mood,
    name: MOOD_LABELS[entry.mood],
  }));

  // Calculate progress in quiz
  const quizProgress = moodQuizQuestions.length > 0
    ? ((currentQuestionIndex + 1) / moodQuizQuestions.length) * 100
    : 0;

  return (
    <Layout>
      <div className="min-h-[calc(100vh-64px)] bg-therapy-softPurple/10 dark:bg-therapy-dark/20 py-8 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-3xl md:text-4xl font-display font-bold mb-2">Mood Tracker</h1>
            <p className="text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
              Monitor your emotional well-being over time and identify patterns that affect your mental health.
            </p>
          </div>

          <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-8">
            <TabsList className="grid w-full max-w-md mx-auto grid-cols-2 mb-8">
              <TabsTrigger value="tracker" className="flex items-center gap-2">
                <CalendarIcon className="w-4 h-4" />
                Mood Tracker
              </TabsTrigger>
              <TabsTrigger value="assessment" className="flex items-center gap-2">
                <BrainCircuit className="w-4 h-4" />
                Mood Assessment
              </TabsTrigger>
            </TabsList>

            <TabsContent value="tracker">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                {/* Today's Mood Card */}
                <Card className="therapy-card col-span-1">
                  <CardHeader>
                    <CardTitle className="text-xl">How are you feeling today?</CardTitle>
                    <CardDescription>Select your current mood</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex justify-between items-center mb-6">
                      {[1, 2, 3, 4, 5].map((mood) => (
                        <button
                          key={mood}
                          className={`w-12 h-12 rounded-full flex items-center justify-center transition-transform ${
                            currentMood === mood
                              ? "ring-2 ring-therapy-primary scale-110"
                              : "hover:scale-105"
                          }`}
                          style={{ backgroundColor: MOOD_COLORS[mood] }}
                          onClick={() => handleMoodSelect(mood)}
                        >
                          <span className="text-lg font-semibold text-white">
                            {mood}
                          </span>
                        </button>
                      ))}
                    </div>
                    <div className="flex justify-between px-2 text-xs text-gray-500">
                      <span>Very Low</span>
                      <span className="ml-auto">Excellent</span>
                    </div>
                    <div className="mt-4">
                      <label className="block text-sm font-medium mb-2">
                        Notes (optional)
                      </label>
                      <Textarea
                        placeholder="How are you feeling? What happened today?"
                        className="input-therapy min-h-[100px]"
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                      />
                    </div>
                    <div className="mt-4">
                      <label className="block text-sm font-medium mb-2">
                        Tags (comma separated)
                      </label>
                      <Input
                        placeholder="work, exercise, family, stress"
                        className="input-therapy"
                        value={tags}
                        onChange={(e) => setTags(e.target.value)}
                      />
                    </div>
                  </CardContent>
                  <CardFooter>
                    <Button
                      className="w-full btn-primary"
                      onClick={handleSubmit}
                      disabled={currentMood === null}
                    >
                      Save Mood Entry
                    </Button>
                  </CardFooter>
                </Card>

                {/* Mood Chart Card */}
                <Card className="therapy-card col-span-1 md:col-span-2">
                  <CardHeader>
                    <CardTitle className="text-xl">Your Mood History</CardTitle>
                    <CardDescription>See how your mood has changed over time</CardDescription>
                  </CardHeader>
                  <CardContent className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={chartData} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                        <XAxis dataKey="date" />
                        <YAxis
                          domain={[1, 5]}
                          ticks={[1, 2, 3, 4, 5]}
                          tickFormatter={(value) => MOOD_LABELS[value as number].split(" ")[0]}
                        />
                        <Tooltip
                          contentStyle={{
                            backgroundColor: "rgba(255, 255, 255, 0.8)",
                            borderRadius: "8px",
                            border: "none",
                            boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)",
                          }}
                          formatter={(value, name) => [MOOD_LABELS[value as number], "Mood"]}
                        />
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
                  </CardContent>
                </Card>
              </div>

              {/* Insights Row */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                {/* Average Mood Card */}
                <Card className="therapy-card text-center">
                  <CardHeader>
                    <CardTitle className="text-lg">Average Mood</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-4xl font-bold text-therapy-primary">{averageMood}</div>
                    <p className="text-sm text-gray-500 mt-2">
                      {Number(averageMood) >= 4
                        ? "You've been feeling quite positive lately!"
                        : Number(averageMood) >= 3
                        ? "Your mood has been stable recently."
                        : "Your mood has been lower than usual. Consider talking to someone."}
                    </p>
                  </CardContent>
                </Card>

                {/* Common Factors Card */}
                <Card className="therapy-card text-center">
                  <CardHeader>
                    <CardTitle className="text-lg">Common Factors</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-wrap justify-center gap-2">
                      {topTags.map(tag => (
                        <span
                          key={tag}
                          className="px-3 py-1 bg-therapy-softPurple/30 dark:bg-therapy-dark/30 rounded-full text-sm"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                    <p className="text-sm text-gray-500 mt-4">
                      These are the most common factors in your mood entries
                    </p>
                  </CardContent>
                </Card>

                {/* Mood Distribution Card */}
                <Card className="therapy-card">
                  <CardHeader>
                    <CardTitle className="text-lg">Mood Distribution</CardTitle>
                  </CardHeader>
                  <CardContent className="h-[160px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        data={Object.entries(MOOD_LABELS).map(([value, label]) => {
                          const count = moodHistory.filter(entry => entry.mood === Number(value)).length;
                          return { value: Number(value), label, count };
                        })}
                        margin={{ top: 5, right: 10, bottom: 5, left: 10 }}
                        barSize={20}
                      >
                        <XAxis
                          dataKey="label"
                          scale="point"
                          tickFormatter={(value) => value.split(" ")[0]}
                        />
                        <YAxis hide />
                        <Tooltip
                          formatter={(value) => [value, "Entries"]}
                          contentStyle={{
                            backgroundColor: "rgba(255, 255, 255, 0.8)",
                            borderRadius: "8px",
                            border: "none",
                            boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)",
                          }}
                        />
                        <Bar
                          dataKey="count"
                          fill="#9b87f5"
                          background={{ fill: "rgba(155, 135, 245, 0.1)" }}
                          radius={[4, 4, 0, 0]}
                        />
                      </BarChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              </div>

              {/* Recent Entries */}
              <Card className="therapy-card mb-8">
                <CardHeader>
                  <CardTitle className="text-xl">Recent Mood Entries</CardTitle>
                  <CardDescription>Your latest mood check-ins</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {moodHistory
                      .sort((a, b) => b.date.getTime() - a.date.getTime())
                      .slice(0, 5)
                      .map((entry) => (
                        <div
                          key={entry.id}
                          className="p-4 rounded-lg border border-therapy-softPurple/20 hover:border-therapy-primary/20 transition-colors"
                        >
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center">
                              <div
                                className="w-10 h-10 rounded-full flex items-center justify-center text-white"
                                style={{ backgroundColor: MOOD_COLORS[entry.mood] }}
                              >
                                {entry.mood}
                              </div>
                              <div className="ml-3">
                                <h3 className="font-medium">{MOOD_LABELS[entry.mood]}</h3>
                                <p className="text-xs text-gray-500">
                                  {entry.date.toLocaleDateString("en-US", {
                                    weekday: "long",
                                    month: "short",
                                    day: "numeric",
                                  })}
                                </p>
                              </div>
                            </div>
                            <div className="flex flex-wrap gap-1">
                              {entry.tags.map((tag) => (
                                <span
                                  key={tag}
                                  className="px-2 py-0.5 bg-therapy-softPurple/20 rounded-full text-xs"
                                >
                                  {tag}
                                </span>
                              ))}
                            </div>
                          </div>
                          {entry.notes && (
                            <p className="text-sm text-gray-600 dark:text-gray-300 mt-2">
                              {entry.notes}
                            </p>
                          )}
                        </div>
                      ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="assessment">
              <Card className="therapy-card max-w-3xl mx-auto">
                <CardHeader>
                  <CardTitle className="text-xl flex items-center gap-2">
                    <BrainCircuit className="h-6 w-6" />
                    Mental Health Assessment
                  </CardTitle>
                  <CardDescription>
                    Take a quick assessment to measure your current mental wellbeing
                  </CardDescription>
                  {!quizCompleted && (
                    <div className="mt-2">
                      <Progress value={quizProgress} className="h-2 w-full" />
                      <p className="text-xs text-muted-foreground mt-1">
                        Question {currentQuestionIndex + 1} of {moodQuizQuestions.length}
                      </p>
                    </div>
                  )}
                </CardHeader>
                
                <CardContent>
                  {!quizCompleted ? (
                    <div className="space-y-6">
                      <div className="space-y-2">
                        <h3 className="text-lg font-medium">
                          {moodQuizQuestions[currentQuestionIndex].question}
                        </h3>
                        <RadioGroup
                          value={quizAnswers[moodQuizQuestions[currentQuestionIndex].id]?.toString()}
                          onValueChange={(value) => 
                            handleQuizAnswer(moodQuizQuestions[currentQuestionIndex].id, parseInt(value))
                          }
                          className="space-y-3 mt-4"
                        >
                          {moodQuizQuestions[currentQuestionIndex].options.map((option) => (
                            <div key={option.value} className="flex items-center space-x-2">
                              <RadioGroupItem 
                                value={option.value.toString()} 
                                id={`option-${option.value}`}
                                className="text-therapy-primary"
                              />
                              <Label htmlFor={`option-${option.value}`} className="cursor-pointer">
                                {option.label}
                              </Label>
                            </div>
                          ))}
                        </RadioGroup>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center space-y-6">
                      <div className="flex flex-col items-center space-y-2">
                        <div 
                          className="w-24 h-24 rounded-full flex items-center justify-center text-white text-4xl font-bold"
                          style={{ backgroundColor: MOOD_COLORS[quizResult || 3] }}
                        >
                          {quizResult}
                        </div>
                        <h3 className="text-xl font-semibold mt-4">{quizResult && MOOD_LABELS[quizResult]}</h3>
                        <p className="text-muted-foreground max-w-md">
                          {quizResult && quizResult >= 4 
                            ? "Your mood score indicates you're feeling positive. Great job maintaining your mental wellbeing!"
                            : quizResult && quizResult === 3
                              ? "Your mood score is neutral. Consider activities that might boost your mood."
                              : "Your mood score is lower than average. Consider reaching out to someone you trust or a mental health professional."}
                        </p>
                      </div>

                      <div className="bg-therapy-softPurple/10 p-4 rounded-lg max-w-md mx-auto">
                        <h4 className="font-medium flex items-center gap-1 mb-2">
                          <Sparkles className="h-4 w-4" />
                          Recommendation
                        </h4>
                        <p className="text-sm">
                          {quizResult && quizResult >= 4 
                            ? "Continue with activities that maintain your positive mood, like exercise, socializing, and mindfulness."
                            : quizResult && quizResult === 3
                              ? "Try incorporating more self-care activities into your routine, like walking in nature, journaling, or talking with friends."
                              : "Consider speaking with a professional. In the meantime, focus on basic self-care like adequate sleep, nutrition, and gentle movement."}
                        </p>
                      </div>
                    </div>
                  )}
                </CardContent>

                <CardFooter className="flex justify-between">
                  {!quizCompleted ? (
                    <>
                      {currentQuestionIndex > 0 && (
                        <Button
                          variant="outline"
                          onClick={() => setCurrentQuestionIndex(prev => prev - 1)}
                        >
                          Previous
                        </Button>
                      )}
                      <div className="flex-1" />
                      <Button
                        onClick={handleNextQuestion}
                        disabled={!quizAnswers[moodQuizQuestions[currentQuestionIndex]?.id]}
                        className="ml-auto"
                      >
                        {currentQuestionIndex < moodQuizQuestions.length - 1 ? (
                          <>
                            Next
                            <ArrowRight className="ml-2 h-4 w-4" />
                          </>
                        ) : (
                          <>
                            Complete
                            <Check className="ml-2 h-4 w-4" />
                          </>
                        )}
                      </Button>
                    </>
                  ) : (
                    <>
                      <Button variant="outline" onClick={resetQuiz}>
                        Take Assessment Again
                      </Button>
                      <Button 
                        onClick={() => {
                          if (quizResult) {
                            setCurrentMood(quizResult);
                            setActiveTab("tracker");
                            toast({
                              title: "Mood transferred",
                              description: "Your assessment result has been added to the mood tracker."
                            });
                          }
                        }}
                      >
                        Add to Mood Tracker
                      </Button>
                    </>
                  )}
                </CardFooter>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </Layout>
  );
};

export default MoodTracker;
