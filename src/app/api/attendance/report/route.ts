import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(request: NextRequest) {
  const supabase = createClient();

  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const formData = await request.formData();
  const status = formData.get("status") as string;
  const date = formData.get("date") as string;
  const note = formData.get("note") as string;
  const proofFile = formData.get("proof") as File | null;

  if (!status || !["sakit", "izin"].includes(status)) {
    return NextResponse.json({ error: "Status tidak valid. Gunakan: sakit atau izin" }, { status: 400 });
  }

  if (!date) {
    return NextResponse.json({ error: "Tanggal wajib diisi" }, { status: 400 });
  }

  // Upload proof image jika ada
  let proofUrl = "";
  if (proofFile && proofFile.size > 0) {
    // Validasi ukuran (max 5MB)
    if (proofFile.size > 5 * 1024 * 1024) {
      return NextResponse.json({ error: "Ukuran file maksimal 5MB" }, { status: 400 });
    }

    // Validasi tipe file
    const allowedTypes = ["image/jpeg", "image/png", "image/jpg", "image/webp"];
    if (!allowedTypes.includes(proofFile.type)) {
      return NextResponse.json({ error: "Format file harus JPG, PNG, atau WebP" }, { status: 400 });
    }

    const buffer = Buffer.from(await proofFile.arrayBuffer());
    const ext = proofFile.name.split(".").pop() || "jpg";
    const fileName = `${user.id}/proof_${status}_${date}.${ext}`;

    const { error: uploadError } = await supabase.storage
      .from("selfies")
      .upload(fileName, buffer, {
        contentType: proofFile.type,
        upsert: true,
      });

    if (uploadError) {
      console.error("Upload bukti error:", uploadError);
      return NextResponse.json({ error: "Gagal upload bukti: " + uploadError.message }, { status: 500 });
    }

    const { data: urlData } = supabase.storage.from("selfies").getPublicUrl(fileName);
    proofUrl = urlData.publicUrl;
  }

  // Upsert attendance
  const { data: attendance, error: insertError } = await supabase
    .from("attendances")
    .upsert(
      {
        user_id: user.id,
        date,
        status,
        note: note || null,
        proof_image_url: proofUrl || null,
      },
      { onConflict: "user_id,date" }
    )
    .select()
    .single();

  if (insertError) {
    console.error("Insert error:", insertError);
    return NextResponse.json({ error: insertError.message }, { status: 500 });
  }

  return NextResponse.json({ success: true, attendance });
}