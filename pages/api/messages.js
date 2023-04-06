import Pusher from "pusher"

export default function handler(req, res) {
    const { method } = req
    switch (method) {
        case 'POST':
            const { message } = req.body.message

            const pusher = new Pusher({
                appId: "1509357",
                key: "77aaedf9cb6a25d82beb",
                secret: "f4f33a33a93e9ef8f9ee",
                cluster: "us3",
            });

            pusher.trigger("my-channel", "my-event", {
                id: Math.random(),
                message
            });
            res.status(200).json({ message })
            break
        default:
            res.status(400).json({ message: "Bad request" })
    }
}