"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, CheckCircle, ArrowRight } from "lucide-react";
import { toast } from "sonner";

interface Course { id: string; name: string; monthlyFee: number; maxCreationsPerMonth: number }
interface Contract { courseId: string; course: Course }

export default function ContractChangePage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [contract, setContract] = useState<Contract | null>(null);
  const [courses, setCourses] = useState<Course[]>([]);
  const [selected, setSelected] = useState<string>("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetch(`/api/contracts/${id}`)
      .then((r) => r.json())
      .then((d) => { setContract(d); setSelected(d.courseId); });
    fetch("/api/courses")
      .then((r) => r.json())
      .then((d: Course[]) => setCourses(d.filter((c) => c.name !== "スポット")));
  }, [id]);

  async function handleChange() {
    if (!selected || selected === contract?.courseId) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/contracts/${id}/change`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ newCourseId: selected }),
      });
      if (!res.ok) { toast.error("変更に失敗しました"); return; }
      toast.success("コースを変更しました");
      router.push("/mypage/contracts");
    } finally { setLoading(false); }
  }

  const selectedCourse = courses.find((c) => c.id === selected);
  const currentCourse = contract?.course;
  const diff = selectedCourse && currentCourse
    ? selectedCourse.monthlyFee - currentCourse.monthlyFee
    : 0;

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <Button variant="ghost" size="sm" asChild>
          <Link href={`/mypage/contracts/${id}`}><ArrowLeft className="w-4 h-4 mr-1" />戻る</Link>
        </Button>
        <h1 className="text-2xl font-bold mt-2">コース変更</h1>
        <p className="text-gray-500 text-sm mt-0.5">変更後のコースを選択してください</p>
      </div>

      {currentCourse && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-sm">
          <span className="text-blue-600 font-medium">現在のコース：</span>
          <span className="ml-2 font-semibold">{currentCourse.name}</span>
          <span className="ml-2 text-gray-500">（月額 ¥{currentCourse.monthlyFee.toLocaleString()}）</span>
        </div>
      )}

      <div className="grid gap-3">
        {courses.map((course) => (
          <div
            key={course.id}
            className={`border-2 rounded-lg p-4 cursor-pointer transition-all ${
              selected === course.id
                ? "border-blue-500 bg-blue-50"
                : "border-gray-200 hover:border-gray-300"
            } ${course.id === contract?.courseId ? "opacity-50" : ""}`}
            onClick={() => course.id !== contract?.courseId && setSelected(course.id)}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                {selected === course.id && <CheckCircle className="w-5 h-5 text-blue-500" />}
                <div>
                  <div className="font-semibold">{course.name}</div>
                  <div className="text-sm text-gray-500">月{course.maxCreationsPerMonth}本制作 | 月額 ¥{course.monthlyFee.toLocaleString()}</div>
                </div>
              </div>
              {course.id === contract?.courseId && (
                <Badge className="bg-gray-100 text-gray-600">現在</Badge>
              )}
            </div>
          </div>
        ))}
      </div>

      {selectedCourse && selected !== contract?.courseId && (
        <Card className="bg-amber-50 border-amber-200">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-amber-800">変更内容の確認</CardTitle>
          </CardHeader>
          <CardContent className="text-sm space-y-2">
            <div className="flex items-center gap-2">
              <span className="font-medium">{currentCourse?.name}</span>
              <ArrowRight className="w-4 h-4 text-amber-600" />
              <span className="font-medium">{selectedCourse.name}</span>
            </div>
            {diff > 0 && (
              <p className="text-amber-700">今月分の差額 <strong>¥{diff.toLocaleString()}</strong> が請求されます</p>
            )}
            {diff < 0 && (
              <p className="text-amber-700">月額が <strong>¥{Math.abs(diff).toLocaleString()}</strong> 安くなります（翌月から適用）</p>
            )}
          </CardContent>
        </Card>
      )}

      <Button
        onClick={handleChange}
        disabled={loading || !selected || selected === contract?.courseId}
        className="w-full bg-blue-600 hover:bg-blue-500"
      >
        {loading ? "処理中..." : "コースを変更する"}
      </Button>
    </div>
  );
}
