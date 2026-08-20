"use client";

import { useState, useEffect, useRef } from "react";
import { createClient } from "@/lib/supabase/client";
import {
  Newspaper,
  Plus,
  Edit2,
  Trash2,
  X,
  Loader2,
  Eye,
  EyeOff,
  Image as ImageIcon,
} from "lucide-react";
import LogoutButton from "@/components/ui/LogoutButton";
import Image from "next/image";

interface News {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  content: string | null;
  image_url: string | null;
  category: string;
  is_published: boolean;
  published_at: string;
}

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export default function AdminBerita() {
  const supabase = createClient();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [news, setNews] = useState<News[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingNews, setEditingNews] = useState<News | null>(null);
  const [saving, setSaving] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);

  const [formData, setFormData] = useState({
    title: "",
    slug: "",
    excerpt: "",
    content: "",
    category: "pengumuman",
    is_published: true,
  });

  useEffect(() => {
    loadNews();
  }, []);

  async function loadNews() {
    const { data } = await supabase
      .from("news")
      .select("*")
      .order("published_at", { ascending: false });
    setNews((data || []) as News[]);
    setLoading(false);
  }

  const openAddModal = () => {
    setEditingNews(null);
    setFormData({ title: "", slug: "", excerpt: "", content: "", category: "pengumuman", is_published: true });
    setImagePreview(null);
    setImageFile(null);
    setShowModal(true);
  };

  const openEditModal = (item: News) => {
    setEditingNews(item);
    setFormData({
      title: item.title,
      slug: item.slug,
      excerpt: item.excerpt || "",
      content: item.content || "",
      category: item.category,
      is_published: item.is_published,
    });
    setImagePreview(item.image_url || null);
    setImageFile(null);
    setShowModal(true);
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      alert("Ukuran gambar maksimal 5MB");
      return;
    }
    setImageFile(file);
    const reader = new FileReader();
    reader.onload = (ev) => setImagePreview(ev.target?.result as string);
    reader.readAsDataURL(file);
  };

  const uploadImage = async (): Promise<string | null> => {
    if (!imageFile) return null;
    const fileName = `news/${Date.now()}_${imageFile.name}`;
    const { error } = await supabase.storage.from("news-images").upload(fileName, imageFile);
    if (error) {
      console.error("Upload error:", error);
      return null;
    }
    const { data } = supabase.storage.from("news-images").getPublicUrl(fileName);
    return data.publicUrl;
  };

  const handleSave = async () => {
    setSaving(true);
    let imageUrl = editingNews?.image_url || null;
    if (imageFile) {
      imageUrl = await uploadImage();
    }
    const data = {
      title: formData.title,
      slug: formData.slug || slugify(formData.title),
      excerpt: formData.excerpt || null,
      content: formData.content || null,
      image_url: imageUrl,
      category: formData.category,
      is_published: formData.is_published,
    };
    if (editingNews) {
      await supabase.from("news").update(data).eq("id", editingNews.id);
    } else {
      await supabase.from("news").insert(data);
    }
    setSaving(false);
    setShowModal(false);
    loadNews();
  };

  const handleDelete = async (item: News) => {
    if (!confirm(`Hapus berita "${item.title}"?`)) return;
    await supabase.from("news").delete().eq("id", item.id);
    loadNews();
  };

  const togglePublish = async (item: News) => {
    await supabase.from("news").update({ is_published: !item.is_published }).eq("id", item.id);
    loadNews();
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4 text-center">
          <div className="flex items-center justify-center space-x-2 mb-3">
            <Newspaper className="w-6 h-6 text-primary-500" />
            <h1 className="font-poppins font-bold text-primary-600 text-lg">Kelola Berita</h1>
          </div>
          <p className="text-sm text-gray-500 mb-4">{news.length} artikel</p>
          <div className="flex items-center justify-center space-x-3">
            <a href="/admin/dashboard" className="text-sm text-primary-500 hover:text-primary-600">← Dashboard</a>
            <LogoutButton />
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-6">
        <div className="flex justify-center mb-6">
          <button onClick={openAddModal} className="flex items-center px-4 py-2.5 bg-primary-500 text-white rounded-lg hover:bg-primary-600">
            <Plus className="w-5 h-5 mr-2" />
            Tambah Berita
          </button>
        </div>

        {loading ? (
          <div className="text-center py-12"><Loader2 className="w-8 h-8 animate-spin text-primary-500 mx-auto" /></div>
        ) : news.length === 0 ? (
          <div className="bg-white rounded-xl p-12 text-center">
            <Newspaper className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">Belum ada berita</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {news.map((item) => (
              <div key={item.id} className="bg-white rounded-xl shadow-sm overflow-hidden text-center">
                <div className="h-40 bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center">
                  {item.image_url ? (
                    <Image src={item.image_url} alt={item.title} width={400} height={160} className="w-full h-full object-cover" />
                  ) : (
                    <Newspaper className="w-12 h-12 text-white/50" />
                  )}
                </div>
                <div className="p-4">
                  <div className="flex items-center justify-center gap-2 mb-2">
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                      item.category === "pengumuman" ? "bg-yellow-100 text-yellow-700" :
                      item.category === "kegiatan" ? "bg-green-100 text-green-700" :
                      "bg-red-100 text-red-700"
                    }`}>{item.category}</span>
                    <button onClick={() => togglePublish(item)} className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                      item.is_published ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"
                    }`}>
                      {item.is_published ? <><Eye className="w-3 h-3 inline mr-1" />Published</> : <><EyeOff className="w-3 h-3 inline mr-1" />Draft</>}
                    </button>
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-1 line-clamp-2">{item.title}</h3>
                  <p className="text-sm text-gray-500 mb-3 line-clamp-2">{item.excerpt || "Tidak ada ringkasan"}</p>
                  <div className="flex items-center justify-center gap-4 text-xs text-gray-400">
                    <span>{new Date(item.published_at).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" })}</span>
                    <button onClick={() => openEditModal(item)} className="hover:text-primary-500"><Edit2 className="w-4 h-4 inline" /></button>
                    <button onClick={() => handleDelete(item)} className="hover:text-red-500"><Trash2 className="w-4 h-4 inline" /></button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="font-poppins font-semibold text-lg">{editingNews ? "Edit Berita" : "Tambah Berita"}</h2>
                <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600"><X className="w-5 h-5" /></button>
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">Gambar</label>
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full h-40 border-2 border-dashed border-gray-300 rounded-xl flex items-center justify-center cursor-pointer hover:border-primary-400 transition-colors overflow-hidden"
                >
                  {imagePreview ? (
                    <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                  ) : (
                    <div className="text-center text-gray-400">
                      <ImageIcon className="w-10 h-10 mx-auto mb-2" />
                      <p className="text-sm">Klik untuk upload gambar</p>
                      <p className="text-xs">Maks 5MB</p>
                    </div>
                  )}
                </div>
                <input ref={fileInputRef} type="file" accept="image/*" onChange={handleImageChange} className="hidden" />
              </div>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Judul *</label>
                  <input type="text" value={formData.title} onChange={(e) => {
                    const title = e.target.value;
                    setFormData({ ...formData, title, slug: slugify(title) });
                  }} className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Ringkasan</label>
                  <textarea value={formData.excerpt} onChange={(e) => setFormData({ ...formData, excerpt: e.target.value })} rows={2}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none resize-none" placeholder="Ringkasan singkat..." />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Konten</label>
                  <div className="border border-gray-300 rounded-lg overflow-hidden">
                    <div className="flex gap-1 p-2 bg-gray-50 border-b">
                      {["**Bold**", "_Italic_", "# Heading", "- List", "\n"].map((btn, i) => (
                        <button key={i} type="button"
                          onClick={() => {
                            const textarea = document.getElementById("content-editor") as HTMLTextAreaElement;
                            if (!textarea) return;
                            const start = textarea.selectionStart;
                            const end = textarea.selectionEnd;
                            const text = formData.content;
                            const selected = text.substring(start, end);
                            let newText = text;
                            if (btn === "**Bold**") newText = text.substring(0, start) + `**${selected || "teks"}**` + text.substring(end);
                            else if (btn === "_Italic_") newText = text.substring(0, start) + `_${selected || "teks"}_` + text.substring(end);
                            else if (btn === "# Heading") newText = text.substring(0, start) + `# ${selected || "Judul"}` + text.substring(end);
                            else if (btn === "- List") newText = text.substring(0, start) + `- ${selected || "item"}` + text.substring(end);
                            else newText = text.substring(0, start) + "\n" + text.substring(end);
                            setFormData({ ...formData, content: newText });
                          }}
                          className="px-2 py-1 text-xs bg-white border rounded hover:bg-gray-100"
                        >
                          {btn.replace(/\n/, "↵").replace(/\*\*/g, "").replace(/_/g, "").replace("# ", "")}
                        </button>
                      ))}
                    </div>
                    <textarea id="content-editor" value={formData.content} onChange={(e) => setFormData({ ...formData, content: e.target.value })} rows={10}
                      className="w-full px-4 py-3 outline-none resize-none" placeholder="Tulis konten berita...&#10;&#10;Gunakan **bold**, _italic_, # heading, - list" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Kategori</label>
                    <select value={formData.category} onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none">
                      <option value="pengumuman">Pengumuman</option>
                      <option value="berita">Berita</option>
                      <option value="kegiatan">Kegiatan</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                    <select value={formData.is_published ? "published" : "draft"}
                      onChange={(e) => setFormData({ ...formData, is_published: e.target.value === "published" })}
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none">
                      <option value="published">Published</option>
                      <option value="draft">Draft</option>
                    </select>
                  </div>
                </div>
              </div>
              <div className="flex gap-3 mt-6">
                <button onClick={() => setShowModal(false)} className="flex-1 py-2.5 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50">Batal</button>
                <button onClick={handleSave} disabled={!formData.title || saving}
                  className="flex-1 py-2.5 bg-primary-500 text-white rounded-lg hover:bg-primary-600 disabled:opacity-50 flex items-center justify-center">
                  {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : "Simpan"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
