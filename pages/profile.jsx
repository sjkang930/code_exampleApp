import { useSession, signIn, signOut } from "next-auth/react";
import { unstable_getServerSession } from "next-auth/next";
import { authOptions } from "./api/auth/[...nextauth]";
import { prisma } from "../server/db/client";
import PostSmall from "../components/PostSmall";
import Comments from "../components/Comments";

export default function Component({ posts, comments }) {
  const { data: session } = useSession();
  console.log(comments);
  if (session) {
    return (
      <>
        Signed in as {session.user.email} <br />
        <img src={session.user.image} />
        <br />
        {session.user.name} <br />
        <button onClick={() => signOut()}>Sign out</button>
        {posts?.map((post) => (
          <div key={post.id}>
            <PostSmall
              user={post.user}
              onComment={() => {
                router.push(`/post/${post.id}`);
              }}
              onLike={() => {
                onLike(post);
              }}
              liked={post.liked}
              post={post}
              href={`/post/${post.id}`}
            />
          </div>
        ))}
        <Comments comments={comments ? comments : []} />
      </>
    );
  }
  return (
    <>
      Not signed in <br />
      <button onClick={() => signIn()}>Sign in</button>
    </>
  );
}

export async function getServerSideProps(context) {
  const session = await unstable_getServerSession(
    context.req,
    context.res,
    authOptions
  );

  if (!session) {
    //redirect to login page
    return {
      redirect: {
        destination: "/api/auth/signin",
        permanent: false,
      },
    };
  }
  const user = await prisma.user.findUnique({
    where: {
      email: session.user.email,
    },
  });

  const posts = await prisma.post.findMany({
    where: {
      userId: user.id,
    },
    include: {
      user: true,
      comments: true,
    },
  });
  const comments = await prisma.comment.findMany({
    where: {
      userId: user.id,
    },
    include: {
      user: true,
      post: true,
    },
  });

  return {
    props: {
      session,
      posts: JSON.parse(JSON.stringify(posts)),
      comments: JSON.parse(JSON.stringify(comments)),
    },
  };
}
