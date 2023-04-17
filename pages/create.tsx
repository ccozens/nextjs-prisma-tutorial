import React, { useState } from 'react';
import Layout from '../components/Layout';
import Router from 'next/router';
import { getSession } from 'next-auth/react';
import Link from 'next/link';

const Draft: React.FC = () => {
	const [title, setTitle] = useState('');
	const [content, setContent] = useState('');

	const submitData = async (e: React.SyntheticEvent) => {
		e.preventDefault();
		// Call your API route to create a post.
		try {
			const session = await getSession();
			const userEmail = session.user.email;

			const body = { title, content, userEmail };
			await fetch('/api/post', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify(body),
			});
			await Router.push('/drafts');
		} catch (error) {
			console.error(error);
		}
	};

	return (
		<Layout>
			<div>
				<form onSubmit={submitData}>
					<h1>New Draft</h1>
					<input
						autoFocus
						onChange={(e) => setTitle(e.target.value)}
						placeholder="Title"
						type="text"
						value={title}
					/>
					<textarea
						cols={50}
						onChange={(e) => setContent(e.target.value)}
						placeholder="Content"
						rows={8}
						value={content}
					/>
					<input
						disabled={!content || !title}
						type="submit"
						value="Create"
					/>
					<Link
						className="back"
						href="#"
						onClick={() => Router.back()}>
						or Cancel
					</Link>
				</form>
			</div>

			<style jsx>{`
				.page {
					background: var(--geist-background);
					padding: 3rem;
					display: flex;
					justify-content: center;
					align-items: center;
				}

				input[type='text'],
				textarea {
					width: 100%;
					padding: 0.5rem;
					margin: 0.5rem 0;
					border-radius: 0.25rem;
					border: 0.125rem solid rgba(0, 0, 0, 0.2);
				}

				input[type='submit'] {
					background: #ececec;
					border: 0;
					padding: 1rem 2rem;
				}

				.back {
					margin-left: 1rem;
				}
			`}</style>
		</Layout>
	);
};

export default Draft;
