
import { useState } from "react";
import { Layout } from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Book, Video, BookOpen, Heart, ArrowRight } from "lucide-react";

// Mock data for resources
const resources = {
  articles: [
    {
      id: "a1",
      title: "Understanding Anxiety: Causes and Coping Strategies",
      category: "Anxiety",
      author: "Dr. Sarah Johnson",
      readTime: "8 min read",
      summary: "Learn about the biological and psychological factors that contribute to anxiety and discover evidence-based techniques to manage symptoms.",
      imageUrl: "https://images.unsplash.com/photo-1474377207190-a7d8b3334068?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1770&q=80",
      tags: ["anxiety", "mental health", "coping strategies"],
    },
    {
      id: "a2",
      title: "The Science of Meditation: How Mindfulness Changes Your Brain",
      category: "Mindfulness",
      author: "Dr. Michael Chen",
      readTime: "12 min read",
      summary: "Explore the neuroscience behind meditation and how regular mindfulness practice can physically alter brain structure and function.",
      imageUrl: "https://images.unsplash.com/photo-1506126613408-eca07ce68773?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1799&q=80",
      tags: ["meditation", "mindfulness", "neuroscience"],
    },
    {
      id: "a3",
      title: "Building Resilience: Techniques for Emotional Strength",
      category: "Resilience",
      author: "Emma Watkins, LMFT",
      readTime: "10 min read",
      summary: "Discover practical ways to develop emotional resilience and bounce back from life's challenges with greater strength and perspective.",
      imageUrl: "https://images.unsplash.com/photo-1518430435478-5a4e5699441d?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1770&q=80",
      tags: ["resilience", "emotional health", "personal growth"],
    },
    {
      id: "a4",
      title: "The Connection Between Sleep and Mental Health",
      category: "Sleep",
      author: "Dr. Robert Thompson",
      readTime: "7 min read",
      summary: "Understand how sleep quality affects your psychological well-being and learn strategies for improving sleep hygiene.",
      imageUrl: "https://images.unsplash.com/photo-1541781774459-bb2af2f05b55?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1760&q=80",
      tags: ["sleep", "mental health", "wellbeing"],
    },
  ],
  videos: [
    {
      id: "v1",
      title: "5-Minute Breathing Exercise for Stress Relief",
      category: "Stress Management",
      creator: "Mindful Living",
      duration: "5:23",
      description: "A guided breathing exercise designed to quickly reduce stress and bring your mind back to the present moment.",
      thumbnailUrl: "https://images.unsplash.com/photo-1545205597-3d9d02c29597?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1770&q=80",
      tags: ["stress relief", "breathing", "mindfulness"],
    },
    {
      id: "v2",
      title: "Understanding Cognitive Behavioral Therapy",
      category: "Therapy",
      creator: "Psychology Insights",
      duration: "15:42",
      description: "An introduction to the principles of CBT and how this therapeutic approach helps reframe negative thought patterns.",
      thumbnailUrl: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1776&q=80",
      tags: ["CBT", "therapy", "mental health"],
    },
    {
      id: "v3",
      title: "Gentle Yoga for Anxiety and Depression",
      category: "Movement",
      creator: "Wellness Together",
      duration: "28:10",
      description: "A gentle yoga sequence specifically designed to help alleviate symptoms of anxiety and depression through mindful movement.",
      thumbnailUrl: "https://images.unsplash.com/photo-1552196563-55cd4e45efb3?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1826&q=80",
      tags: ["yoga", "anxiety", "movement", "depression"],
    },
    {
      id: "v4",
      title: "Morning Meditation for Positive Energy",
      category: "Meditation",
      creator: "Present Mind",
      duration: "12:15",
      description: "Start your day with this guided meditation designed to cultivate positive energy and set meaningful intentions.",
      thumbnailUrl: "https://images.unsplash.com/photo-1508672019048-805c876b67e2?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1819&q=80",
      tags: ["meditation", "positive energy", "morning routine"],
    },
  ],
  exercises: [
    {
      id: "e1",
      title: "Gratitude Journaling Practice",
      category: "Gratitude",
      duration: "5-10 minutes",
      description: "A structured daily journaling exercise to cultivate gratitude and shift focus toward positive aspects of life. Includes prompts and reflection questions.",
      imageUrl: "https://images.unsplash.com/photo-1471107340929-a87cd0f5b5f3?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1773&q=80",
      tags: ["journaling", "gratitude", "positive psychology"],
    },
    {
      id: "e2",
      title: "Progressive Muscle Relaxation",
      category: "Relaxation",
      duration: "15 minutes",
      description: "A systematic technique for reducing physical tension by alternately tensing and relaxing muscle groups throughout the body.",
      imageUrl: "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1820&q=80",
      tags: ["relaxation", "stress relief", "body awareness"],
    },
    {
      id: "e3",
      title: "Thought Challenging Worksheet",
      category: "Cognitive Reframing",
      duration: "15-20 minutes",
      description: "A structured worksheet for identifying and challenging negative thought patterns using cognitive behavioral techniques.",
      imageUrl: "https://images.unsplash.com/photo-1455849318743-b2233052fcff?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1769&q=80",
      tags: ["CBT", "thought patterns", "cognitive reframing"],
    },
    {
      id: "e4",
      title: "Loving-Kindness Meditation Script",
      category: "Compassion",
      duration: "10 minutes",
      description: "A guided meditation script for developing compassion toward yourself and others through repeating phrases of well-wishing.",
      imageUrl: "https://images.unsplash.com/photo-1516589178581-6cd7833ae3b2?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1767&q=80",
      tags: ["meditation", "compassion", "loving-kindness"],
    },
  ],
};

const ResourceItem = ({ item, type }: { item: any; type: string }) => {
  return (
    <Card className="therapy-card overflow-hidden hover:shadow-lg transition-all duration-300 h-full flex flex-col">
      <div className="relative h-48 overflow-hidden">
        <img
          src={item.imageUrl || item.thumbnailUrl}
          alt={item.title}
          className="w-full h-full object-cover transition-transform hover:scale-105 duration-500"
        />
        <div className="absolute top-3 right-3 bg-white dark:bg-therapy-dark/80 rounded-full px-3 py-1 text-xs font-medium">
          {type === "articles" ? item.readTime : type === "videos" ? item.duration : item.duration}
        </div>
      </div>
      <CardHeader className="pb-2">
        <div className="flex items-center mb-2">
          <span className="text-xs font-medium px-2 py-1 bg-therapy-softPurple/30 dark:bg-therapy-dark/30 rounded-full">
            {item.category}
          </span>
        </div>
        <CardTitle className="text-lg leading-tight">{item.title}</CardTitle>
        <CardDescription>
          {type === "articles"
            ? `By ${item.author}`
            : type === "videos"
            ? `By ${item.creator}`
            : "Interactive Exercise"}
        </CardDescription>
      </CardHeader>
      <CardContent className="flex-grow">
        <p className="text-sm text-gray-600 dark:text-gray-300">
          {item.summary || item.description}
        </p>
      </CardContent>
      <CardFooter className="border-t border-therapy-softPurple/10 pt-4 mt-auto">
        <Button variant="ghost" className="w-full justify-between hover:bg-therapy-softPurple/20">
          <span>View {type === "articles" ? "Article" : type === "videos" ? "Video" : "Exercise"}</span>
          <ArrowRight size={16} />
        </Button>
      </CardFooter>
    </Card>
  );
};

const Resources = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState("articles");

  const filterResources = (items: any[]) => {
    if (!searchTerm) return items;
    
    return items.filter(item => 
      item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.tags.some((tag: string) => tag.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (item.category && item.category.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (item.summary && item.summary.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (item.description && item.description.toLowerCase().includes(searchTerm.toLowerCase()))
    );
  };

  return (
    <Layout>
      <div className="min-h-[calc(100vh-64px)] bg-therapy-softPurple/10 dark:bg-therapy-dark/20 py-8 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-3xl md:text-4xl font-display font-bold mb-2">Wellness Resources</h1>
            <p className="text-gray-600 dark:text-gray-300 max-w-2xl mx-auto mb-6">
              Explore our curated collection of articles, videos, and exercises designed to support your mental health journey.
            </p>
            <div className="max-w-lg mx-auto">
              <Input
                type="text"
                placeholder="Search by topic, keyword, or category..."
                className="input-therapy"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          <Tabs defaultValue="articles" value={activeTab} onValueChange={setActiveTab}>
            <div className="flex justify-center mb-6">
              <TabsList className="grid grid-cols-3 w-full max-w-md gap-4">
                <TabsTrigger value="articles" className="flex items-center gap-1">
                  <Book size={16} />
                  <span>Articles</span>
                </TabsTrigger>
                <TabsTrigger value="videos" className="flex items-center gap-1">
                  <Video size={16} />
                  <span>Videos</span>
                </TabsTrigger>
                <TabsTrigger value="exercises" className="flex items-center gap-1">
                  <Heart size={16} />
                  <span>Exercises</span>
                </TabsTrigger>
              </TabsList>
            </div>

            <TabsContent value="articles">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
                {filterResources(resources.articles).map(article => (
                  <ResourceItem key={article.id} item={article} type="articles" />
                ))}
                {filterResources(resources.articles).length === 0 && (
                  <div className="col-span-full text-center py-10">
                    <p className="text-gray-500 dark:text-gray-400">No articles matching your search criteria.</p>
                  </div>
                )}
              </div>
            </TabsContent>

            <TabsContent value="videos">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
                {filterResources(resources.videos).map(video => (
                  <ResourceItem key={video.id} item={video} type="videos" />
                ))}
                {filterResources(resources.videos).length === 0 && (
                  <div className="col-span-full text-center py-10">
                    <p className="text-gray-500 dark:text-gray-400">No videos matching your search criteria.</p>
                  </div>
                )}
              </div>
            </TabsContent>

            <TabsContent value="exercises">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
                {filterResources(resources.exercises).map(exercise => (
                  <ResourceItem key={exercise.id} item={exercise} type="exercises" />
                ))}
                {filterResources(resources.exercises).length === 0 && (
                  <div className="col-span-full text-center py-10">
                    <p className="text-gray-500 dark:text-gray-400">No exercises matching your search criteria.</p>
                  </div>
                )}
              </div>
            </TabsContent>
          </Tabs>

          <div className="mt-12 text-center">
            <Card className="therapy-card max-w-3xl mx-auto">
              <CardHeader>
                <CardTitle className="text-xl">Need Personalized Support?</CardTitle>
                <CardDescription>
                  Our AI therapy assistant can provide tailored guidance for your specific needs
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 dark:text-gray-300 mb-4">
                  While these resources are helpful, sometimes you might need more personalized support. 
                  Our AI assistant can help you navigate your challenges and suggest specific resources.
                </p>
                <Button asChild className="btn-primary">
                  <a href="/chat">Chat with AI Assistant</a>
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Resources;
