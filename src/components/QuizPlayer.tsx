import { useState } from "react";
import { CheckCircle2, XCircle, Trophy } from "lucide-react";

type Quiz = {
  id: string;
  question: string;
  options: string[];
  answer: string;
  explanation: string | null;
};

export function QuizPlayer({ quizzes, onComplete }: { quizzes: Quiz[]; onComplete?: (score: number) => void }) {
  const [idx, setIdx] = useState(0);
  const [picked, setPicked] = useState<string | null>(null);
  const [score, setScore] = useState(0);
  const [done, setDone] = useState(false);

  if (!quizzes.length) {
    return <p className="text-sm text-muted-foreground">No quiz for this lesson yet.</p>;
  }

  if (done) {
    const pct = Math.round((score / quizzes.length) * 100);
    return (
      <div className="rounded-3xl border-2 border-border bg-card p-8 text-center">
        <Trophy className="mx-auto h-12 w-12 text-warning" />
        <h3 className="mt-4 text-2xl font-extrabold">Quiz complete!</h3>
        <p className="mt-2 text-muted-foreground">You scored {score} / {quizzes.length} ({pct}%)</p>
        <button
          onClick={() => { setIdx(0); setPicked(null); setScore(0); setDone(false); }}
          className="btn-pop mt-6"
        >
          Try again
        </button>
      </div>
    );
  }

  const q = quizzes[idx];
  const correct = picked === q.answer;

  const next = () => {
    if (picked && correct) setScore((s) => s + 1);
    if (idx + 1 >= quizzes.length) {
      const final = score + (correct ? 1 : 0);
      setDone(true);
      onComplete?.(final);
    } else {
      setIdx(idx + 1);
      setPicked(null);
    }
  };

  return (
    <div className="rounded-3xl border-2 border-border bg-card p-6">
      <div className="mb-4 flex items-center justify-between text-xs font-extrabold uppercase text-muted-foreground">
        <span>Question {idx + 1} / {quizzes.length}</span>
        <span>Score {score}</span>
      </div>
      <h3 className="text-xl font-extrabold">{q.question}</h3>
      <div className="mt-5 grid gap-3">
        {q.options.map((opt) => {
          const isPicked = picked === opt;
          const isAnswer = opt === q.answer;
          return (
            <button
              key={opt}
              disabled={!!picked}
              onClick={() => setPicked(opt)}
              className={`flex items-center justify-between rounded-2xl border-2 px-4 py-3 text-left font-bold transition ${
                picked
                  ? isAnswer
                    ? "border-success bg-success/10"
                    : isPicked
                    ? "border-destructive bg-destructive/10"
                    : "border-border opacity-60"
                  : "border-border hover:border-primary"
              }`}
            >
              <span>{opt}</span>
              {picked && isAnswer && <CheckCircle2 className="h-5 w-5 text-success" />}
              {picked && isPicked && !isAnswer && <XCircle className="h-5 w-5 text-destructive" />}
            </button>
          );
        })}
      </div>
      {picked && q.explanation && (
        <p className="mt-4 rounded-2xl bg-muted p-3 text-sm">{q.explanation}</p>
      )}
      {picked && (
        <button onClick={next} className="btn-pop mt-5 w-full">
          {idx + 1 >= quizzes.length ? "Finish" : "Next"}
        </button>
      )}
    </div>
  );
}
