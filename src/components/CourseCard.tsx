import { Link } from "@tanstack/react-router";
import { LevelBadge } from "./LevelBadge";
import { BookOpen } from "lucide-react";

export type CourseCardData = {
  id: string;
  title: string;
  slug: string;
  description: string | null;
  level: string;
  category: string;
  hero_color: string | null;
  lessons_count: number;
};

export function CourseCard({ course }: { course: CourseCardData }) {
  return (
    <Link to="/courses/$slug" params={{ slug: course.slug }} className="card-pop flex flex-col gap-3">
      <div
        className="flex h-32 items-end justify-between overflow-hidden rounded-2xl p-4"
        style={{ background: `linear-gradient(135deg, ${course.hero_color ?? "#58CC02"} 0%, color-mix(in oklab, ${course.hero_color ?? "#58CC02"} 70%, white) 100%)` }}
      >
        <span className="text-3xl">{categoryEmoji(course.category)}</span>
        <LevelBadge level={course.level} />
      </div>
      <div>
        <h3 className="text-lg font-extrabold leading-tight">{course.title}</h3>
        <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">{course.description}</p>
      </div>
      <div className="mt-auto flex items-center justify-between text-xs font-bold text-muted-foreground">
        <span className="capitalize">{course.category}</span>
        <span className="inline-flex items-center gap-1"><BookOpen className="h-3.5 w-3.5" />{course.lessons_count} lessons</span>
      </div>
    </Link>
  );
}

function categoryEmoji(cat: string) {
  const map: Record<string, string> = {
    grammar: "📝", vocabulary: "🧠", pronunciation: "🎤", listening: "🎧",
    speaking: "💬", reading: "📖", writing: "✍️", business: "💼", news: "📰", ielts: "🎓",
  };
  return map[cat] ?? "✨";
}
