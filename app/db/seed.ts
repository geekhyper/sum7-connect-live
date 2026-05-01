import { getDb } from "../api/queries/connection";
import { users, posts, likes, comments, follows, notifications, conversations, messages } from "./schema";
import bcrypt from "bcryptjs";

async function seed() {
  const db = getDb();
  console.log("Seeding database...");

  // Clear existing data
  await db.delete(messages);
  await db.delete(conversations);
  await db.delete(notifications);
  await db.delete(comments);
  await db.delete(likes);
  await db.delete(posts);
  await db.delete(follows);
  await db.delete(users);

  // Create demo users
  const passwordHash = await bcrypt.hash("password123", 10);

  const demoUsers = [
    {
      email: "sarah@example.com",
      passwordHash,
      fullName: "Sarah Chen",
      username: "sarahchen",
      phone: "+1-555-0101",
      gender: "female" as const,
      country: "United States",
      avatarUrl: "https://api.dicebear.com/7.x/avataaars/svg?seed=sarahchen",
      bio: "Coffee lover & traveler. Living my best life! ☕✈️",
      followersCount: 234,
      followingCount: 156,
      postsCount: 3,
      isOnline: true,
    },
    {
      email: "jake@example.com",
      passwordHash,
      fullName: "Jake Morrison",
      username: "jakemorrison",
      phone: "+1-555-0102",
      gender: "male" as const,
      country: "United Kingdom",
      avatarUrl: "https://api.dicebear.com/7.x/avataaars/svg?seed=jakemorrison",
      bio: "Photographer & adventurer. Capturing moments 📸",
      followersCount: 567,
      followingCount: 234,
      postsCount: 2,
      isOnline: true,
    },
    {
      email: "emma@example.com",
      passwordHash,
      fullName: "Emma Wilson",
      username: "emmawilson",
      phone: "+1-555-0103",
      gender: "female" as const,
      country: "Australia",
      avatarUrl: "https://api.dicebear.com/7.x/avataaars/svg?seed=emmawilson",
      bio: "Foodie & fitness enthusiast. Healthy living 🥑🏃‍♀️",
      followersCount: 891,
      followingCount: 445,
      postsCount: 2,
      isOnline: false,
    },
    {
      email: "alex@example.com",
      passwordHash,
      fullName: "Alex Rivera",
      username: "alexrivera",
      phone: "+1-555-0104",
      gender: "male" as const,
      country: "Spain",
      avatarUrl: "https://api.dicebear.com/7.x/avataaars/svg?seed=alexrivera",
      bio: "Music producer & DJ. Life is a beat 🎵",
      followersCount: 1203,
      followingCount: 678,
      postsCount: 2,
      isOnline: true,
    },
    {
      email: "luna@example.com",
      passwordHash,
      fullName: "Luna Park",
      username: "lunapark",
      phone: "+1-555-0105",
      gender: "female" as const,
      country: "South Korea",
      avatarUrl: "https://api.dicebear.com/7.x/avataaars/svg?seed=lunapark",
      bio: "Artist & dreamer. Creating beauty every day 🎨",
      followersCount: 345,
      followingCount: 289,
      postsCount: 0,
      isOnline: false,
    },
    {
      email: "marcus@example.com",
      passwordHash,
      fullName: "Marcus Johnson",
      username: "marcusj",
      phone: "+1-555-0106",
      gender: "male" as const,
      country: "Canada",
      avatarUrl: "https://api.dicebear.com/7.x/avataaars/svg?seed=marcusj",
      bio: "Tech geek & gamer. Always coding 💻🎮",
      followersCount: 678,
      followingCount: 412,
      postsCount: 0,
      isOnline: true,
    },
    {
      email: "mia@example.com",
      passwordHash,
      fullName: "Mia Thompson",
      username: "miathompson",
      phone: "+1-555-0107",
      gender: "female" as const,
      country: "France",
      avatarUrl: "https://api.dicebear.com/7.x/avataaars/svg?seed=miathompson",
      bio: "Fashion blogger. Style is everything 👗✨",
      followersCount: 1567,
      followingCount: 890,
      postsCount: 0,
      isOnline: false,
    },
  ];

  const insertedUsers = [];
  for (const user of demoUsers) {
    const result = await db.insert(users).values(user);
    insertedUsers.push({ id: Number(result[0].insertId), ...user });
  }
  console.log(`Created ${insertedUsers.length} demo users`);

  // Create demo posts
  const demoPosts = [
    {
      userId: insertedUsers[0].id,
      caption: "Sunday morning vibes at my favorite coffee spot ☕ #coffee #weekend",
      mediaUrl: "/posts/post1.jpg",
      mediaType: "image" as const,
      likesCount: 128,
      commentsCount: 23,
    },
    {
      userId: insertedUsers[1].id,
      caption: "Chasing sunsets and making memories 🌅 #travel #beachlife",
      mediaUrl: "/posts/post2.jpg",
      mediaType: "image" as const,
      likesCount: 256,
      commentsCount: 45,
    },
    {
      userId: insertedUsers[1].id,
      caption: "City lights and late nights 🌃 #urban #nightlife",
      mediaUrl: "/posts/post3.jpg",
      mediaType: "image" as const,
      likesCount: 189,
      commentsCount: 34,
    },
    {
      userId: insertedUsers[2].id,
      caption: "Brunch goals! This avocado toast is everything 🥑 #foodie #brunch",
      mediaUrl: "/posts/post4.jpg",
      mediaType: "image" as const,
      likesCount: 342,
      commentsCount: 56,
    },
    {
      userId: insertedUsers[2].id,
      caption: "The view from the top is always worth the climb 🏔️ #hiking #adventure",
      mediaUrl: "/posts/post5.jpg",
      mediaType: "image" as const,
      likesCount: 567,
      commentsCount: 89,
    },
    {
      userId: insertedUsers[0].id,
      caption: "My fur baby keeping me company on lazy Sundays 🐱 #catsofinstagram",
      mediaUrl: "/posts/post6.jpg",
      mediaType: "image" as const,
      likesCount: 445,
      commentsCount: 67,
    },
    {
      userId: insertedUsers[3].id,
      caption: "Street style vibes. Keep it casual, keep it real 🧢 #streetwear",
      mediaUrl: "/posts/post7.jpg",
      mediaType: "image" as const,
      likesCount: 234,
      commentsCount: 43,
    },
    {
      userId: insertedUsers[3].id,
      caption: "My creative corner. Where the magic happens 💻 #workspace #setup",
      mediaUrl: "/posts/post8.jpg",
      mediaType: "image" as const,
      likesCount: 678,
      commentsCount: 112,
    },
    {
      userId: insertedUsers[0].id,
      caption: "Last night's concert was absolutely incredible! 🎸🎉 #livemusic",
      mediaUrl: "/posts/post9.jpg",
      mediaType: "image" as const,
      likesCount: 890,
      commentsCount: 156,
    },
  ];

  const insertedPosts = [];
  for (const post of demoPosts) {
    const result = await db.insert(posts).values(post);
    insertedPosts.push({ id: Number(result[0].insertId), ...post });
  }
  console.log(`Created ${insertedPosts.length} demo posts`);

  // Create demo likes
  for (let i = 0; i < insertedPosts.length; i++) {
    const post = insertedPosts[i];
    const likerIds = insertedUsers.filter(u => u.id !== post.userId).slice(0, 3);
    for (const liker of likerIds) {
      await db.insert(likes).values({
        userId: liker.id,
        postId: post.id,
      });
    }
  }
  console.log("Created demo likes");

  // Create demo comments
  const commentTexts = [
    "This is amazing! 🔥",
    "Love this! ❤️",
    "So beautiful! 😍",
    "Great shot! 📸",
    "Absolutely stunning! ✨",
  ];

  for (const post of insertedPosts) {
    const commenters = insertedUsers.filter(u => u.id !== post.userId).slice(0, 2);
    for (const commenter of commenters) {
      await db.insert(comments).values({
        userId: commenter.id,
        postId: post.id,
        text: commentTexts[Math.floor(Math.random() * commentTexts.length)],
      });
    }
  }
  console.log("Created demo comments");

  // Create demo follows
  for (let i = 0; i < insertedUsers.length; i++) {
    for (let j = 0; j < insertedUsers.length; j++) {
      if (i !== j && Math.random() > 0.3) {
        try {
          await db.insert(follows).values({
            followerId: insertedUsers[i].id,
            followingId: insertedUsers[j].id,
          });
        } catch {
          // Ignore duplicate follows
        }
      }
    }
  }
  console.log("Created demo follows");

  // Create demo notifications
  for (const post of insertedPosts.slice(0, 5)) {
    const actor = insertedUsers.find(u => u.id !== post.userId);
    if (actor) {
      await db.insert(notifications).values({
        userId: post.userId,
        actorId: actor.id,
        type: "like",
        referenceId: post.id,
      });
    }
  }
  console.log("Created demo notifications");

  // Create demo conversations and messages
  for (let i = 0; i < 3; i++) {
    const user1 = insertedUsers[i];
    const user2 = insertedUsers[i + 1];
    
    const convResult = await db.insert(conversations).values({
      user1Id: user1.id,
      user2Id: user2.id,
      lastMessage: `Hey ${user2.fullName.split(" ")[0]}! How are you doing?`,
      unreadCount1: 0,
      unreadCount2: 1,
    });

    const convId = Number(convResult[0].insertId);

    // Insert messages
    await db.insert(messages).values({
      roomId: convId,
      senderId: user1.id,
      content: `Hey ${user2.fullName.split(" ")[0]}! How are you doing?`,
    });

    await db.insert(messages).values({
      roomId: convId,
      senderId: user2.id,
      content: "Hey! I'm doing great, thanks for asking! How about you?",
    });

    await db.insert(messages).values({
      roomId: convId,
      senderId: user1.id,
      content: "Pretty good! Just working on some new projects. Want to catch up soon?",
    });
  }
  console.log("Created demo conversations and messages");

  console.log("Seeding complete!");
}

seed().catch(console.error);
