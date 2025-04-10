"use client";

import { useState } from "react";
import { Button } from "@/components/ui";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { PostItem } from "./PostItem";
import { IPost, ICreatePostData } from "@/types";
import { useAuthUserFetch } from "@/hooks/useAuthUserFetch";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib";
import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";

export const GeneratePost = ({
  onPostGenerated,
}: {
  onPostGenerated: (newPost: IPost) => void;
}) => {
  const [topic, setTopic] = useState("");
  const [style, setStyle] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedPost, setGeneratedPost] = useState<IPost | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [scheduleEnabled, setScheduleEnabled] = useState(false);
  const [scheduleDate, setScheduleDate] = useState<Date | undefined>(undefined);
  const [scheduleTime, setScheduleTime] = useState("12:00");
  const apiFetch = useAuthUserFetch<IPost>();

  const handleGenerate = async (e: React.MouseEvent) => {
    e.preventDefault();
    if (!topic || !style) return;

    setIsGenerating(true);
    try {
      const post = await apiFetch("/api/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
        },
        body: JSON.stringify({ topic, style }),
      });

      if (!post) {
        throw new Error("Failed to generate post");
      }
      setGeneratedPost({
        ...post,
        id: "preview",
        createdAt: new Date(),
        updatedAt: new Date(),
        isPublished: false,
      });
      setIsDialogOpen(true);
    } catch (error) {
      console.error("Error generating post:", error);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSave = async () => {
    if (!generatedPost) return;

    try {
      const endpoint =
        scheduleEnabled && scheduleDate
          ? "/api/posts/schedule"
          : "/api/posts/save";
      const postData: ICreatePostData = {
        title: generatedPost.title,
        content: generatedPost.content,
        topic: generatedPost.topic,
        style: generatedPost.style,
      };

      if (scheduleEnabled && scheduleDate) {
        const scheduledDateTime = new Date(scheduleDate);
        const [hours, minutes] = scheduleTime.split(":").map(Number);
        scheduledDateTime.setHours(hours, minutes);

        postData.scheduledPublishDate = scheduledDateTime;
      }

      const savedPost = await apiFetch(endpoint, {
        method: "POST",
        body: JSON.stringify(postData),
      });

      if (!savedPost) {
        throw new Error("Failed to save post");
      }

      onPostGenerated(savedPost);
      setTopic("");
      setStyle("");
      setScheduleEnabled(false);
      setScheduleDate(undefined);
      setScheduleTime("12:00");
      setIsDialogOpen(false);
      setGeneratedPost(null);
    } catch (error) {
      console.error("Error saving post:", error);
    }
  };

  return (
    <>
      <div className="mb-8 p-6 border rounded-lg shadow-sm">
        <h2 className="text-xl font-semibold mb-4">Generate New Post</h2>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Topic
            </label>
            <input
              type="text"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              className="w-full px-3 py-2 border rounded-md"
              placeholder="Enter topic"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Style
            </label>
            <input
              type="text"
              value={style}
              onChange={(e) => setStyle(e.target.value)}
              className="w-full px-3 py-2 border rounded-md"
              placeholder="Enter writing style"
            />
          </div>
          <Button
            onClick={handleGenerate}
            disabled={isGenerating || !topic || !style}
          >
            {isGenerating ? "Generating..." : "Generate Post"}
          </Button>
        </div>
      </div>

      <AlertDialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <AlertDialogContent className="max-w-3xl">
          <AlertDialogHeader>
            <AlertDialogTitle>Preview Generated Post</AlertDialogTitle>
          </AlertDialogHeader>

          {generatedPost && (
            <div className="my-4 max-h-[60vh] overflow-y-auto">
              <PostItem
                post={generatedPost}
                onPublish={async () => {}}
                mode="preview"
              />

              <div className="mt-4 flex items-center space-x-2">
                <Switch
                  checked={scheduleEnabled}
                  onCheckedChange={setScheduleEnabled}
                  id="schedule-switch"
                />
                <label
                  htmlFor="schedule-switch"
                  className="text-sm font-medium"
                >
                  Schedule for later publication
                </label>
              </div>

              {scheduleEnabled && (
                <div className="mt-4 grid gap-4">
                  <div>
                    <label className="block text-sm mb-1">Date</label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className={cn(
                            "w-full justify-start text-left font-normal",
                            !scheduleDate && "text-muted-foreground"
                          )}
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {scheduleDate
                            ? format(scheduleDate, "PPP")
                            : "Pick a date"}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0">
                        <Calendar
                          mode="single"
                          selected={scheduleDate}
                          onSelect={setScheduleDate}
                          initialFocus
                          disabled={(date: Date) => date < new Date()}
                        />
                      </PopoverContent>
                    </Popover>
                  </div>

                  <div>
                    <label className="block text-sm mb-1">Time</label>
                    <input
                      type="time"
                      value={scheduleTime}
                      onChange={(e) => setScheduleTime(e.target.value)}
                      className="w-full border rounded p-2"
                    />
                  </div>
                </div>
              )}
            </div>
          )}

          <AlertDialogFooter>
            <AlertDialogCancel
              onClick={() => {
                setGeneratedPost(null);
                setScheduleEnabled(false);
                setScheduleDate(undefined);
                setScheduleTime("12:00");
              }}
            >
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleSave}
              disabled={scheduleEnabled && !scheduleDate}
            >
              {scheduleEnabled ? "Schedule" : "Save"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};
