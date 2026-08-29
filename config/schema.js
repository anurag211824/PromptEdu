import { boolean, integer, pgTable, varchar, json, timestamp } from "drizzle-orm/pg-core";


export const usersTable = pgTable("users", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  name: varchar({ length: 255 }).notNull(),
  email: varchar({ length: 255 }).notNull().unique(),
  subscription: varchar(),
});

export const coursesTable = pgTable("courses", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
   cid: varchar().notNull().unique(),
  course_name: varchar(),
  course_description: varchar(),
  chapters_number: integer().notNull(),
  include_videos: boolean().default(false),
  difficulty: varchar().default("semester"),
  category: varchar(),
  courseJson:json(),
  bannerImageUrl:varchar().default(''),
  courseContent:json().default({}),
  userEmail: varchar("userEmail").references(() => usersTable.email).notNull(),
    isSemesterCourse: boolean().default(false),
});


export const enrollCourseTable = pgTable("enrollCourse",{
  id:integer().primaryKey().generatedAlwaysAsIdentity(),
  courseId: integer("courseId").references(() => coursesTable.id),
  userEmail: varchar("userEmail").references(() => usersTable.email),
  completedChapters:json(),
})

// Generated quizzes, cached per course/chapter/topic so the same topic is not
// re-generated for every learner who opens it. Not user-scoped: the questions
// are about the material, so everyone studying that topic gets the same quiz.
export const quizTable = pgTable("quiz", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  courseCid: varchar("courseCid").notNull(),
  chapterIndex: integer("chapterIndex").notNull(),
  topicIndex: integer("topicIndex").notNull(),
  topicName: varchar("topicName"),
  chapterName: varchar("chapterName"),
  questions: json().notNull(),
  createdAt: timestamp("createdAt").defaultNow(),
});

// Videos a learner has saved to come back to, pinned to the exact course,
// chapter and topic they were studying when they saved it.
export const savedVideoTable = pgTable("savedVideo", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  userEmail: varchar("userEmail").references(() => usersTable.email).notNull(),
  courseCid: varchar("courseCid").notNull(),
  chapterIndex: integer("chapterIndex").notNull(),
  topicIndex: integer("topicIndex").notNull(),
  topicName: varchar("topicName"),
  videoId: varchar("videoId").notNull(),
  videoTitle: varchar("videoTitle"),
  channelTitle: varchar("channelTitle"),
  // Playback position in seconds, so "resume where I stopped" works.
  resumeSeconds: integer("resumeSeconds").default(0),
  note: varchar("note"),
  watched: boolean().default(false),
  createdAt: timestamp("createdAt").defaultNow(),
});









