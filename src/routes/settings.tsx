import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { BellRing, RotateCcw, Sparkles, UserRound } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { PageHeader } from "@/components/ui-bits";
import { useStore } from "@/lib/store";

export const Route = createFileRoute("/settings")({
  head: () => ({
    meta: [
      { title: "Settings | AI Workday Copilot" },
      {
        name: "description",
        content: "Manage your profile, notification preferences, and AI assistant behaviour.",
      },
      { property: "og:title", content: "Settings | AI Workday Copilot" },
      {
        property: "og:description",
        content: "Manage your profile, notifications, and AI preferences.",
      },
    ],
  }),
  component: SettingsPage,
});

const STORAGE_KEY = "workday-copilot-settings-v1";

type Preferences = {
  name: string;
  role: string;
  email: string;
  emailDigest: boolean;
  taskReminders: boolean;
  aiSuggestions: boolean;
  aiTone: "concise" | "balanced" | "detailed";
  workingHours: "9-5" | "8-4" | "10-6" | "flexible";
};

const defaultPreferences: Preferences = {
  name: "Alex Mokoena",
  role: "Product Operations",
  email: "alex.mokoena@company.com",
  emailDigest: true,
  taskReminders: true,
  aiSuggestions: true,
  aiTone: "balanced",
  workingHours: "9-5",
};

function loadPreferences(): Preferences {
  if (typeof window === "undefined") return defaultPreferences;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (raw) return { ...defaultPreferences, ...(JSON.parse(raw) as Partial<Preferences>) };
  } catch {
    /* fall back to defaults */
  }
  return defaultPreferences;
}

function SettingsPage() {
  const { resetDemoData } = useStore();
  const [prefs, setPrefs] = useState<Preferences>(defaultPreferences);
  const [hydrated, setHydrated] = useState(false);
  const [confirmReset, setConfirmReset] = useState(false);

  useEffect(() => {
    setPrefs(loadPreferences());
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(prefs));
    } catch {
      /* storage unavailable — in-memory only */
    }
  }, [prefs, hydrated]);

  function saveProfile() {
    if (!prefs.name.trim()) {
      toast.error("Please enter your name.");
      return;
    }
    toast.success("Profile updated");
  }

  return (
    <div className="space-y-7">
      <PageHeader
        title="Settings"
        subtitle="Manage your profile, notifications, and how AI works for you."
      />

      {/* Profile */}
      <section className="surface-card p-5 sm:p-6">
        <div className="flex items-center gap-2.5">
          <span className="flex size-8 items-center justify-center rounded-lg bg-accent text-accent-foreground">
            <UserRound className="size-4" aria-hidden />
          </span>
          <h2 className="text-sm font-semibold text-foreground">Profile</h2>
        </div>
        <form
          className="mt-5 grid gap-4 sm:grid-cols-2"
          onSubmit={(e) => {
            e.preventDefault();
            saveProfile();
          }}
        >
          <div className="space-y-2">
            <Label htmlFor="settings-name">Full name</Label>
            <Input
              id="settings-name"
              value={prefs.name}
              onChange={(e) => setPrefs((p) => ({ ...p, name: e.target.value }))}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="settings-role">Role</Label>
            <Input
              id="settings-role"
              value={prefs.role}
              onChange={(e) => setPrefs((p) => ({ ...p, role: e.target.value }))}
            />
          </div>
          <div className="space-y-2 sm:col-span-2">
            <Label htmlFor="settings-email">Email</Label>
            <Input
              id="settings-email"
              type="email"
              value={prefs.email}
              onChange={(e) => setPrefs((p) => ({ ...p, email: e.target.value }))}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="settings-hours">Working hours</Label>
            <Select
              value={prefs.workingHours}
              onValueChange={(v) =>
                setPrefs((p) => ({ ...p, workingHours: v as Preferences["workingHours"] }))
              }
            >
              <SelectTrigger id="settings-hours">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="9-5">9:00 AM – 5:00 PM</SelectItem>
                <SelectItem value="8-4">8:00 AM – 4:00 PM</SelectItem>
                <SelectItem value="10-6">10:00 AM – 6:00 PM</SelectItem>
                <SelectItem value="flexible">Flexible</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="sm:col-span-2">
            <Button type="submit">Save profile</Button>
          </div>
        </form>
      </section>

      {/* Notifications */}
      <section className="surface-card p-5 sm:p-6">
        <div className="flex items-center gap-2.5">
          <span className="flex size-8 items-center justify-center rounded-lg bg-accent text-accent-foreground">
            <BellRing className="size-4" aria-hidden />
          </span>
          <h2 className="text-sm font-semibold text-foreground">Notifications</h2>
        </div>
        <div className="mt-5 space-y-5">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-sm font-medium text-foreground">Daily email digest</p>
              <p className="text-xs text-muted-foreground">
                A morning summary of your schedule and priority tasks.
              </p>
            </div>
            <Switch
              checked={prefs.emailDigest}
              onCheckedChange={(v) => setPrefs((p) => ({ ...p, emailDigest: v }))}
              aria-label="Toggle daily email digest"
            />
          </div>
          <Separator />
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-sm font-medium text-foreground">Task reminders</p>
              <p className="text-xs text-muted-foreground">
                Get notified before high-priority tasks are due.
              </p>
            </div>
            <Switch
              checked={prefs.taskReminders}
              onCheckedChange={(v) => setPrefs((p) => ({ ...p, taskReminders: v }))}
              aria-label="Toggle task reminders"
            />
          </div>
        </div>
      </section>

      {/* AI preferences */}
      <section className="ai-panel p-5 sm:p-6">
        <div className="flex items-center gap-2.5">
          <span className="flex size-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <Sparkles className="size-4" aria-hidden />
          </span>
          <h2 className="text-sm font-semibold text-foreground">AI assistant</h2>
        </div>
        <div className="mt-5 space-y-5">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-sm font-medium text-foreground">Proactive AI suggestions</p>
              <p className="text-xs text-muted-foreground">
                Let the assistant surface recommendations on your dashboard automatically.
              </p>
            </div>
            <Switch
              checked={prefs.aiSuggestions}
              onCheckedChange={(v) => setPrefs((p) => ({ ...p, aiSuggestions: v }))}
              aria-label="Toggle proactive AI suggestions"
            />
          </div>
          <Separator />
          <div className="space-y-2">
            <Label htmlFor="settings-tone">Response style</Label>
            <Select
              value={prefs.aiTone}
              onValueChange={(v) => setPrefs((p) => ({ ...p, aiTone: v as Preferences["aiTone"] }))}
            >
              <SelectTrigger id="settings-tone" className="sm:w-64">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="concise">Concise</SelectItem>
                <SelectItem value="balanced">Balanced</SelectItem>
                <SelectItem value="detailed">Detailed</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">
              Controls how much detail the AI includes in recommendations and chat replies.
            </p>
          </div>
        </div>
      </section>

      {/* Data */}
      <section className="surface-card p-5 sm:p-6">
        <h2 className="text-sm font-semibold text-foreground">Data</h2>
        <p className="mt-1.5 text-xs text-muted-foreground">
          Your tasks and calendar are stored locally in this browser. Resetting will replace them
          with the original sample data.
        </p>
        <div className="mt-4">
          <Button variant="outline" onClick={() => setConfirmReset(true)}>
            <RotateCcw className="size-4" aria-hidden />
            Reset demo data
          </Button>
        </div>
      </section>

      <AlertDialog open={confirmReset} onOpenChange={setConfirmReset}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Reset demo data?</AlertDialogTitle>
            <AlertDialogDescription>
              This replaces all your current tasks and calendar events with the original sample
              data. This cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                resetDemoData();
                toast.success("Demo data reset");
                setConfirmReset(false);
              }}
            >
              Reset data
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
