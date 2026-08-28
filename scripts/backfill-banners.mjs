/**
 * One-off backfill: re-point course banner images at Tavily search results.
 *
 * Courses created before the Pollinations generator was removed still hold
 * `image.pollinations.ai` URLs, which no longer render (that host is not in the
 * next/image allowlist any more). This re-runs the Tavily lookup for them.
 *
 * Usage, from the project root:
 *   node scripts/backfill-banners.mjs            # dry run - shows what would change
 *   node scripts/backfill-banners.mjs --apply    # actually writes to the database
 *   node scripts/backfill-banners.mjs --all      # include courses that already have a good banner
 *
 * Safe to re-run: it only touches rows it can find a replacement image for.
 */
import "dotenv/config";
import { neon } from "@neondatabase/serverless";
import { findBannerImage } from "../lib/bannerImage.js";

const APPLY = process.argv.includes("--apply");
const ALL = process.argv.includes("--all");

// Tavily is rate limited, so the lookups run one at a time with a short gap.
const DELAY_MS = 350;
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

function isStale(url) {
  if (!url) return true;
  const trimmed = url.trim();
  return trimmed === "" || trimmed.includes("image.pollinations.ai");
}

async function main() {
  if (!process.env.DATABASE_URL) throw new Error("DATABASE_URL is not set");
  if (!process.env.TAVILY_API_KEY) throw new Error("TAVILY_API_KEY is not set");

  const sql = neon(process.env.DATABASE_URL);

  const courses = await sql`
    SELECT id, cid, course_name, category, "courseJson", "bannerImageUrl"
    FROM courses
    ORDER BY id
  `;

  const targets = ALL ? courses : courses.filter((c) => isStale(c.bannerImageUrl));

  console.log(`\n${courses.length} course(s) in the database.`);
  console.log(
    `${targets.length} to process${ALL ? " (--all)" : " (missing or Pollinations banner)"}.`
  );
  console.log(APPLY ? "Mode: APPLY - changes will be written.\n" : "Mode: DRY RUN - nothing will be written. Pass --apply to write.\n");

  if (targets.length === 0) {
    console.log("Nothing to do.");
    return;
  }

  let updated = 0;
  let notFound = 0;

  for (const course of targets) {
    const courseName = course.course_name || course.courseJson?.course?.course_name;
    const category = course.category || course.courseJson?.course?.category;
    const label = (courseName || `#${course.id}`).slice(0, 40).padEnd(42);

    if (!courseName) {
      console.log(`${label} skipped - no course name`);
      notFound += 1;
      continue;
    }

    const imageUrl = await findBannerImage({ courseName, category });

    if (!imageUrl) {
      console.log(`${label} no image found`);
      notFound += 1;
    } else {
      if (APPLY) {
        await sql`
          UPDATE courses SET "bannerImageUrl" = ${imageUrl} WHERE id = ${course.id}
        `;
      }
      console.log(`${label} ${APPLY ? "updated ->" : "would use ->"} ${imageUrl.slice(0, 80)}`);
      updated += 1;
    }

    await sleep(DELAY_MS);
  }

  console.log(
    `\nDone. ${updated} ${APPLY ? "updated" : "would be updated"}, ${notFound} without a usable image.`
  );
  if (!APPLY && updated > 0) {
    console.log("Re-run with --apply to write these changes.");
  }
}

main().catch((error) => {
  console.error("\nBackfill failed:", error);
  process.exit(1);
});
