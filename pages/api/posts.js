// pages/api/posts.js
import { unstable_getServerSession } from 'next-auth'
import { prisma } from '../../server/db/client'
import { authOptions } from './auth/[...nextauth]'

const titleFromCode = (code) => {
  return code.trim().split('\n')[0].replace('//', '')
}

async function post(req, res) {
  const session = await unstable_getServerSession(req, res, authOptions)
  if (!session) {
    res.status(201).json({ session})
    return
  }
  // //print session data
  const prismaUser = await prisma.user.findUnique({
    where: {
      email: session.user.email
    }
  })
  if (!prismaUser) {
    res.status(401).json({ message: "Not authorized" })
    return
  }
  // console.log("session", session.user)
  const { code, language } = req.body
  const title = titleFromCode(code)
  // use prisma to create a new post using that data
  const post = await prisma.post.create({
    data: {
      title,
      code,
      language,
      userId: prismaUser.id
    }
  })
  // send the post object back to the client
  res.status(201).json({post, session})
}

export default async function handle(req, res) {
  const { method } = req

  switch (method) {
    case 'POST':
      post(req, res)
      break
    //get all posts
    case 'GET':
      const data = await prisma.post.findMany(
        {
          include: {
            user: true
          }
        }
      )
      res.status(200).json(data)
      break
    default:
      res.setHeader('Allow', ['GET', 'POST'])
      res.status(405).end(`Method ${method} Not Allowed`)
  }
}