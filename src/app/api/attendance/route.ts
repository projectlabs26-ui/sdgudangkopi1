import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371000;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

export async function POST(request: NextRequest) {
  const supabase = createClient();

  // Check auth
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const { selfieDataUrl, latitude, longitude, type } = body;

  // type: "clock_in" or "clock_out"
  if (!type || !["clock_in", "clock_out"].includes(type)) {
    return NextResponse.json({ error: "Invalid type" }, { status: 400 });
  }

  const today = new Date().toISOString().split("T")[0];
  const now = new Date().toISOString();

  // Get school config
  const { data: config } = await supabase
    .from("school_profile")
    .select("latitude, longitude, radius_meters, clock_in_start, clock_in_end, clock_out_start, clock_out_end, late_tolerance_minutes")
    .single();

  // Validate geolocation against school config
  if (config && latitude && longitude) {
    const dist = calculateDistance(
      latitude, longitude,
      config.latitude || -6.2088, config.longitude || 106.8456
    );
    const maxRadius = config.radius_meters || 100;
    if (dist > maxRadius) {
      return NextResponse.json({
        error: `Anda berada di luar area sekolah (${Math.round(dist)}m dari ${maxRadius}m)`
      }, { status: 400 });
    }
  }

  // Upload selfie to Supabase Storage
  let selfieUrl = "";
  if (selfieDataUrl) {
    const base64Data = selfieDataUrl.split(",")[1];
    const buffer = Buffer.from(base64Data, "base64");
    const fileName = `${user.id}/${type}_${today}.jpg`;

    const { data: uploadData, error: uploadError } = await supabase.storage
      .from("selfies")
      .upload(fileName, buffer, {
        contentType: "image/jpeg",
        upsert: true,
      });

    if (uploadError) {
      console.error("Upload error:", uploadError);
    } else {
      const { data: urlData } = supabase.storage
        .from("selfies")
        .getPublicUrl(fileName);
      selfieUrl = urlData.publicUrl;
    }
  }

  // Determine status
  const currentTime = new Date();
  let status = "hadir";
  let clockStatus = "tepat_waktu";

  if (type === "clock_in" && config) {
    const [startH, startM] = (config.clock_in_start || "07:00").split(":").map(Number);
    const [endH, endM] = (config.clock_in_end || "08:30").split(":").map(Number);

    const clockTime = currentTime.getHours() * 60 + currentTime.getMinutes();
    const startTime = startH * 60 + startM;
    const endTime = endH * 60 + endM;
    const tolerance = config.late_tolerance_minutes || 15;

    if (clockTime > endTime + tolerance) {
      status = "alpa";
    } else if (clockTime > endTime) {
      status = "terlambat";
      clockStatus = "terlambat";
    } else if (clockTime > startTime + tolerance) {
      clockStatus = "terlambat";
    }
  }

  // Upsert attendance
  const attendanceData: Record<string, unknown> = {
    user_id: user.id,
    date: today,
    status,
  };

  if (type === "clock_in") {
    attendanceData.clock_in = now;
    attendanceData.clock_in_lat = latitude;
    attendanceData.clock_in_long = longitude;
    attendanceData.clock_in_selfie_url = selfieUrl;
    attendanceData.clock_in_status = clockStatus;
  } else {
    attendanceData.clock_out = now;
    attendanceData.clock_out_lat = latitude;
    attendanceData.clock_out_long = longitude;
    attendanceData.clock_out_selfie_url = selfieUrl;
  }

  const { data: attendance, error: insertError } = await supabase
    .from("attendances")
    .upsert(attendanceData, { onConflict: "user_id,date" })
    .select()
    .single();

  if (insertError) {
    console.error("Insert error:", insertError);
    return NextResponse.json({ error: insertError.message }, { status: 500 });
  }

  return NextResponse.json({ success: true, attendance });
}
