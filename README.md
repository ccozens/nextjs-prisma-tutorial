# Local events

## Tech stack

Next.js as the React framework
Next.js API routes for server-side API routes as the backend
Prisma as the ORM for migrations and database access
PostgreSQL as the database
NextAuth.js for authentication via GitHub (OAuth)
TypeScript as the programming language
Vercel for deployment

## Process

I decided to work in PostgreSQL and Prisma, with some react, then found a [NextJS-Prisma-Postgres](https://vercel.com/guides/nextjs-prisma-postgres) walkthrough from Vercel and decided it was too perfect not to follow.

Note the prerequisitis list a PostgresQL database and link to setting up a [free PSQL database on Supabase](https://dev.to/prisma/set-up-a-free-postgresql-database-on-supabase-to-use-with-prisma-3pk6), so I followed steps 1-3 or linked tutorial), with following specifics/modifications:

1. I created a new organization when prompted (called 'Chris' as its my name).
2. Project name 'Local events'
3. Auto-generated a password and stored it in `.env` as `SUPABASE_PWD`
4. Changed region to `West EU (London)` (I'm based in Leicester, UK).
5. Went to settings -> database -> Connection string -> URI and pasted into `DATABASE_URL` in `.env`, updating [YOUR_PASSWORD] section with password from (3)

## Actual project
I use [OhMyZSH](ohmyz.sh) and after some time, I looked up why I couldn't create filenames with square brackets. As explained [here](https://www.bitsy.ai/zsh-no-matches-found/), its because ohmyzsh interprets [] as a pattern to match, so commands like `touch pages/api/post/[id].ts` need the square brackets escaping `touch pages/api/post/\[id].ts`.
### Setup

1. Bootstrap project: `npx create-next-app --example https://github.com/prisma/blogr-nextjs-prisma/tree/main local_events`
2. Start writing this readme
3. Create github repo: `gh repo create`:

```shell
   gh repo create
? What would you like to do? Push an existing local repository to GitHub
? Path to local repository .
? Repository name local_events
? Description local_events
? Visibility Public
✓ Created repository ccozens/local_events on GitHub
? Add a remote? Yes
? What should the new remote be called? origin
✓ Added remote git@github.com:ccozens/local_events.git
? Would you like to push commits from the current branch to "origin"? Yes
Enter passphrase for key '/Users/learning/.ssh/id_ed25519':
Enumerating objects: 17, done.
Counting objects: 100% (17/17), done.
Delta compression using up to 8 threads
Compressing objects: 100% (15/15), done.
Writing objects: 100% (17/17), 25.08 KiB | 5.01 MiB/s, done.
Total 17 (delta 0), reused 0 (delta 0), pack-reused 0
To github.com:ccozens/local_events.git
 * [new branch]      HEAD -> main
branch 'main' set up to track 'origin/main'.
✓ Pushed commits to git@github.com:ccozens/local_events.git
```

### Prisma

4. Install prisma: `npm install prisma --save-dev`
5. Initiate prisma: `npx prisma init`
6. Update `prisma/schema.prisma` with provided code:

```javascript
// schema.prisma
datasource db {
provider = "postgresql"
url      = env("DATABASE_URL")
}

generator client {
provider = "prisma-client-js"
}

model Post {
id String @default(cuid()) @id
title String
content String?
published Boolean @default(false)
author User? @relation(fields: [authorId], references: [id])
authorId String?
}

model User {
id String @default(cuid()) @id
name String?
email String? @unique
createdAt DateTime @default(now()) @map(name: "created_at")
updatedAt DateTime @updatedAt @map(name: "updated_at")
posts Post[]
@@map(name: "users")
}
```

7. Push this config to prisma to create tables in DB: `npx prisma db push`
8. Open prisma studio to add dummy data: `npx prisma studio`
9. Add dummy data (see `lib/dummyDataChat` for ChatGPT data gen)
10. Install and generate Prisma Client `npm install @prisma/client`
11. `npx prisma generate` to tailed client to my Prisma schema: reminder to self that need to re-run every time update schema.
12. Create PrismaClient instance that can be imported wherever necessary: `mkdir lib && touch lib/prisma.ts`

### Update views to add data from db

13. import prisma into `index.tsx`. Your prisma instance will be your interface to the database when you want to read and write data in it. You can for example create a new User record by calling `prisma.user.create()` or retrieve all the Post records from the database with `prisma.post.findMany()`. For an overview of the full Prisma Client API, visit the [Prisma docs](https://www.prisma.io/docs/concepts/components/prisma-client/crud).
14. replace the hardcoded feed object in getStaticProps inside index.tsx with a proper call to the database:

```typescript
// index.tsx
export const getStaticProps: GetStaticProps = async () => {
	const feed = await prisma.post.findMany({
		where: { published: true },
		include: {
			author: {
				select: { name: true },
			},
		},
	});
	return {
		props: { feed },
		revalidate: 10,
	};
};
```

15. Update `/pages/p/[id].tsx`:

```typescript
// extant imports
import prisma from '../../lib/prisma';
// ...
// find specific post by id
export const getServerSideProps: GetServerSideProps = async ({
	params,
}) => {
	const post = await prisma.post.findUnique({
		where: {
			id: String(params?.id),
		},
		include: {
			author: {
				select: { name: true },
			},
		},
	});
	return {
		props: post,
	};
};
```

16. Test!! `num run dev`

### Github auth with NextAuth

17. Update NextJS and react before installing NextAuth. The tutorial says run `npm install next-auth@4 @next-auth/prisma-adapter` -> fails as needs NextJS v12.2.5 || 13, and template installs next@12.0.10.  
    NextJS says run `npm i next@latest react@latest react-dom@latest eslint-config-next@latest` to update. This fails as next@13 doesn't like react < 18.2.0. So:
    first: `npm i react@latest`
    second: `npm i next@latest react@latest react-dom@latest eslint-config-next@latest`
    third: `npm install next-auth@4 @next-auth/prisma-adapter`
    finally check it still works `npm run dev` ....no!

```
Server Error
Error: Invalid <Link> with <a> child. Please remove <a> or use <Link legacyBehavior>.
Learn more: https://nextjs.org/docs/messages/invalid-new-link-with-extra-anchor

This error happened while generating the page. Any console logs will be displayed in the terminal window.
```

Sad times. Follow the link and it suggests `npx @next/codemod new-link . --force` to update <a> to <Link> (note `--force` is because I have un-commited changes). Now it works

18. Update `schema.prisma` - see [NextAuth.js docs](https://next-auth.js.org/schemas/models) for details

```typescript
// schema.prisma

model Post {
  id        String  @id @default(cuid())
  title     String
  content   String?
  published Boolean @default(false)
  author    User?@relation(fields:[authorId], references:[id])
  authorId  String?}

model Account {
  id                 String  @id @default(cuid())
  userId             String  @map("user_id")
  type               String
  provider           String
  providerAccountId  String  @map("provider_account_id")
  refresh_token      String?
  access_token       String?
  expires_at         Int?
  token_type         String?
  scope              String?
  id_token           String?
  session_state      String?
  oauth_token_secret String?
  oauth_token        String?

  user User @relation(fields:[userId], references:[id], onDelete: Cascade)

  @@unique([provider, providerAccountId])}

model Session {
  id           String   @id @default(cuid())
  sessionToken String   @unique@map("session_token")
  userId       String   @map("user_id")
  expires      DateTime
  user         User     @relation(fields:[userId], references:[id], onDelete: Cascade)}

model User {
  id            String    @id @default(cuid())
  name          String?
  email         String?@unique
  emailVerified DateTime?
  image         String?
  posts         Post[]
  accounts      Account[]
  sessions      Session[]}

model VerificationToken {
  id         Int      @id @default(autoincrement())
  identifier String
  token      String   @unique
  expires    DateTime

  @@unique([identifier, token])}
}
```

19. rerun `npx prisma db push` - had to delete data in table first
20. Create a new [OAuth app on GitHub](https://docs.github.com/en/apps/oauth-apps/building-oauth-apps). Login to GitHub, then Settings -> Developer Settings -> OAuth Apps. Note the Authorization callback URL is `http://localhost:3000/api/auth`, meaning a new app will need to be registered when deploying app, with a different URL.
21. Update `.env` with `GITHUB_ID` = Client ID, `GITHUB_SECRET` = hit `Generate a new client secret` and copy paste from the new GitHub OAuth page, and add `NEXTAUTH_URL=http://localhost:3000/api/auth`
22. Update `_app.tsx` so that a user's authentication state persists across the entire application:
    first add `import { SessionProvider } from 'next-auth/react';` to the imports
    then wrap the Component in <SessionProvider>:

```typescript
// _app.tsx

import { SessionProvider } from 'next-auth/react';
import { AppProps } from 'next/app';

const App = ({ Component, pageProps }: AppProps) => {
	return (
		<SessionProvider session={pageProps.session}>
			<Component {...pageProps} />
		</SessionProvider>
	);
};

export default App;
```

### Add login functionality

23. Update Header.tsx as shown and login button now shows. However, login button does not work as NextAuth.js requires you to set up a specific route for authentication.
24. Create `pages/api/auth/[...nextauth.js]` ( `mkdir -p pages/api/auth && touch pages/api/auth/[...nextauth].ts`).
25. Add [boilerplate to configure NextAuth.js setup](https://next-auth.js.org/configuration/pages) with GitHub OAuth credentials and Prisma adaptor:

```typescript
// pages/api/auth/[...nextauth].ts

import { NextApiHandler } from 'next';
import NextAuth from 'next-auth';
import { PrismaAdapter } from '@next-auth/prisma-adapter';
import GitHubProvider from 'next-auth/providers/github';
import prisma from '../../../lib/prisma';

const authHandler: NextApiHandler = (req, res) =>
	NextAuth(req, res, options);
export default authHandler;

const options = {
	providers: [
		GitHubProvider({
			clientId: process.env.GITHUB_ID,
			clientSecret: process.env.GITHUB_SECRET,
		}),
	],
	adapter: PrismaAdapter(prisma),
	secret: process.env.SECRET,
};
```

26. Login now works! Clicking login at home page forwards to github, and returns a logged in screen with username and email address displayed, and buttons for New post and Logout.

### Add new post functionality

27. The `new post` button automatically forwards to `/create` but this doesn't exist yet. So, create it: `touch pages/create.tsx` and add provided code. Compose page now loads up but doesn't work as neither `api/post` nor `/drafts` route exist.
28. [Next.js API routes feature](https://nextjs.org/docs/api-routes/introduction) means any file within `/pages/api` is treated as an API endpoint instead of a page. So, create: `mkdir -p pages/api/post && touch pages/api/post/index.ts` and enter provided code to update the API route to modify the database using the Prisma Client.
    --> at this point, tutorial says it should add new post to prisma and fail to load drafts page. My post functionality fails.
    **FIX**
    The problem was `index.ts` was returning null for the user email, and in any case post does not accept a user email but needs an authorId. So, I amended both `create.tsx` and `index.ts`

    1. I updated `create.tsx` to include the user email in the post request:

    ```typescript
    const session = await getSession();
    const userEmail = session.user.email;

    const body = { title, content, userEmail };
    ```

    2. I updated `index.ts` to look up the authorId from the email address and include in the prisma.post.create call:

    ```typescript
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
    ```

<details>
    <summary>Full code</summary>

```typescript
// create.tsx
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
```

```typescript
// index.ts
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
```

</details>
    


### Add drafts functionality

29. Drafts page cannot be statically rendered because it depends on a user who is authenticated. Pages like this that get their data dynamically based on an authenticated users are a great use case for server-side rendering (SSR) via getServerSideProps. Create a page: `touch pages/drafts.tsx` and add provided code.
    --> works and shows drafts added manually on prisma client. Again, cannot create as create.tsx throws error.

### Add publish functionality

30. This functionality will be implemented in the post detail view that currently lives in `pages/p/[id].tsx`, by sending a HTTP PUT request to `api/publish`. First, create the route: `mkdir -p pages/api/publish && touch pages/api/publish/[id].ts`
31. Second, add code:

```typescript
// pages/api/publish/[id].ts

import prisma from '../../../lib/prisma';

// PUT /api/publish/:id
export default async function handle(req, res) {
	const postId = req.query.id;
	const post = await prisma.post.update({
		where: { id: postId },
		data: { published: true },
	});
	res.json(post);
}
```

32. Implement in frontend (`pages/p/[id].tsx`). Update with provided code that adds a Publish button and implements PUT request as long as user authenticated.

<details>
    <summary>updated pages code</summary>

```typescript
// pages/p/[id].tsx

import React from 'react';
import { GetServerSideProps } from 'next';
import ReactMarkdown from 'react-markdown';
import Router from 'next/router';
import Layout from '../../components/Layout';
import { PostProps } from '../../components/Post';
import { useSession } from 'next-auth/react';
import prisma from '../../lib/prisma';

export const getServerSideProps: GetServerSideProps = async ({
	params,
}) => {
	const post = await prisma.post.findUnique({
		where: {
			id: String(params?.id),
		},
		include: {
			author: {
				select: { name: true, email: true },
			},
		},
	});
	return {
		props: post,
	};
};

async function publishPost(id: string): Promise<void> {
	await fetch(`/api/publish/${id}`, {
		method: 'PUT',
	});
	await Router.push('/');
}

const Post: React.FC<PostProps> = (props) => {
	const { data: session, status } = useSession();
	if (status === 'loading') {
		return <div>Authenticating ...</div>;
	}
	const userHasValidSession = Boolean(session);
	const postBelongsToUser =
		session?.user?.email === props.author?.email;
	let title = props.title;
	if (!props.published) {
		title = `${title} (Draft)`;
	}

	return (
		<Layout>
			<div>
				<h2>{title}</h2>
				<p>By {props?.author?.name || 'Unknown author'}</p>
				<ReactMarkdown children={props.content} />
				{!props.published &&
					userHasValidSession &&
					postBelongsToUser && (
						<button onClick={() => publishPost(props.id)}>
							Publish
						</button>
					)}
			</div>
			<style jsx>{`
				.page {
					background: var(--geist-background);
					padding: 2rem;
				}

				.actions {
					margin-top: 2rem;
				}

				button {
					background: #ececec;
					border: 0;
					border-radius: 0.125rem;
					padding: 1rem 2rem;
				}

				button + button {
					margin-left: 1rem;
				}
			`}</style>
		</Layout>
	);
};

export default Post;
```

</details>

--> this didn't work for me until I added [NEXTAUTH_SECRET](https://next-auth.js.org/configuration/options#secret) to `.env`. I generated as they suggest (`openssl rand -base64 32`).


Note from tutorial:
NoteOnce the app is deployed to production, the feed will be updated at most every 10 seconds when it receives a request. That's because you're using static site generation (SSG) via getStaticProps to retrieve the data for this view with [Incremental Static Regeneration](https://vercel.com/docs/basic-features/data-fetching/incremental-static-regeneration). If you want data to be updated "immediately", consider using [On-Demand Incremental Static Regeneration](https://vercel.com/docs/concepts/incremental-static-regeneration/quickstart).


### Add delete functionality

33.  Create new `[id].ts`  in post folder: `touch pages/api/post/[id].ts`.
34.  Add following:

```typescript
// pages/api/post/[id].ts

import prisma from '../../../lib/prisma';

// DELETE /api/post/:id
export default async function handle(req, res) {
  const postId = req.query.id;
  if (req.method === 'DELETE') {
    const post = await prisma.post.delete({
      where: { id: postId },
    });
    res.json(post);
  } else {
    throw new Error(
      `The HTTP ${req.method} method is not supported at this route.`,
    );
  }
}
```


1.   Add the following to `pages/p/[id].tsx` below `publishPost`:

```typescript
// pages/p/[id].tsx

async function deletePost(id: string): Promise<void> {
  await fetch(`/api/post/${id}`, {
    method: 'DELETE',
  });
  Router.push('/');
}
```


36.  Add delete button to `pages/p/[id].tsx` below the Publish button:

```typescript
// pages/p/[id].tsx
{
  !props.published && userHasValidSession && postBelongsToUser && (
    <button onClick={() => publishPost(props.id)}>Publish</button>
  );
}
{
  userHasValidSession && postBelongsToUser && (
    <button onClick={() => deletePost(props.id)}>Delete</button>
  );
}
```


### Deploy to Vercel
37. 