import prisma from '../../../lib/prisma';

// POST /api/post
// Required fields in body: title
// Optional fields in body: content
export default async function handler(req, res) {
	console.log('Endpoint hit');

	const { title, content } = req.body;

	// find the userId in the database so can provide authorId to post
	const authorId = await prisma.user.findUnique({
		where: { email: req.body.userEmail },
		select: { id: true },
	});

	const result = await prisma.post.create({
		data: {
			title: title,
			content: content,
			authorId: authorId.id, // pass only id property, not whole object
		},
	});
	res.json(result);
}
