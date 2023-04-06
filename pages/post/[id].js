import axios from 'axios'
import { useState, useEffect } from 'react'
import { prisma } from '../../server/db/client'
import Post from '../../components/Post'
import Comments from '../../components/Comments'
import CommentForm from '../../components/CommentForm'
import { signIn } from 'next-auth/react'

export default function Info({ post }) {
  //get all comments using axios
  const [comments, setComments] = useState([])
  const [posts, setPosts] = useState({})
  const [loading, setLoading] = useState(true)
  const [prismaUser, setPrismaUser] = useState(null)
  useEffect(() => {
    const getComments = async () => {
      const res = await axios.get(`/api/post/${post.id}`)
      const respond = res.data
      console.log("respond", respond)
      const sortedComments = respond.data.sort((a, b) => {
        return new Date(b.createdAt) - new Date(a.createdAt)
      })
      setComments(sortedComments)
      setPrismaUser(respond.prismaUser)
    }
    getComments()
    setLoading(false)
  }, [])
  const onComment = () => { };
  const onLike = async (postId, liked) => {
    const res = await axios.post('/api/posts/like', { id: postId, liked })
    if (!res.data.session) {
      signIn()
      return
    }
    setPosts(res.data.post)
  };
  const onShare = () => { };
  const totalLikes = () => { };
  const totalComment = () => { };
  const liked = () => { };
  const comment = () => { };
  const user = () => { };
  console.log("session", prismaUser)
  const onSubmit = async (comment) => {
    const res = await axios.post('/api/post/' + post.id, {
      comment
    })
    if (!res.data.session) {
      signIn()
      return
    }
    const respond = await res.data
    const sortedComments = respond.comments.sort((a, b) => {
      return new Date(b.createdAt) - new Date(a.createdAt)
    })
    setComments(sortedComments)
    setPosts(res.data.data)
    return
  };

  return (
    <>
      {loading ? <div>Loading...</div> :
        <><div>
          <Post onComment={onComment} onLike={() => { onLike(post.id, posts.id ? posts.liked : post.liked) }} onShare={onShare} liked={posts.id ? posts.liked : post.liked} post={posts.id ? posts : post} user={post.user} />
        </div><div>
            <Comments comments={comments} user={comments.user} />
            <CommentForm onSubmit={onSubmit} user={prismaUser} />
          </div></>
      }
    </>
  )
}
//use getStaticPaths
export async function getStaticPaths() {
  // const posts = await prisma.post.findMany()
  // const paths = posts.map((post) => ({
  //   params: { id: post.id.toString() },
  // }))
  // return { paths, fallback: false }
  return {
    paths: [],
    fallback: "blocking"
  }
}

export async function getStaticProps({ params }) {
  const post = await prisma.post.findUnique({
    where: {
      id: Number(params.id)
    },
    include: {
      user: true
    }
  })
  return {
    props: {
      post: JSON.parse(JSON.stringify(post))
    }
  }
}
