import { unstable_getServerSession } from "next-auth/next";
import { authOptions } from '../auth/[...nextauth]'
import { prisma } from '../../../server/db/client'

async function post(req, res) {
    const session = await unstable_getServerSession(req, res, authOptions)
    if (!session) {
        res.status(201).json({ session })
        return
    }

    const prismaUser = await prisma.user.findUnique({
        where: {
            email: session.user.email
        }
    })
    if (!prismaUser) {
        res.status(401).json({ message: "Not authorized" })
        return
    }
    const { id, liked } = req.body
    const data = await prisma.post.update(
        {
            where: {
                id: Number(id)
            },
            include: {
                user: true,
                comments: true,
                likes: true
            },
            data: {
                liked: !liked,
                totalLikes: liked ? {
                    decrement: 1
                } : {
                    increment: 1
                },
                likes: {
                    upsert: {
                        where: {
                            userId: prismaUser.id
                        },
                        update: {
                            liked: !liked
                        },
                        create: {
                            userId: prismaUser.id,
                            liked: true
                        }
                    }
                }
            },
        })
    const post = await prisma.post.findMany(
        {
            include: {
                user: true,
                comments: true,
                likes: true
            }
        }
    )
    console.log(post)
    res.status(200).json({ post, session })
    return
}

export default async function handler(req, res) {
    const { method } = req
    switch (method) {
        case 'POST':
            post(req, res)
            break
        case 'GET':
            getCommentByPostId(req, res)
            break
        default:
            res.setHeader('Allow', ['GET', 'POST'])
            res.status(405).end(`Method ${method} Not Allowed`)
    }
}

