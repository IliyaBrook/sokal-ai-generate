"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui";
import { useAuthUserFetch } from "@/hooks/useAuthUserFetch";
import { IPost } from "@sokal_ai_generate/shared-types";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { PostItem, EditingContext } from "./PostItem";
import { PostStatus, PostStatusBadge } from "./PostStatusBadge";

const defaultPostItemProps = {
  showStatus: true,
  showEdit: true,
  showSchedule: true,
  showShare: true,
  liveView: false,
  editable: false
}

const PostItemWrapper = ({ post, isSharedPage, isScheduled, ...props }: { 
  post: IPost; 
  isSharedPage: boolean;
  isScheduled: boolean;
  [key: string]: any;
}) => {
  const getPostStatus = (post: IPost): PostStatus => {
    if (post.isPublished) return "published";
    if (post.scheduledPublishDate && new Date(post.scheduledPublishDate) > new Date()) {
      return "scheduled";
    }
    return "draft";
  };

  const getPostStatusBadge = (post: IPost) => {
    if (!isSharedPage) {
      return (
        <PostStatusBadge 
          status={getPostStatus(post)}
          scheduledDate={post.scheduledPublishDate}
        />
      );
    }
    return null;
  };

  return (
    <div className="relative">
      <div className="absolute top-2 right-2 z-10">
        {getPostStatusBadge(post)}
      </div>
      <PostItem 
        post={post}
        {...props}
      />
    </div>
  );
};

export const UserPostList = ({ posts: initialPosts }: { posts: IPost[] }) => {
  const [posts, setPosts] = useState(initialPosts);
  const pathname = usePathname();
  const isSharedPage = pathname.includes('/shared/');
  const [activeEditPostId, setActiveEditPostId] = useState<string | null>(null);
  
  useEffect(() => {
    setPosts(initialPosts);
  }, [initialPosts]);

  const apiFetch = useAuthUserFetch();

  const handlePublish = async (postId: string) => {
    try {
      const data = await apiFetch<IPost>(`/api/posts/${postId}`, {
        method: 'PUT',
        body: JSON.stringify({ isPublished: true }),
      });
      
      if (data) {
        const updatedPosts = posts.map(post => 
          post.id === postId ? data : post
        );
        setPosts(updatedPosts);
        toast.success("Post published successfully");
      }
      
      return data;
    } catch (error) {
      console.error('Error publishing post:', error);
      toast.error("Failed to publish post");
      throw error;
    }
  };

  const handleEditPost = async (id: string, content: string): Promise<IPost> => {
    try {
      const data = await apiFetch<IPost>(`/api/posts/${id}`, {
        method: 'PUT',
        body: JSON.stringify({ content }),
      });
      
      if (!data) {
        toast.error("Failed to update post");
        return Promise.reject(new Error("Failed to update post"));
      }
      const updatedPosts = posts.map(post => 
        post.id === id ? data : post
      );
      setPosts(updatedPosts);
      toast.success("Post updated successfully");
      return data;
    } catch (error) {
      console.error('Error updating post:', error);
      throw error;
    }
  };

  const getScheduledPosts = () => {
    return Array.isArray(posts) 
      ? posts
          .filter(post => 
            !post.isPublished && post.scheduledPublishDate && new Date(post.scheduledPublishDate) > new Date()
          )
          .sort((a, b) => {
            if (!a.scheduledPublishDate || !b.scheduledPublishDate) return 0;
            return new Date(a.scheduledPublishDate).getTime() - new Date(b.scheduledPublishDate).getTime();
          })
      : [];
  };

  const getPublishedPosts = () => {
    return Array.isArray(posts)
      ? posts.filter(post => post.isPublished)
      : [];
  };

  const getDraftPosts = () => {
    return Array.isArray(posts)
      ? posts.filter(post => 
        !post.isPublished && (!post.scheduledPublishDate || new Date(post.scheduledPublishDate) <= new Date())
      )
      : [];
  };

  const scheduledPosts = getScheduledPosts();
  const publishedPosts = getPublishedPosts();
  const draftPosts = getDraftPosts();

  return (
    <EditingContext.Provider value={{ activeEditPostId, setActiveEditPostId }}>
      <div className="space-y-8">
        <Tabs defaultValue="all_posts" className="mb-4">
          <TabsList>
            <TabsTrigger value="all_posts" className="cursor-pointer">All Posts</TabsTrigger>
            <TabsTrigger value="scheduled_posts" className="cursor-pointer">Scheduled Posts</TabsTrigger>
            <TabsTrigger value="drafts" className="cursor-pointer">Drafts</TabsTrigger>
            <TabsTrigger value="published_posts" className="cursor-pointer">Published Posts</TabsTrigger>
          </TabsList>
          <TabsContent value="all_posts">
            {!Array.isArray(posts) || posts.length === 0 ? (
              <div className="flex justify-center items-center h-full">
                <p className="text-gray-500">No posts found</p>
              </div>
            ) : (
              <>
                {scheduledPosts.length > 0 && (
                  <div>
                    <h2 className="text-xl font-semibold mb-4">Scheduled Posts</h2>
                    <div className="grid gap-6">
                      {scheduledPosts.map((post) => (
                        <PostItemWrapper 
                          key={post.id} 
                          post={post} 
                          onPublish={handlePublish} 
                          onEdit={handleEditPost}
                          isSharedPage={isSharedPage}
                          isScheduled={true}
                          {...defaultPostItemProps}
                        />
                      ))}
                    </div>
                  </div>
                )}

                {draftPosts.length > 0 && (
                  <div className="mt-4">
                    <h2 className="text-xl font-semibold mb-4">Drafts</h2>
                    <div className="grid gap-6">
                      {draftPosts.map((post) => (
                        <PostItemWrapper 
                          key={post.id} 
                          post={post} 
                          onPublish={handlePublish} 
                          onEdit={handleEditPost}
                          isSharedPage={isSharedPage}
                          isScheduled={false}
                          
                          {...defaultPostItemProps}
                        />
                      ))}
                    </div>
                  </div>
                )}

                {publishedPosts.length > 0 && (
                  <div className="mt-4">
                    <h2 className="text-xl font-semibold mb-4">Published Posts</h2>
                    <div className="grid gap-6">
                      {publishedPosts.map((post) => (
                        <PostItemWrapper 
                          key={post.id} 
                          post={post} 
                          onPublish={handlePublish} 
                          onEdit={handleEditPost}
                          isSharedPage={isSharedPage}
                          isScheduled={false}
                          {...defaultPostItemProps}
                          showPublish={false}
                        />
                      ))}
                    </div>
                  </div>
                )}
              </>
            )}
          </TabsContent>
          <TabsContent value="scheduled_posts">
            {scheduledPosts.length === 0 ? (
              <div className="flex justify-center items-center h-full">
                <p className="text-gray-500">No scheduled posts found</p>
              </div>
            ) : (
              <div className="grid gap-6">
                {scheduledPosts.map((post) => (
                  <PostItemWrapper 
                    key={post.id} 
                    post={post} 
                    onPublish={handlePublish} 
                    onEdit={handleEditPost}
                    isSharedPage={isSharedPage}
                    isScheduled={true}
                    {...defaultPostItemProps}
                  />
                ))}
              </div>
            )}
          </TabsContent>
          <TabsContent value="drafts">
            {draftPosts.length === 0 ? (
              <div className="flex justify-center items-center h-full">
                <p className="text-gray-500">No draft posts found</p>
              </div>
            ) : (
              <div className="grid gap-6">
                {draftPosts.map((post) => (
                  <PostItemWrapper 
                    key={post.id} 
                    post={post} 
                    onPublish={handlePublish} 
                    onEdit={handleEditPost}
                    isSharedPage={isSharedPage}
                    isScheduled={false}
                    {...defaultPostItemProps}
                  />
                ))}
              </div>
            )}
          </TabsContent>
          <TabsContent value="published_posts">
            {publishedPosts.length === 0 ? (
              <div className="flex justify-center items-center h-full">
                <p className="text-gray-500">No published posts found</p>
              </div>
            ) : (
              <div className="grid gap-6">
                {publishedPosts.map((post) => (
                  <PostItemWrapper 
                    key={post.id} 
                    post={post} 
                    onPublish={handlePublish} 
                    onEdit={handleEditPost}
                    isSharedPage={isSharedPage}
                    isScheduled={false}
                    {...defaultPostItemProps}
                    showPublish={false}
                  />
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </EditingContext.Provider>
  );
};