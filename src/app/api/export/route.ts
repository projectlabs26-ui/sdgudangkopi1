import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import * as XLSX from "xlsx";

export async function GET(request: NextRequest) {
  const supabase = createClient();
  const { searchParams } = new URL(request.url);
  const type = searchParams.get("type") || "attendance";
  const month = searchParams.get("month") || new Date().toISOString().slice(0, 7);

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const workbook = XLSX.utils.book_new();

  if (type === "attendance") {
    const startDate = `${month}-01`;
    const endDate = `${month}-31`;

    const { data: records } = await supabase
      .from("attendances")
      .select("*, users(full_name, email)")
      .gte("date", startDate)
      .lte("date", endDate)
      .order("date");

    const rows = (records || []).map((r: Record<string, unknown>) => ({
      "Tanggal": r.date,
      "Nama Guru": (r.users as Record<string, string>)?.full_name || "",
      "Email": (r.users as Record<string, string>)?.email || "",
      "Jam Masuk": r.clock_in ? new Date(r.clock_in as string).toLocaleTimeString("id-ID") : "",
      "Jam Keluar": r.clock_out ? new Date(r.clock_out as string).toLocaleTimeString("id-ID") : "",
      "Status": r.status,
      "Keterangan": r.note || "",
    }));

    const sheet = XLSX.utils.json_to_sheet(rows);
    XLSX.utils.book_append_sheet(workbook, sheet, "Absensi");
  } else if (type === "teachers") {
    const { data: teachers } = await supabase
      .from("teachers")
      .select("*, users(full_name, email, phone)");

    const rows = (teachers || []).map((t: Record<string, unknown>) => ({
      "Nama": (t.users as Record<string, string>)?.full_name || "",
      "Email": (t.users as Record<string, string>)?.email || "",
      "Telepon": (t.users as Record<string, string>)?.phone || "",
      "Mata Pelajaran": t.subject || "",
      "Status": t.is_active ? "Aktif" : "Nonaktif",
    }));

    const sheet = XLSX.utils.json_to_sheet(rows);
    XLSX.utils.book_append_sheet(workbook, sheet, "Guru");
  } else if (type === "students") {
    const { data: students } = await supabase
      .from("students")
      .select("*, classes(name, grades(level))");

    const rows = (students || []).map((s: Record<string, unknown>) => ({
      "Nama": s.full_name || "",
      "NIS": s.nis || "",
      "NISN": s.nisn || "",
      "Kelas": `${(s.classes as Record<string, unknown>)?.name || ""}`,
      "Orang Tua": s.parent_name || "",
      "Telepon Orang Tua": s.parent_phone || "",
    }));

    const sheet = XLSX.utils.json_to_sheet(rows);
    XLSX.utils.book_append_sheet(workbook, sheet, "Siswa");
  }

  const buffer = XLSX.write(workbook, { type: "buffer", bookType: "xlsx" });

  return new NextResponse(buffer, {
    headers: {
      "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "Content-Disposition": `attachment; filename="${type}_${month}.xlsx"`,
    },
  });
}
