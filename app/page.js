"use client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { UserContext } from "@/contexts/UserContext";
import { Badge } from "@/components/ui/badge";
import { UserButton, useUser } from "@clerk/nextjs";
import { ArrowRight, BookOpen, Brain, Clock, PlayCircle, Sparkles, Star, Users } from "lucide-react";
import Link from "next/link";
import { useContext } from "react";
import AppHeader from "./workspace/_components/AppHeader";
import { ThemeProvider } from "@/contexts/ThemeContext";
import Image from "next/image";

export default function Home() {
  const {userDetails} = useContext(UserContext)
  console.log(userDetails);
  const { user } = useUser()

  const features = [
    {
      icon: <Brain className="h-8 w-8 text-blue-600 dark:text-blue-400" />,
      title: "AI-Powered Learning",
      description: "Get personalized course recommendations and AI-generated content tailored to your learning style."
    },
    {
      icon: <BookOpen className="h-8 w-8 text-green-600 dark:text-green-400" />,
      title: "Interactive Courses",
      description: "Engage with hands-on projects, quizzes, and real-world applications across various topics."
    },
    {
      icon: <Users className="h-8 w-8 text-purple-600 dark:text-purple-400" />,
      title: "Expert Instructors",
      description: "Learn from industry professionals and certified educators with years of experience."
    },
    {
      icon: <Clock className="h-8 w-8 text-orange-600 dark:text-orange-400" />,
      title: "Learn at Your Pace",
      description: "Flexible scheduling with lifetime access to course materials and progress tracking."
    }
  ]

  const stats = [
    { number: "10,000+", label: "Active Students" },
    { number: "500+", label: "Courses Available" },
    { number: "50+", label: "Expert Instructors" },
    { number: "95%", label: "Completion Rate" }
  ]

  const popularCourses = [
    {
      title: "Introduction to AI & Machine Learning",
      description: "Master the fundamentals of artificial intelligence and machine learning with hands-on projects.",
      image: "machine-learning.jpeg",
      chapters: 8,
      duration: "6 hours",
      level: "Beginner",
      rating: 4.9
    },
    {
      title: "Full Stack Web Development",
      description: "Build modern web applications using React, Node.js, and database technologies.",
      image: "fullstack_sioshn.png",
      chapters: 12,
      duration: "15 hours",
      level: "Intermediate",
      rating: 4.8
    },
    {
      title: "Data Science & Analytics",
      description: "Learn data analysis, visualization, and statistical modeling with Python and R.",
      image: "What-is-data-science-2.jpg",
      chapters: 10,
      duration: "12 hours",
      level: "Advanced",
      rating: 4.9
    }
  ]
  
  return (
    <>
  
      <div className="flex items-center justify-between">
         <Image
                  className="ml-[5px] mt-[-20px] mb-[-20px]"
                  src="/logo.svg"
                  alt="logo"
                  width={100}
                  height={100}
                />
          <AppHeader hideSidebar={true}/>
      </div>
         <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-purple-900">
      {/* Hero Section */}
      <section className="relative overflow-hidden py-20 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <Badge className="mb-4 bg-blue-100 text-blue-800 hover:bg-blue-200 dark:bg-blue-900/50 dark:text-blue-300 dark:hover:bg-blue-900/70">
              <Sparkles className="w-4 h-4 mr-1" />
              AI-Powered Learning Platform
            </Badge>
            <h1 className="text-5xl md:text-6xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-blue-800 dark:from-blue-400 dark:via-purple-400 dark:to-blue-300 bg-clip-text text-transparent mb-6">
              Master New Skills with
              <br />
              <span className="text-blue-600 dark:text-blue-400">PromptEdu</span>
            </h1>
            <p className="text-xl text-gray-600 dark:text-gray-300 mb-8 max-w-3xl mx-auto leading-relaxed">
              Unlock your potential with our AI-powered learning platform. Get personalized courses, 
              track your progress, and learn from industry experts at your own pace.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              {user ? (
                <Link href="/workspace">
                  <Button size="lg" className="bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 text-white px-8 py-3">
                    <PlayCircle className="mr-2 h-5 w-5" />
                    Continue Learning
                  </Button>
                </Link>
              ) : (
                <Link href="/sign-up">
                  <Button size="lg" className="bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 text-white px-8 py-3">
                    Start Learning Free
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </Link>
              )}
              <Link href="/workspace/explore">
                <Button variant="outline" size="lg" className="px-8 py-3 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700">
                  Explore Courses
                </Button>
              </Link>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-20">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="text-3xl md:text-4xl font-bold text-blue-600 dark:text-blue-400 mb-2">
                  {stat.number}
                </div>
                <div className="text-gray-600 dark:text-gray-300 font-medium">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4 bg-white dark:bg-gray-900">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
              Why Choose PromptEdu?
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
              Experience the future of online learning with our innovative platform designed for modern learners.
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <Card key={index} className="text-center border-none shadow-lg hover:shadow-xl dark:bg-gray-800 dark:shadow-gray-900/50 dark:hover:shadow-gray-900/70 transition-shadow">
                <CardHeader>
                  <div className="mx-auto mb-4 p-3 bg-gray-50 dark:bg-gray-700 rounded-full w-fit">
                    {feature.icon}
                  </div>
                  <CardTitle className="text-xl font-semibold text-gray-900 dark:text-white">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-gray-600 dark:text-gray-300">
                    {feature.description}
                  </CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Popular Courses Section */}
      <section className="py-20 px-4 bg-gray-50 dark:bg-gray-800">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
              Popular Courses
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300">
              Start your learning journey with our most popular courses
            </p>
          </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {popularCourses.map((course, index) => (
<Card key={index} className="overflow-hidden hover:shadow-xl dark:bg-gray-700 dark:shadow-gray-900/50 dark:hover:shadow-gray-900/70 transition-shadow">
  <div className="h-48 relative overflow-hidden">
    <Image
      src={`/${course.image}`}
      alt={course.title}
      fill
      className="object-cover"
    />
    <div className="absolute inset-0 bg-black/20 dark:bg-black/40"></div>
    <div className="absolute bottom-4 left-4 text-white">
      <Badge className="bg-white/20 text-white mb-2 dark:bg-white/30">{course.level}</Badge>
      <h3 className="font-semibold text-lg line-clamp-2">{course.title}</h3>
    </div>
  </div>
  <CardContent className="p-6">
                  <p className="text-gray-600 dark:text-gray-300 mb-4 line-clamp-2">
                    {course.description}
                  </p>
                  <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400 mb-4">
                    <span className="flex items-center">
                      <BookOpen className="w-4 h-4 mr-1" />
                      {course.chapters} chapters
                    </span>
                    <span className="flex items-center">
                      <Clock className="w-4 h-4 mr-1" />
                      {course.duration}
                    </span>
                    <span className="flex items-center">
                      <Star className="w-4 h-4 mr-1 fill-yellow-400 text-yellow-400 dark:fill-yellow-300 dark:text-yellow-300" />
                      {course.rating}
                    </span>
                  </div>
                  <Button className="w-full" variant="outline">
                    Start Learning
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
          <div className="text-center mt-12">
            <Link href="/workspace/explore">
              <Button size="lg" variant="outline" className="border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700">
                View All Courses
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-700 dark:to-purple-800">
        <div className="max-w-4xl mx-auto text-center text-white">
          <h2 className="text-4xl font-bold mb-4">
            Ready to Start Your Learning Journey?
          </h2>
          <p className="text-xl mb-8 opacity-90">
            Join thousands of learners who are already advancing their careers with PromptEdu
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            {!user && (
              <Link href="/sign-up">
                <Button size="lg" className="bg-white text-blue-600 hover:bg-gray-100 dark:bg-gray-100 dark:text-blue-700 dark:hover:bg-gray-200 px-8 py-3">
                  Get Started Free
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
            )}
            <Link href="/workspace/explore">
              <Button size="lg" variant="outline" className="border-white text-black dark:border-gray-200 dark:hover:bg-gray-200 dark:hover:text-blue-700 px-8 py-3">
                Browse Courses
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 dark:bg-black text-white py-12 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <h3 className="text-2xl font-bold mb-4">PromptEdu</h3>
              <p className="text-gray-400 dark:text-gray-500">
                Empowering learners worldwide with AI-powered education and personalized learning experiences.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Platform</h4>
              <ul className="space-y-2 text-gray-400 dark:text-gray-500">
                <li><Link href="/workspace" className="hover:text-white dark:hover:text-gray-200">Dashboard</Link></li>
                <li><Link href="/workspace/explore" className="hover:text-white dark:hover:text-gray-200">Courses</Link></li>
                <li><Link href="/workspace/create-course" className="hover:text-white dark:hover:text-gray-200">Create Course</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Support</h4>
              <ul className="space-y-2 text-gray-400 dark:text-gray-500">
                <li><Link href="#" className="hover:text-white dark:hover:text-gray-200">Help Center</Link></li>
                <li><Link href="#" className="hover:text-white dark:hover:text-gray-200">Contact Us</Link></li>
                <li><Link href="#" className="hover:text-white dark:hover:text-gray-200">Community</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Company</h4>
              <ul className="space-y-2 text-gray-400 dark:text-gray-500">
                <li><Link href="#" className="hover:text-white dark:hover:text-gray-200">About</Link></li>
                <li><Link href="#" className="hover:text-white dark:hover:text-gray-200">Privacy</Link></li>
                <li><Link href="#" className="hover:text-white dark:hover:text-gray-200">Terms</Link></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 dark:border-gray-700 mt-8 pt-8 text-center text-gray-400 dark:text-gray-500">
            <p>&copy; 2025 PromptEdu. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
   
    </>
  );
}