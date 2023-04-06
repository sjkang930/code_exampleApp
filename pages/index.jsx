import Button from "../components/Button";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import axios from "axios";
import PostSmall from "../components/PostSmall";
import { signIn } from "next-auth/react";

export default function Home() {
  const router = useRouter();
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    const getPost = async () => {
      const res = await axios.get("/api/posts");
      const sorted = res.data.sort((a, b) => {
        return new Date(b.createdAt) - new Date(a.createdAt);
      });
      setData(sorted);
      setData(res.data);
      setLoading(false);
    };
    getPost();
  }, []);

  const onLike = async (post) => {
    const res = await axios.post("/api/posts/like", {
      id: post.id,
      liked: post.liked,
      totalLikes: post.totalLikes,
    });
    if (!res.data.session) {
      signIn();
      return;
    }
    setData(res.data.post);
    console.log(res.data);
    return;
    //update database of post for liked and totalLikes by post.id
  };
  const onShare = () => {};

  const liked = () => {};

  return (
    <div className="pt-8 pb-10 lg:pt-12 lg:pb-14 mx-auto max-w-7xl px-2">
      {loading ? (
        "Loading..."
      ) : (
        <div className="max-w-2xl mx-auto">
          <h1 className="text-3xl font-extrabold tracking-tight text-gray-100 sm:text-4xl">
            {/* <span className="block">Welcome to</span>
          <span className="block text-indigo-300">Your Assignment</span> */}
          </h1>
          <div className="mt-6 text-gray-300 space-y-6">
            <p className="text-lg">
              <Button
                onClick={() => {
                  router.push("/createPost");
                }}
                buttonName="Create a post"
              />
            </p>
          </div>
          {data?.map((post) => (
            <div key={post.id}>
              <PostSmall
                user={post.user}
                onComment={() => {
                  router.push(`/post/${post.id}`);
                }}
                onLike={() => {
                  onLike(post);
                }}
                onShare={onShare}
                liked={liked}
                post={post}
                href={`/post/${post.id}`}
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
