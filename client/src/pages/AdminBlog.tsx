import { useState } from "react";
import { Link } from "wouter";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import {
  Moon, Plus, Sparkles, Eye, Trash2, CheckCircle, Clock,
  ArrowLeft, RefreshCw, Globe, FileText, TrendingUp
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";

const CATEGORIES = ["insomnia", "cbt-i", "anxiety", "sleep-science", "lifestyle"];

const SUGGESTED_TOPICS = [
  { title: "Why You Can't Fall Asleep: The Science of Sleep Onset Insomnia", keyword: "can't fall asleep", category: "insomnia" },
  { title: "CBT-I vs Sleep Medication: What Doctors Actually Recommend", keyword: "CBT-I vs sleep medication", category: "cbt-i" },
  { title: "The 4-7-8 Breathing Technique for Sleep: Does It Really Work?", keyword: "4-7-8 breathing for sleep", category: "anxiety" },
  { title: "Sleep Restriction Therapy: The Counterintuitive Cure for Insomnia", keyword: "sleep restriction therapy", category: "cbt-i" },
  { title: "Why You Wake Up at 3am: Causes and Fixes", keyword: "wake up at 3am", category: "insomnia" },
  { title: "Cortisol and Sleep: How Stress Hormones Destroy Your Rest", keyword: "cortisol and sleep", category: "sleep-science" },
  { title: "Sleep Hygiene Myths: What Actually Works (And What Doesn't)", keyword: "sleep hygiene", category: "lifestyle" },
  { title: "Racing Mind at Night: How to Stop Overthinking and Sleep", keyword: "racing mind at night", category: "anxiety" },
  { title: "Magnesium for Sleep: What the Research Actually Says", keyword: "magnesium for sleep", category: "sleep-science" },
  { title: "How to Reset Your Circadian Rhythm in 7 Days", keyword: "reset circadian rhythm", category: "sleep-science" },
];

const STATUS_STYLES: Record<string, string> = {
  draft: "bg-yellow-500/15 text-yellow-300 border-yellow-500/20",
  published: "bg-green-500/15 text-green-300 border-green-500/20",
  archived: "bg-gray-500/15 text-gray-400 border-gray-500/20",
};

export default function AdminBlog() {
  const [generateOpen, setGenerateOpen] = useState(false);
  const [genTitle, setGenTitle] = useState("");
  const [genKeyword, setGenKeyword] = useState("");
  const [genCategory, setGenCategory] = useState("insomnia");
  const [isGenerating, setIsGenerating] = useState(false);
  const [statusFilter, setStatusFilter] = useState<"all" | "draft" | "published">("all");

  const utils = trpc.useUtils();

  const { data: postsData, isLoading } = trpc.blog.adminList.useQuery();

  const generateMutation = trpc.blog.generate.useMutation({
    onSuccess: () => {
      toast.success("Article generated successfully!");
      setGenerateOpen(false);
      setGenTitle("");
      setGenKeyword("");
      utils.blog.adminList.invalidate();
    },
    onError: (err) => toast.error(`Generation failed: ${err.message}`),
  });

  const publishMutation = trpc.blog.setStatus.useMutation({
    onSuccess: () => {
      toast.success("Article published!");
      utils.blog.adminList.invalidate();
    },
    onError: (err) => toast.error(err.message),
  });

  const deleteMutation = trpc.blog.delete.useMutation({
    onSuccess: () => {
      toast.success("Article deleted.");
      utils.blog.adminList.invalidate();
    },
    onError: (err) => toast.error(err.message),
  });

  const generateBulkMutation = trpc.blog.bulkGenerate.useMutation({
    onSuccess: () => {
      toast.success("Bulk generation complete!");
      utils.blog.adminList.invalidate();
    },
    onError: (err) => toast.error(err.message),
  });

  const handleGenerate = async () => {
    if (!genTitle || !genKeyword) {
      toast.error("Please fill in title and focus keyword.");
      return;
    }
    setIsGenerating(true);
    try {
      await generateMutation.mutateAsync({
        title: genTitle,
        focusKeyword: genKeyword,
        category: genCategory,
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleUseSuggestion = (topic: typeof SUGGESTED_TOPICS[0]) => {
    setGenTitle(topic.title);
    setGenKeyword(topic.keyword);
    setGenCategory(topic.category);
  };

  const posts = postsData ?? [];
  const published = posts.filter((p: { status: string }) => p.status === "published").length;
  const drafts = posts.filter((p: { status: string }) => p.status === "draft").length;

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Header */}
      <header className="border-b border-border/30 bg-card/20 sticky top-0 z-40 backdrop-blur-sm">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/admin">
              <button className="flex items-center gap-1 text-foreground/50 hover:text-foreground/80 text-sm transition-colors">
                <ArrowLeft className="w-4 h-4" /> Admin
              </button>
            </Link>
            <span className="text-foreground/20">/</span>
            <div className="flex items-center gap-2">
              <FileText className="w-5 h-5 text-amber" />
              <span className="font-semibold">Blog Manager</span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => generateBulkMutation.mutate()}
              disabled={generateBulkMutation.isPending}
              className="text-xs"
            >
              {generateBulkMutation.isPending ? (
                <><RefreshCw className="w-3 h-3 mr-1 animate-spin" /> Generating...</>
              ) : (
                <><Sparkles className="w-3 h-3 mr-1" /> Auto-Generate 5</>
              )}
            </Button>
            <Dialog open={generateOpen} onOpenChange={setGenerateOpen}>
              <DialogTrigger asChild>
                <Button size="sm" className="bg-amber text-background hover:bg-amber/90 font-semibold">
                  <Plus className="w-4 h-4 mr-1" /> New Article
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle className="flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-amber" /> AI Article Generator
                  </DialogTitle>
                </DialogHeader>
                <div className="space-y-4 mt-4">
                  <div>
                    <Label className="text-sm font-medium mb-1.5 block">Article Title *</Label>
                    <Input
                      placeholder="e.g. Why You Can't Fall Asleep: The Science Explained"
                      value={genTitle}
                      onChange={e => setGenTitle(e.target.value)}
                    />
                  </div>
                  <div>
                    <Label className="text-sm font-medium mb-1.5 block">Focus Keyword *</Label>
                    <Input
                      placeholder="e.g. can't fall asleep"
                      value={genKeyword}
                      onChange={e => setGenKeyword(e.target.value)}
                    />
                  </div>
                  <div>
                    <Label className="text-sm font-medium mb-1.5 block">Category</Label>
                    <Select value={genCategory} onValueChange={setGenCategory}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {CATEGORIES.map(c => (
                          <SelectItem key={c} value={c}>{c}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Suggested topics */}
                  <div>
                    <Label className="text-sm font-medium mb-2 block text-foreground/60">Or pick a suggested topic:</Label>
                    <div className="grid grid-cols-1 gap-1.5 max-h-48 overflow-y-auto">
                      {SUGGESTED_TOPICS.map((topic, i) => (
                        <button
                          key={i}
                          onClick={() => handleUseSuggestion(topic)}
                          className="text-left text-xs p-2.5 rounded-lg border border-border/30 hover:border-amber/30 hover:bg-card/50 transition-all"
                        >
                          <span className="font-medium">{topic.title}</span>
                          <span className="text-foreground/40 ml-2">· {topic.keyword}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  <Button
                    onClick={handleGenerate}
                    disabled={isGenerating || !genTitle || !genKeyword}
                    className="w-full bg-amber text-background hover:bg-amber/90 font-semibold"
                  >
                    {isGenerating ? (
                      <><RefreshCw className="w-4 h-4 mr-2 animate-spin" /> Generating (~30s)...</>
                    ) : (
                      <><Sparkles className="w-4 h-4 mr-2" /> Generate Article</>
                    )}
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-8">
        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          {[
            { label: "Total Articles", value: posts.length, icon: FileText, color: "text-foreground" },
            { label: "Published", value: published, icon: Globe, color: "text-green-400" },
            { label: "Drafts", value: drafts, icon: Clock, color: "text-yellow-400" },
          ].map(stat => (
            <div key={stat.label} className="rounded-xl border border-border/30 bg-card/20 p-4 flex items-center gap-3">
              <stat.icon className={`w-8 h-8 ${stat.color} opacity-60`} />
              <div>
                <p className="text-2xl font-bold">{stat.value}</p>
                <p className="text-xs text-foreground/50">{stat.label}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Filter */}
        <div className="flex gap-2 mb-6">
          {(["all", "published", "draft"] as const).map(s => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={`px-4 py-1.5 rounded-full text-sm font-medium border transition-all capitalize ${
                statusFilter === s
                  ? "bg-amber text-background border-amber"
                  : "border-border/40 text-foreground/60 hover:border-amber/40"
              }`}
            >
              {s}
            </button>
          ))}
        </div>

        {/* Articles table */}
        {isLoading ? (
          <div className="space-y-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="h-16 rounded-xl bg-card/20 animate-pulse" />
            ))}
          </div>
        ) : posts.length === 0 ? (
          <div className="text-center py-24 text-foreground/40">
            <FileText className="w-12 h-12 mx-auto mb-4 opacity-30" />
            <p className="text-lg mb-2">No articles yet</p>
            <p className="text-sm mb-6">Generate your first SEO article to start driving organic traffic.</p>
            <Button
              onClick={() => generateBulkMutation.mutate()}
              disabled={generateBulkMutation.isPending}
              className="bg-amber text-background hover:bg-amber/90 font-semibold"
            >
              <Sparkles className="w-4 h-4 mr-2" />
              {generateBulkMutation.isPending ? "Generating 10 articles..." : "Auto-Generate 10 Articles"}
            </Button>
          </div>
        ) : (
          <div className="space-y-2">
            {posts.map(post => (
              <div
                key={post.id}
                className="flex items-center gap-4 p-4 rounded-xl border border-border/25 bg-card/15 hover:bg-card/30 transition-all"
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className={`text-xs px-2 py-0.5 rounded-full border font-medium ${STATUS_STYLES[post.status]}`}>
                      {post.status}
                    </span>
                    <span className="text-xs text-foreground/40">{post.category}</span>
                    <span className="text-xs text-foreground/30 flex items-center gap-1">
                      <Clock className="w-3 h-3" /> {post.readTimeMinutes} min
                    </span>
                  </div>
                  <h3 className="font-medium text-sm truncate">{post.title}</h3>
                  <p className="text-xs text-foreground/40 mt-0.5">/{post.slug} · {post.focusKeyword}</p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <Link href={`/blog/${post.slug}`} target="_blank">
                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                      <Eye className="w-4 h-4" />
                    </Button>
                  </Link>
                  {post.status === "draft" && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 px-3 text-green-400 hover:text-green-300 hover:bg-green-500/10"
                      onClick={() => publishMutation.mutate({ id: post.id, status: "published" })}
                      disabled={publishMutation.isPending}
                    >
                      <CheckCircle className="w-4 h-4 mr-1" /> Publish
                    </Button>
                  )}
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 w-8 p-0 text-red-400/60 hover:text-red-400 hover:bg-red-500/10"
                    onClick={() => {
                      if (confirm("Delete this article?")) {
                        deleteMutation.mutate({ id: post.id });
                      }
                    }}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
