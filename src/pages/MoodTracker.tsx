
import { useState } from "react";
import { Layout } from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
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

type Mood = {
  id: string;
  date: Date;
  mood: number; // 1-5 scale
  notes: string;
  tags: string[];
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
  };

  // Prepare data for charts
  const chartData = moodHistory.map(entry => ({
    date: entry.date.toLocaleDateString("en-US", { month: "short", day: "numeric" }),
    mood: entry.mood,
    name: MOOD_LABELS[entry.mood],
  }));

  // Calculate average mood
  const averageMood = moodHistory.length > 0
    ? (moodHistory.reduce((sum, entry) => sum + entry.mood, 0) / moodHistory.length).toFixed(1)
    : "N/A";

  // Get most frequent tags
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
                  <Textarea
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
        </div>
      </div>
    </Layout>
  );
};

export default MoodTracker;
