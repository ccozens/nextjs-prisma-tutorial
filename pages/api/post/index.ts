import { getSession } from 'next-auth/react';
import prisma from '../../../lib/prisma';

// POST /api/post
// Required fields in body: title
// Optional fields in body: content
export default async function handler(req, res) {
	console.log('Endpoint hit');
	const { title, content } = req.body;
	const session = await getSession({ req });
	const result = await prisma.post.create({
		data: {
			title: title,
			content: content,
			author: { connect: { email: session?.user?.email } },
		},
	});
	res.json(result);
}
