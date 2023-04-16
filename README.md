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
export const getServerSideProps: GetServerSideProps = async ({ params }) => {
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

17. Update NextJS and react before installing NextAuth.  The tutorial says run `npm install next-auth@4 @next-auth/prisma-adapter` -> fails as needs NextJS v12.2.5 || 13, and template installs next@12.0.10.  
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

18. Update `schema.prisma`

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

19. rerun `npx prisma db push`
20. 