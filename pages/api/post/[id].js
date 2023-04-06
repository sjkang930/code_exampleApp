import { unstable_getServerSession } from 'next-auth'
import { prisma } from '../../../server/db/client'
import { authOptions } from '../auth/[...nextauth]'
//update post with comments
const updatePostComments = async (req, res) => {
    const session = await unstable_getServerSession(req, res, authOptions)
    if (!session) {
        res.status(200).json({ session })
        return
    }
    //print session data
    const prismaUser = await prisma.user.findUnique({
        where: {
            email: session.user.email
        }
    })
    if (!prismaUser) {
        res.status(401).json({ message: "Not authorized" })
        return
    }

    const { id } = req.query
    const { comment } = req.body
    const data = await prisma.post.update(
        {
            where: {
                id: Number(id)
            },
            data: {
                totalComments: {
                    increment: 1
                },
                comments: {
                    create: {
                        comment,
                        userId: prismaUser.id
                    }
                }
            },
            include: {
                user: true,
                comments: true
            }
        }
    )
    const comments = await prisma.comment.findMany(
        {
            where: {
                postId: Number(id)
            },
            include: {
                user: true
            }
        }
    )
    res.status(200).json({ comments, data, session })
}

const getCommentByPostId = async (req, res) => {
    const session = await unstable_getServerSession(req, res, authOptions)
    const { id } = req.query
    const data = await prisma.comment.findMany(
        {
            where: {
                postId: Number(id)
            },
            include: {
                user: true
            }
        }
    )
    if (!session) {
        const prismaUser = {}
        res.status(200).json({ prismaUser, data })
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
    res.status(200).json({ data, prismaUser })
}

export default async function handle(req, res) {
    const { method } = req

    switch (method) {
        case 'POST':
            updatePostComments(req, res)
            break
        //get all comments
        case 'GET':
            getCommentByPostId(req, res)
            break
        default:
            res.setHeader('Allow', ['GET', 'POST'])
            res.status(405).end(`Method ${method} Not Allowed`)
    }
}
