import { boolean } from "drizzle-orm/gel-core";
import { integer, pgTable, varchar,json } from "drizzle-orm/pg-core";


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









