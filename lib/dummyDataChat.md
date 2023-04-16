I am setting up a new postgresql database in supabase. Please generate me 3 users and 4 posts per user that fit the following schema: model Post {
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

Sure! Here are three example users and four posts per user that fit the given schema:

User 1:

Name: John Doe
Email: johndoe@example.com
Posts:
Title: Post 1 by John Doe
Content: This is the first post by John Doe.
Published: true
Title: Post 2 by John Doe
Content: This is the second post by John Doe.
Published: false
Title: Post 3 by John Doe
Content: This is the third post by John Doe.
Published: true
Title: Post 4 by John Doe
Content: This is the fourth post by John Doe.
Published: false
User 2:

Name: Jane Smith
Email: janesmith@example.com
Posts:
Title: Post 1 by Jane Smith
Content: This is the first post by Jane Smith.
Published: true
Title: Post 2 by Jane Smith
Content: This is the second post by Jane Smith.
Published: false
Title: Post 3 by Jane Smith
Content: This is the third post by Jane Smith.
Published: true
Title: Post 4 by Jane Smith
Content: This is the fourth post by Jane Smith.
Published: false
User 3:

Name: Mark Johnson
Email: markjohnson@example.com
Posts:
Title: Post 1 by Mark Johnson
Content: This is the first post by Mark Johnson.
Published: true
Title: Post 2 by Mark Johnson
Content: This is the second post by Mark Johnson.
Published: false
Title: Post 3 by Mark Johnson
Content: This is the third post by Mark Johnson.
Published: true
Title: Post 4 by Mark Johnson
Content: This is the fourth post by Mark Johnson.
Published: false



Chris Cozens
Please update the post content to contain a unique motivational quote for each post, with a 2-word title summarising the quote
Sure! Here are the updated users and posts with unique motivational quotes for each post, along with 2-word titles summarizing the quotes:

User 1:

Name: John Doe
Email: johndoe@example.com
Posts:
Title: "Dream Big"
Content: "The future belongs to those who believe in the beauty of their dreams." - Eleanor Roosevelt
Published: true
Title: "Never Give Up"
Content: "The only way to do great work is to love what you do and never give up." - Steve Jobs
Published: false
Title: "Rise Higher"
Content: "The harder you work for something, the greater you'll feel when you achieve it." - Unknown
Published: true
Title: "Be Fearless"
Content: "In the middle of every difficulty lies opportunity." - Albert Einstein
Published: false
User 2:

Name: Jane Smith
Email: janesmith@example.com
Posts:
Title: "Embrace Change"
Content: "Change is the only constant in life. Embrace it and grow." - Unknown
Published: true
Title: "Stay Focused"
Content: "Stay focused, stay positive, and keep moving forward." - Unknown
Published: false
Title: "Believe in Yourself"
Content: "Believe in yourself and all that you are. Know that there is something inside you that is greater than any obstacle." - Christian D. Larson
Published: true
Title: "Keep Learning"
Content: "The more you learn, the more you earn." - Warren Buffett
Published: false
User 3:

Name: Mark Johnson
Email: markjohnson@example.com
Posts:
Title: "Take Action"
Content: "The future depends on what you do today." - Mahatma Gandhi
Published: true
Title: "Stay Positive"
Content: "Positive thinking will let you do everything better than negative thinking will." - Zig Ziglar
Published: false
Title: "Never Stop Trying"
Content: "Success is walking from failure to failure with no loss of enthusiasm." - Winston Churchill
Published: true
Title: "Dream Achieve"
Content: "Dream big and dare to fail." - Norman Vaughan
Published: false




