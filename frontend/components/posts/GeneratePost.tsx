"use client";

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
import { Switch } from "@/components/ui/switch";
import { useAuthUserFetch } from "@/hooks/useAuthUserFetch";
import { cn } from "@/lib";
import { ICreatePostData, IPost } from "@/types";
import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";
import { useState } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { toast } from "sonner";
import { PostItem } from "./PostItem";


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
        
        const now = new Date();
        if (scheduledDateTime < now) {
          toast.error("Cannot schedule for a past time. Please select a future time.");
          return;
        }
        
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
                    <div className="relative">
                      <DatePicker
                        selected={scheduleDate}
                        onChange={(date: Date | null) => date && setScheduleDate(date)}
                        dateFormat="MMMM d, yyyy"
                        minDate={new Date()}
                        placeholderText="Select a date"
                        className="w-full border rounded p-2 pl-10"
                        wrapperClassName="w-full"
                        showPopperArrow={false}
                        todayButton="Today"
                        highlightDates={[new Date()]}
                      />
                      <CalendarIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-500" />
                    </div>
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
