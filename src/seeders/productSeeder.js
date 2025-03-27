const mongoose = require("mongoose");
const {
  Assessment,
  AudioComic,
  Comic,
  Podcast,
  Workshop,
  MentoonsCard,
  MentoonsBook,
} = require("../models/product");
const { AgeCategory, ProductType, CardType } = require("../utils/enum"); // Added CardType to imports

const seedProducts = async () => {
  try {
    // Clear existing data
    await mongoose.connection.dropCollection("products");

    // Create Comics
    const comics = await Comic.create([
      {
        title: "The Amazing Adventures",
        description: "A thrilling comic about superhero adventures",
        price: 1,
        ageCategory: AgeCategory.TEEN,
        tags: ["superhero", "action", "adventure"],
        rating: 4.5,
        proudctImage: [
          {
            imageUrl: "podcast-cover.jpg",
          },
        ],
        productVideo: [
          {
            videoUrl: "podcast-video",
          },
        ],
        details: {
          pages: 32,
          author: "John Smith",
          publisher: "Marvel Comics",
          language: "en",
          releaseDate: new Date("2024-01-15"),
          series: "Amazing Adventures",
        },
      },
      {
        title: "Mystery Manor",
        description: "A spooky comic series",
        price: 1,
        ageCategory: AgeCategory.YOUNG_ADULT,
        tags: ["mystery", "horror", "suspense"],
        rating: 4.5,
        proudctImage: [
          {
            imageUrl: "podcast-cover.jpg",
          },
        ],
        productVideo: [
          {
            videoUrl: "podcast-video",
          },
        ],
        details: {
          pages: 28,
          author: "Sarah Johnson",
          publisher: "DC Comics",
          language: "en",
          releaseDate: new Date("2024-02-01"),
          series: "Mystery Manor",
        },
      },
    ]);

    // Create Audio Comics
    const audioComics = await AudioComic.create([
      {
        title: "Space Explorers: Audio Edition",
        description: "An immersive audio comic experience",
        price: 1,
        ageCategory: AgeCategory.CHILD,
        tags: ["space", "adventure", "audio"],
        details: {
          duration: 45, // minutes
          narrator: "Michael Brooks",
          audioQuality: "high",
          audioFormat: "mp3",
          releaseDate: new Date("2024-01-20"),
        },
      },
    ]);

    // Create Podcasts
    const podcasts = await Podcast.create([
      {
        title: "Tech Talk Weekly",
        description: "Weekly discussions about technology",
        price: 1,
        ageCategory: AgeCategory.ADULT,
        tags: ["technology", "education", "news"],
        rating: 4.5,
        proudctImage: [
          {
            imageUrl: "podcast-cover.jpg",
          },
        ],
        productVideo: [
          {
            videoUrl: "podcast-video",
          },
        ],
        details: {
          episodeNumber: 42,
          guests: ["Jane Doe", "Bob Wilson"],
          season: 2,
          host: "Alex Thompson",
          releaseDate: new Date("2024-02-15"),
          showNotes: "In this episode, we discuss the latest tech trends...",
        },
      },
      // Sample Podcast
      {
        title: "Growing Up Right",
        description: "Educational podcast for teenagers",
        price: 1,
        ageCategory: AgeCategory.TEENAGER,
        type: ProductType.PODCAST,
        tags: ["education", "teenagers", "growth"],
        rating: 4.5,
        proudctImage: [
          {
            imageUrl: "https://example.com/podcast-cover.jpg",
          },
        ],
        productVideo: [
          {
            videoUrl: "https://example.com/podcast-video",
          },
        ],
        isFeatured: true,
        details: {
          episodeNumber: 1,
          host: "Dr. Sarah Johnson",
          releaseDate: new Date("2023-03-01"),
          language: "en",
          duration: 30, // Added the required duration field (in minutes)
          sampleUrl: "https://example.com/podcast-sample.mp3",
        },
      },
    ]);

    // Create Workshops
    const workshops = await Workshop.create([
      {
        title: "Comic Creation Masterclass",
        description: "Learn to create your own comics",
        price: 1,
        ageCategory: AgeCategory.TEEN,
        tags: ["education", "art", "comics"],
        details: {
          instructor: "Emily Chen",
          location: "Online",
          schedule: new Date("2024-03-01T15:00:00Z"),
          duration: 3, // hours
          capacity: 20,
          materials: ["sketchbook", "pencils", "digital tablet"],
        },
      },
    ]);

    // Create Assessments
    const assessments = await Assessment.create([
      {
        title: "Emotional joy",
        description:
          "Explore your emotional well-being, family values, and relationship dynamics. ",
        price: 10,
        ageCategory: AgeCategory.ADULT,
        tags: [
          "emotional well-being",
          "family values",
          "relationship dynamics",
        ],
        details: {
          questions: [
            {
              questionText: "Who created Spider-Man?",
              options: ["Stan Lee", "Bob Kane", "Jack Kirby", "Steve Ditko"],
              correctAnswer: "Stan Lee",
            },
            {
              questionText: "In which year was Marvel Comics founded?",
              options: ["1939", "1945", "1961", "1970"],
              correctAnswer: "1939",
            },
          ],
          passingScore: 70,
          duration: 10, // minutes
          difficulty: "College Students",
        },
      },
      {
        title: "Self Awareness Assessment.",
        description:
          "Discover your current state of mind, self-conduct, family values, willingness to change, and spiritual journey.",
        price: 10,
        ageCategory: AgeCategory.ADULT,
        tags: [
          "emotional well-being",
          "family values",
          "relationship dynamics",
        ],
        details: {
          questions: [
            {
              questionText: "Who created Spider-Man?",
              options: ["Stan Lee", "Bob Kane", "Jack Kirby", "Steve Ditko"],
              correctAnswer: "Stan Lee",
            },
            {
              questionText: "In which year was Marvel Comics founded?",
              options: ["1939", "1945", "1961", "1970"],
              correctAnswer: "1939",
            },
          ],
          passingScore: 70,
          duration: 10, // minutes
          difficulty: "College Students",
        },
      },
      {
        title: "Skills Assessment",
        description:
          "Assess your interpersonal, analytical, and professional skills to enhance your career, communication, and overall growth.",
        price: 10,
        ageCategory: AgeCategory.ADULT,
        tags: [
          "emotional well-being",
          "family values",
          "relationship dynamics",
        ],
        details: {
          questions: [
            {
              questionText: "Who created Spider-Man?",
              options: ["Stan Lee", "Bob Kane", "Jack Kirby", "Steve Ditko"],
              correctAnswer: "Stan Lee",
            },
            {
              questionText: "In which year was Marvel Comics founded?",
              options: ["1939", "1945", "1961", "1970"],
              correctAnswer: "1939",
            },
          ],
          passingScore: 70,
          duration: 15, // minutes
          difficulty: "Individuals from any background",
        },
      },
      {
        title: "Addiction Awareness",
        description:
          "Evaluate your habits and identify areas of addiction, from mobile and social media to gaming, shopping, and substance abuse. ",
        price: 10,
        ageCategory: AgeCategory.ADULT,
        tags: [
          "emotional well-being",
          "family values",
          "relationship dynamics",
        ],
        details: {
          questions: [
            {
              questionText: "Who created Spider-Man?",
              options: ["Stan Lee", "Bob Kane", "Jack Kirby", "Steve Ditko"],
              correctAnswer: "Stan Lee",
            },
            {
              questionText: "In which year was Marvel Comics founded?",
              options: ["1939", "1945", "1961", "1970"],
              correctAnswer: "1939",
            },
          ],
          passingScore: 70,
          duration: 10, // minutes
          difficulty: "College Students",
        },
      },
      {
        title: "Emotional Joy",
        description:
          "Explore your emotional well-being, family values, and relationship dynamics. ",
        price: 10,
        ageCategory: AgeCategory.ADULT,
        tags: [
          "emotional well-being",
          "family values",
          "relationship dynamics",
        ],
        details: {
          questions: [
            {
              questionText: "Who created Spider-Man?",
              options: ["Stan Lee", "Bob Kane", "Jack Kirby", "Steve Ditko"],
              correctAnswer: "Stan Lee",
            },
            {
              questionText: "In which year was Marvel Comics founded?",
              options: ["1939", "1945", "1961", "1970"],
              correctAnswer: "1939",
            },
          ],
          passingScore: 70,
          duration: 10, // minutes
          difficulty: "College Students",
        },
      },
      {
        title: "Emotional Fear",
        description:
          "Discover your current state of mind, self-conduct, family values, willingness to change, and spiritual journey.",
        price: 10,
        ageCategory: AgeCategory.ADULT,
        tags: [
          "emotional well-being",
          "family values",
          "relationship dynamics",
        ],
        details: {
          questions: [
            {
              questionText: "Who created Spider-Man?",
              options: ["Stan Lee", "Bob Kane", "Jack Kirby", "Steve Ditko"],
              correctAnswer: "Stan Lee",
            },
            {
              questionText: "In which year was Marvel Comics founded?",
              options: ["1939", "1945", "1961", "1970"],
              correctAnswer: "1939",
            },
          ],
          passingScore: 70,
          duration: 10, // minutes
          difficulty: "College Students",
        },
      },
    ]);

    // Sample Mentoons Card
    const mentoonsCard = await MentoonsCard.create([
      {
        title: "Conversation Starter Cards (6-12) years",
        description:
          "Discover the power of meaningful conversations with our Conversation Starter Cards. Watch your kids become more expressive, creative, and socially confident.",
        price: 1,
        ageCategory: AgeCategory.CHILD,
        type: ProductType.MENTOONS_CARDS,
        rating: 4.5,
        tags: ["confidence", "motivation"],
        productImages: [
          {
            imageUrl:
              "https://mentoons-products.s3.ap-northeast-1.amazonaws.com/Products/Conversation+Starter+Cards+6-12.png",
          },
        ],
        productVideos: [
          {
            videoUrl:
              "https://mentoons-products.s3.ap-northeast-1.amazonaws.com/user_2pT5VWCnXGfCEDndSUmyLrtIQcz/1733308266572-Conversation+Starter+Cards+6-12+%281%29.mp4",
          },
        ],
        isFeatured: true,
        details: {
          cardType: CardType.CONVERSATION_STARTER_CARDS,
          accentColor: "#F9A411",
          addressedIssues: [
            {
              title: "Low Confidence",
              description: "Building self-confidence through daily activities",
              issueIllustrationUrl:
                "https://mentoons-products.s3.ap-northeast-1.amazonaws.com/Products/low-confidence.png",
            },
            {
              title: "Aggressive Behavior",
              description: "Building self-confidence through daily activities",
              issueIllustrationUrl:
                "https://mentoons-products.s3.ap-northeast-1.amazonaws.com/Products/aggressive-behaviour.png",
            },
            {
              title: "Lack of Communication",
              description: "Building self-confidence through daily activities",
              issueIllustrationUrl:
                "https://mentoons-products.s3.ap-northeast-1.amazonaws.com/Products/lack-of-communication.png",
            },
            {
              title: "Disobiendence",
              description: "Building self-confidence through daily activities",
              issueIllustrationUrl:
                "https://mentoons-products.s3.ap-northeast-1.amazonaws.com/Products/disobidience.png",
            },
          ],
          productDescription: [
            {
              label: "Conversation Starter Cards",
              descriptionList: [
                {
                  description: "Story telling format",
                },
                {
                  description: "Developed by psychologist and educators",
                },
                {
                  description: "Age appropriate content",
                },
                {
                  description: "Beautifully illustrated",
                },
                {
                  description: "Introduction to new vocabulary",
                },
              ],
            },
            {
              label: "How kids will benefit",
              descriptionList: [
                {
                  description: "Learn easily by oldest format of communication",
                },
                {
                  description: "Supports emotional and social growth.",
                },
                {
                  description: "Safe content for kids",
                },
                {
                  description: "Makes learning visually engaging",
                },
                {
                  description: "Expand language skills",
                },
              ],
            },
            {
              label: "How parent will benefits",
              descriptionList: [
                {
                  description: "Helps in genuine friendships",
                },
                {
                  description: "Provides expert-backed guidance",
                },
                {
                  description: "Simplifies age specific guidance",
                },
                {
                  description: "Keeps kids interested and focused",
                },
                {
                  description: "Boosts child's language development",
                },
              ],
            },
          ],
        },
      },

      {
        title: "Conversation Starter Cards (13-16) years",
        description:
          "Encourage meaningful conversations with our Conversation Starter Cards. Designed for teenagers, these cards help build confidence, empathy, and social skills while fostering creativity and self-expression.",
        price: 1,
        ageCategory: AgeCategory.TEEN,
        type: ProductType.MENTOONS_CARDS,
        rating: 4.5,
        tags: ["confidence", "empathy"],
        productImages: [
          {
            imageUrl:
              "https://mentoons-products.s3.ap-northeast-1.amazonaws.com/Products/Conversation+Starter+Cards+13-16.png",
          },
          {
            imageUrl:
              "https://mentoons-products.s3.ap-northeast-1.amazonaws.com/user_2pT5VWCnXGfCEDndSUmyLrtIQcz/1733315009292-Silent%20Stories%20Thumbnail.png",
          },
        ],
        productVideos: [
          {
            videoUrl:
              "https://mentoons-products.s3.ap-northeast-1.amazonaws.com/user_2pT5VWCnXGfCEDndSUmyLrtIQcz/1733480536383-Teen+Camp+Conversation+Starter+Cards.mp4",
          },
        ],
        isFeatured: false,
        details: {
          cardType: CardType.CONVERSATION_STARTER_CARDS,
          accentColor: "#FE4720",
          addressedIssues: [
            {
              title: "Dipression",
              description: "Building self-confidence through daily activities",
              issueIllustrationUrl:
                "https://mentoons-products.s3.ap-northeast-1.amazonaws.com/Products/dipression.png",
            },
            {
              title: "Bullying",
              description:
                "Bully-proofing your child through positive affirmations",
              issueIllustrationUrl:
                "https://mentoons-products.s3.ap-northeast-1.amazonaws.com/Products/bullying.png",
            },
            {
              title: "Cyber Addiction",
              description: "Cyber addiction and how to overcome it",
              issueIllustrationUrl:
                "https://mentoons-products.s3.ap-northeast-1.amazonaws.com/Products/cyber-addiction.png",
            },
            {
              title: "Peer Pressure",
              description:
                "Dealing with peer pressure and making the right choices",
              issueIllustrationUrl:
                "https://mentoons-products.s3.ap-northeast-1.amazonaws.com/Products/peer-pressure.png",
            },
          ],
          productDescription: [
            {
              label: "Conversation Starter Cards",
              descriptionList: [
                {
                  description: "Trendy and Relatable topics",
                },
                {
                  description: "Portable and Compact",
                },
                {
                  description: "Group and Solo Usability",
                },
                {
                  description: "Promotes Emotional Expression",
                },
                {
                  description: "Quick and Easy to play",
                },
              ],
            },
            {
              label: "How Kids will benefit",
              descriptionList: [
                {
                  description: "Reflects teens current interests",
                },
                {
                  description: "Easy to carry",
                },
                {
                  description:
                    "Works for both group hangouts and personal reflection",
                },
                {
                  description:
                    "Includes prompts that explore feelings and thoughts",
                },
                {
                  description: "No complicated rules or setup",
                },
              ],
            },
            {
              label: "How Parents will benefit",
              descriptionList: [
                {
                  description:
                    "Makes conversations feel modern and exciting, keeping teens engaged",
                },
                {
                  description: "Connect anywhere easily",
                },
                {
                  description:
                    "Adaptable for social bonding or self-discovery moments",
                },
                {
                  description:
                    "Helps teens open up, fostering deeper relationships and self- awareness",
                },
                {
                  description:
                    "Saves time and keeps the focus on connection and fun       ",
                },
              ],
            },
          ],
        },
      },
      {
        title: "Conversation Starter Cards (17-19) years",
        description:
          "Encourage meaningful conversations with our Conversation Starter Cards. Designed for teenagers, these cards help build confidence, empathy, and social skills while fostering creativity and self-expression.",
        price: 1,
        ageCategory: AgeCategory.YOUNG_ADULT,
        type: ProductType.MENTOONS_CARDS,
        rating: 4.5,
        tags: ["confidence", "empathy"],
        productImages: [
          {
            imageUrl:
              "https://mentoons-products.s3.ap-northeast-1.amazonaws.com/Products/Conversation+Starter+Cards+17-19.png",
          },
          {
            imageUrl:
              "https://mentoons-products.s3.ap-northeast-1.amazonaws.com/user_2pT5VWCnXGfCEDndSUmyLrtIQcz/1733315009292-Silent%20Stories%20Thumbnail.png",
          },
        ],
        productVideos: [
          {
            videoUrl:
              "https://mentoons-products.s3.ap-northeast-1.amazonaws.com/user_2pT5VWCnXGfCEDndSUmyLrtIQcz/1733482725834-Teen+Camp+Conversation+Starter+Cards.mp4",
          },
        ],
        isFeatured: false,
        details: {
          cardType: CardType.CONVERSATION_STARTER_CARDS,
          accentColor: "#E7002A",
          addressedIssues: [
            {
              title: "Interviewing Skills",
              description: "Interviewing skills for job and college",
              issueIllustrationUrl:
                "https://mentoons-products.s3.ap-northeast-1.amazonaws.com/Products/interview-skill.png",
            },
            {
              title: "Professional Image",
              description: "Interviewing skills for job and college",
              issueIllustrationUrl:
                "https://mentoons-products.s3.ap-northeast-1.amazonaws.com/Products/professional-image.png",
            },
            {
              title: "Portfolio Management",
              description: "Interviewing skills for job and college",
              issueIllustrationUrl:
                "https://mentoons-products.s3.ap-northeast-1.amazonaws.com/Products/portfolio-managment.png",
            },
            {
              title: "Lack of Career Support",
              description: "",
              issueIllustrationUrl:
                "https://mentoons-products.s3.ap-northeast-1.amazonaws.com/Products/lack-of-career-support.png",
            },
          ],
          productDescription: [
            {
              label: "Conversation Starter Cards",
              descriptionList: [
                {
                  description: "Trendy and Relatable topics",
                },
                {
                  description: "Portable and Compact",
                },
                {
                  description: "Group and Solo Usability",
                },
                {
                  description: "Promotes Emotional Expression",
                },
                {
                  description: "Quick and Easy to play",
                },
              ],
            },
            {
              label: "How kids will benefit",
              descriptionList: [
                {
                  description: "Reflects teens current interests",
                },
                {
                  description: "Easy to carry",
                },
                {
                  description:
                    "Works for both group hangouts and personal reflection",
                },
                {
                  description:
                    "Includes prompts that explore feelings and thoughts",
                },
                {
                  description: "No complicated rules or setup",
                },
              ],
            },
            {
              label: "How parents will benefit",
              descriptionList: [
                {
                  description:
                    "Makes conversations feel modern and exciting, keeping teens engaged",
                },
                {
                  description: "Connect anywhere easily",
                },
                {
                  description:
                    "Adaptable for social bonding or self-discovery moments",
                },
                {
                  description:
                    "Helps teens open up, fostering deeper relationships and self- awareness",
                },
                {
                  description:
                    "Saves time and keeps the focus on connection and fun",
                },
              ],
            },
          ],
        },
      },
      {
        title: "Conversation Story Cards(20+) years",
        description:
          "Encourage meaningful conversations with our Conversation Starter Cards. Designed for teenagers, these cards help build confidence, empathy, and social skills while fostering creativity and self-expression.",
        price: 1,
        ageCategory: AgeCategory.ADULT,
        type: ProductType.MENTOONS_CARDS,
        rating: 4.5,
        tags: ["confidence", "empathy"],
        productImages: [
          {
            imageUrl:
              "https://mentoons-products.s3.ap-northeast-1.amazonaws.com/Products/20%2BConversationStarterCards.png",
          },
          {
            imageUrl:
              "https://mentoons-products.s3.ap-northeast-1.amazonaws.com/Products/20%2BConversationStarterCards.png",
          },
        ],
        productVideos: [
          {
            videoUrl:
              "https://mentoons-products.s3.ap-northeast-1.amazonaws.com/user_2pT5VWCnXGfCEDndSUmyLrtIQcz/1733315016267-Silent+Stories+Ages+6-12.mp4",
          },
        ],
        isFeatured: false,
        details: {
          cardType: CardType.CONVERSATION_STORY_CARDS,
          accentColor: "#E7002A",
          addressedIssues: [
            {
              title: "Manage Screen time",
              description: "Interviewing skills for job and college",
              issueIllustrationUrl: "confidence-illustration.jpg",
            },
            {
              title: "Professional Image",
              description: "Interviewing skills for job and college",
              issueIllustrationUrl: "confidence-illustration.jpg",
            },
            {
              title: "Portfolio Management",
              description: "Interviewing skills for job and college",
              issueIllustrationUrl: "confidence-illustration.jpg",
            },
            {
              title: "Lack of Career Support",
              description: "",
              issueIllustrationUrl: "confidence-illustration.jpg",
            },
          ],
          productDescription: [
            {
              label: "Conversation Starter Cards",
              descriptionList: [
                {
                  description: "Trendy and Relatable topics",
                },
                {
                  description: "Portable and Compact",
                },
                {
                  description: "Group and Solo Usability",
                },
                {
                  description: "Promotes Emotional Expression",
                },
                {
                  description: "Quick and Easy to play",
                },
              ],
            },
            {
              label: "How kids will benefit",
              descriptionList: [
                {
                  description: "Reflects teens current interests",
                },
                {
                  description: "Easy to carry",
                },
                {
                  description:
                    "Works for both group hangouts and personal reflection",
                },
                {
                  description:
                    "Includes prompts that explore feelings and thoughts",
                },
                {
                  description: "No complicated rules or setup",
                },
              ],
            },
            {
              label: "How parents will benefit",
              descriptionList: [
                {
                  description:
                    "Makes conversations feel modern and exciting, keeping teens engaged",
                },
                {
                  description: "Connect anywhere easily",
                },
                {
                  description:
                    "Adaptable for social bonding or self-discovery moments",
                },
                {
                  description:
                    "Helps teens open up, fostering deeper relationships and self- awareness",
                },
                {
                  description:
                    "Saves time and keeps the focus on connection and fun",
                },
              ],
            },
          ],
        },
      },
      {
        title: "Story Re-teller Cards (6-12) years",
        description:
          "Unleash creativity and connection with our Story Reteller Cards. Inspire kids to imagine, think critically, and bond through fun, engaging stories. Easy to carry, they make learning and sharing a joy anytime, anywhere!",
        price: 1,
        ageCategory: AgeCategory.CHILD,
        type: ProductType.MENTOONS_CARDS,
        rating: 4.5,
        tags: ["creativity", "storytelling"],
        productImages: [
          {
            imageUrl:
              "https://mentoons-products.s3.ap-northeast-1.amazonaws.com/Products/Story+reteller+cards+6-12.png",
          },
          {
            imageUrl:
              "https://mentoons-products.s3.ap-northeast-1.amazonaws.com/user_2pT5VWCnXGfCEDndSUmyLrtIQcz/1733314767994-Story+Re-Teller+Cards+05.mp4",
          },
        ],
        productVideos: [
          {
            videoUrl:
              "https://mentoons-products.s3.ap-northeast-1.amazonaws.com/user_2pT5VWCnXGfCEDndSUmyLrtIQcz/1733314767994-Story+Re-Teller+Cards+05.mp4",
          },
        ],
        isFeatured: false,
        details: {
          cardType: CardType.STORY_RE_TELLER_CARD,
          accentColor: "#A7DE5C",
          addressedIssues: [
            {
              title: "Low Self-Esteem",
              description: "Building self-confidence through daily activities",
              issueIllustrationUrl: "confidence-illustration.jpg",
            },
            {
              title: "Low Self-Esteem",
              description: "Building self-confidence through daily activities",
              issueIllustrationUrl: "confidence-illustration.jpg",
            },
            {
              title: "Low Self-Esteem",
              description: "Building self-confidence through daily activities",
              issueIllustrationUrl: "confidence-illustration.jpg",
            },
            {
              title: "Low Self-Esteem",
              description: "Building self-confidence through daily activities",
              issueIllustrationUrl: "confidence-illustration.jpg",
            },
          ],
          productDescription: [
            {
              label: "Story Re-Teller cards",
              descriptionList: [
                {
                  description: "Smallm engaging and printable",
                },
                {
                  description: "Each card has different themes",
                },
                {
                  description: "Colourful pictures and story prompts",
                },
                {
                  description: "Question based on stories",
                },
                {
                  description: "Kids can use the cards alone or with friends",
                },
              ],
            },
            {
              label: "How kids will benefit",
              descriptionList: [
                {
                  description: "Convenient  for anytime use.",
                },
                {
                  description: "Builds empathy and social skills",
                },
                {
                  description: "Stiulates creativity and imagination",
                },
                {
                  description: "Encourages critical thinking",
                },
                {
                  description: "Forster independence and collaboration",
                },
              ],
            },
            {
              label: "How parents will benefit",
              descriptionList: [
                {
                  description: "Easy to carry and use anywhere",
                },
                {
                  description: "Indtroducess important life values naturally",
                },
                {
                  description: "Makes complex ideas easy to explain",
                },
                {
                  description: "Promotes meaningful conversations",
                },
                {
                  description:
                    "Strengthens sibling bonding and peer interaction",
                },
              ],
            },
          ],
        },
      },
      {
        title: "Story Re-teller Cards (13-16) years",
        description:
          "Unleash creativity and connection with our Story Reteller Cards. Inspire kids to imagine, think critically, and bond through fun, engaging stories. Easy to carry, they make learning and sharing a joy anytime, anywhere!",
        price: 1,
        ageCategory: AgeCategory.TEEN,
        type: ProductType.MENTOONS_CARDS,
        rating: 4.5,
        tags: ["creativity", "storytelling"],
        productImages: [
          {
            imageUrl:
              "https://mentoons-products.s3.ap-northeast-1.amazonaws.com/Products/Story+reteller+cards+13-16.png",
          },
          {
            imageUrl:
              "https://mentoons-products.s3.ap-northeast-1.amazonaws.com/user_2pT5VWCnXGfCEDndSUmyLrtIQcz/1733314766429-Story%20Re-Teller%20Cards%20Thumbnail.png",
          },
        ],
        productVideos: [
          {
            videoUrl:
              "https://mentoons-products.s3.ap-northeast-1.amazonaws.com/Products/videos/Story+Re-Teller+Cards+(13-19).mp4",
          },
        ],
        isFeatured: false,
        details: {
          cardType: CardType.STORY_RE_TELLER_CARD,
          accentColor: "#A2B12B",
          addressedIssues: [
            {
              title: "Low Self-Esteem",
              description: "Building self-confidence through daily activities",
              issueIllustrationUrl: "confidence-illustration.jpg",
            },
            {
              title: "Low Self-Esteem",
              description: "Building self-confidence through daily activities",
              issueIllustrationUrl: "confidence-illustration.jpg",
            },
            {
              title: "Low Self-Esteem",
              description: "Building self-confidence through daily activities",
              issueIllustrationUrl: "confidence-illustration.jpg",
            },
            {
              title: "Low Self-Esteem",
              description: "Building self-confidence through daily activities",
              issueIllustrationUrl: "confidence-illustration.jpg",
            },
          ],
          productDescription: [
            {
              label: "Story Re-Teller cards",
              descriptionList: [
                {
                  description: "Engaging Story Prompts",
                },
                {
                  description: "Open-ended Questions",
                },
                {
                  description: "Group and Solo play",
                },
                {
                  description: "Each Card has different themes",
                },
                {
                  description: "Compact and Portable",
                },
              ],
            },
            {
              label: "How kids will benefit",
              descriptionList: [
                {
                  description: "Sparks imagination and creativity",
                },
                {
                  description: "Allows flexibility in storytelling",
                },
                {
                  description:
                    "Works for collaborative or independent activities",
                },
                {
                  description: "Builds empathy and social skills",
                },
                {
                  description: "Easy to carry anywhere",
                },
              ],
            },
            {
              label: "How parents will benefit",
              descriptionList: [
                {
                  description:
                    "Encourages teens to craft unique and entertaining stories",
                },
                {
                  description:
                    "Helps teens express themselves freely, boosting confidence",
                },
                {
                  description:
                    "Fosters teamwork in groups or introspection when alone",
                },
                {
                  description: "Introduces important life values naturally",
                },
                {
                  description:
                    "Perfect for travel, class or spontaneous storytelling moments",
                },
              ],
            },
          ],
        },
      },
      {
        title: "Story Re-teller Cards (17-19) years",
        description:
          "Unleash creativity and connection with our Story Reteller Cards. Inspire kids to imagine, think critically, and bond through fun, engaging stories. Easy to carry, they make learning and sharing a joy anytime, anywhere!",
        price: 1,
        ageCategory: AgeCategory.YOUNG_ADULT,
        type: ProductType.MENTOONS_CARDS,
        rating: 4.5,
        tags: ["creativity", "storytelling"],
        productImages: [
          {
            imageUrl:
              "https://mentoons-products.s3.ap-northeast-1.amazonaws.com/Products/Story+reteller+cards+front+17-19.png",
          },
          {
            imageUrl:
              "https://mentoons-products.s3.ap-northeast-1.amazonaws.com/user_2pT5VWCnXGfCEDndSUmyLrtIQcz/1733314766429-Story%20Re-Teller%20Cards%20Thumbnail.png",
          },
        ],
        productVideos: [
          {
            videoUrl:
              "https://mentoons-products.s3.ap-northeast-1.amazonaws.com/Products/videos/Story+Re-Teller+Cards+(13-19).mp4",
          },
        ],
        isFeatured: false,
        details: {
          cardType: CardType.STORY_RE_TELLER_CARD,
          accentColor: "#A7DE5C",
          addressedIssues: [
            {
              title: "Low Self-Esteem",
              description: "Building self-confidence through daily activities",
              issueIllustrationUrl: "confidence-illustration.jpg",
            },
            {
              title: "Low Self-Esteem",
              description: "Building self-confidence through daily activities",
              issueIllustrationUrl: "confidence-illustration.jpg",
            },
            {
              title: "Low Self-Esteem",
              description: "Building self-confidence through daily activities",
              issueIllustrationUrl: "confidence-illustration.jpg",
            },
            {
              title: "Low Self-Esteem",
              description: "Building self-confidence through daily activities",
              issueIllustrationUrl: "confidence-illustration.jpg",
            },
          ],
          productDescription: [
            {
              label: "Story Re-Teller cards",
              descriptionList: [
                {
                  description: "Small engaging and printable",
                },
                {
                  description: "Each card has different themes",
                },
                {
                  description: "Colourful pictures and story prompts",
                },
                {
                  description: "Question based on stories",
                },
                {
                  description: "Kids can use the cards alone or with friends",
                },
              ],
            },
            {
              label: "How kids will benefit",
              descriptionList: [
                {
                  description: "Convenient  for anytime use.",
                },
                {
                  description: "Builds empathy and social skills",
                },
                {
                  description: "Stiulates creativity and imagination",
                },
                {
                  description: "Encourages critical thinking",
                },
                {
                  description: "Forster independence and collaboration",
                },
              ],
            },
            {
              label: "How parents will benefit",
              descriptionList: [
                {
                  description: "Easy to carry and use anywhere",
                },
                {
                  description: "Indtroducess important life values naturally",
                },
                {
                  description: "Makes complex ideas easy to explain",
                },
                {
                  description: "Promotes meaningful conversations",
                },
                {
                  description:
                    "Strengthens sibling bonding and peer interaction",
                },
              ],
            },
          ],
        },
      },

      {
        title: "Silent Stories (6-12) years",
        description:
          "Unlock your child’s creativity with Silent Stories, a screen-free activity that boosts imagination and storytelling skills. Perfect for solo or group play, it fosters emotional understanding and strengthens communication while offering a fun, offline bonding experience.",
        price: 1,
        ageCategory: AgeCategory.CHILD,
        type: ProductType.MENTOONS_CARDS,
        rating: 4.5,
        tags: ["emotional understanding ", "communication"],
        productImages: [
          {
            imageUrl:
              "https://mentoons-products.s3.ap-northeast-1.amazonaws.com/Products/Silent+stories+6-12.png",
          },
          {
            imageUrl:
              "https://mentoons-products.s3.ap-northeast-1.amazonaws.com/user_2pT5VWCnXGfCEDndSUmyLrtIQcz/1733315009292-Silent%20Stories%20Thumbnail.png",
          },
        ],
        productVideos: [
          {
            videoUrl:
              "https://mentoons-products.s3.ap-northeast-1.amazonaws.com/user_2pT5VWCnXGfCEDndSUmyLrtIQcz/1733315016267-Silent+Stories+Ages+6-12.mp4",
          },
        ],
        isFeatured: true,
        details: {
          cardType: CardType.SILENT_STORIES,
          accentColor: "#69A1FF",
          addressedIssues: [
            {
              title: "Low Self-Esteem",
              description: "Building self-confidence through daily activities",
              issueIllustrationUrl: "confidence-illustration.jpg",
            },
            {
              title: "Low Self-Esteem",
              description: "Building self-confidence through daily activities",
              issueIllustrationUrl: "confidence-illustration.jpg",
            },
            {
              title: "Low Self-Esteem",
              description: "Building self-confidence through daily activities",
              issueIllustrationUrl: "confidence-illustration.jpg",
            },
            {
              title: "Low Self-Esteem",
              description: "Building self-confidence through daily activities",
              issueIllustrationUrl: "confidence-illustration.jpg",
            },
          ],
          productDescription: [
            {
              label: "Silent Store",
              descriptionList: [
                {
                  description: "Visual Storytelling",
                },
                {
                  description: "Ecourage creativity",
                },
                {
                  description: "Screen-free activity",
                },
                {
                  description: "Enhances communication skill",
                },
                {
                  description: "Flexible use",
                },
              ],
            },
            {
              label: "How kids will benefit",
              descriptionList: [
                {
                  description: "Boosts imagination and creativity.",
                },
                {
                  description: "Inspires original ideas and stories.",
                },
                {
                  description: "Focuses on engaging offline fun",
                },
                {
                  description: "Improves storytelling and speaking skills.",
                },
                {
                  description: "Enjoy solo or group play",
                },
              ],
            },
            {
              label: "How parents will benefit",
              descriptionList: [
                {
                  description: "Observes child's creative thinking.",
                },
                {
                  description: "Sees unique prespectives from their child.",
                },
                {
                  description: "Offers a healthy alternative to screen time.",
                },
                {
                  description: "Understands child's emotions through stories.",
                },
                {
                  description: "Encourages bonding through stories.",
                },
              ],
            },
          ],
        },
      },
      {
        title: "Silent Stories (13-16) years",
        description:
          "Unlock your child’s creativity with Silent Stories, a screen-free activity that boosts imagination and storytelling skills. Perfect for solo or group play, it fosters emotional understanding and strengthens communication while offering a fun, offline bonding experience.",
        price: 1,
        ageCategory: AgeCategory.TEEN,
        type: ProductType.MENTOONS_CARDS,
        rating: 4.5,
        tags: ["emotional understanding ", "communication"],
        productImages: [
          {
            imageUrl:
              "https://mentoons-products.s3.ap-northeast-1.amazonaws.com/Products/Silent+stories+13-16+.png",
          },
          {
            imageUrl:
              "https://mentoons-products.s3.ap-northeast-1.amazonaws.com/user_2pT5VWCnXGfCEDndSUmyLrtIQcz/1733315009292-Silent%20Stories%20Thumbnail.png",
          },
        ],
        productVideos: [
          {
            videoUrl:
              "https://mentoons-products.s3.ap-northeast-1.amazonaws.com/Products/videos/Silent+Stories+(13-16)+(17-19)_02.mp4",
          },
        ],
        isFeatured: true,
        details: {
          cardType: CardType.SILENT_STORIES,
          accentColor: "#69A1FF",
          addressedIssues: [
            {
              title: "Low Self-Esteem",
              description: "Building self-confidence through daily activities",
              issueIllustrationUrl: "confidence-illustration.jpg",
            },
            {
              title: "Low Self-Esteem",
              description: "Building self-confidence through daily activities",
              issueIllustrationUrl: "confidence-illustration.jpg",
            },
            {
              title: "Low Self-Esteem",
              description: "Building self-confidence through daily activities",
              issueIllustrationUrl: "confidence-illustration.jpg",
            },
            {
              title: "Low Self-Esteem",
              description: "Building self-confidence through daily activities",
              issueIllustrationUrl: "confidence-illustration.jpg",
            },
          ],
          productDescription: [
            {
              label: "Silent Stories",
              descriptionList: [
                {
                  description:
                    "Encourages teens to craft unique and entertaining stories ",
                },
                {
                  description:
                    "Helps teens express themselves freely, boosting confidence",
                },
                {
                  description:
                    "Fosters teamwork in groups or introspection when alone",
                },
                {
                  description: "Introduces important life values naturally",
                },
                {
                  description:
                    "Perfect for travel, class or spontaneous storytelling moments",
                },
              ],
            },
            {
              label: "How Kids will benefit",
              descriptionList: [
                {
                  description:
                    "Encourages teens to craft unique and entertaining stories ",
                },
                {
                  description:
                    "Helps teens express themselves freely, boosting confidence",
                },
                {
                  description:
                    "Fosters teamwork in groups or introspection when alone",
                },
                {
                  description: "Introduces important life values naturally",
                },
                {
                  description:
                    "Perfect for travel, class or spontaneous storytelling moments",
                },
              ],
            },
            {
              label: "How kids will benefit",
              descriptionList: [
                {
                  description:
                    "Encourages teens to craft unique and entertaining stories ",
                },
                {
                  description:
                    "Helps teens express themselves freely, boosting confidence",
                },
                {
                  description:
                    "Fosters teamwork in groups or introspection when alone",
                },
                {
                  description: "Introduces important life values naturally",
                },
                {
                  description:
                    "Perfect for travel, class or spontaneous storytelling moments",
                },
              ],
            },
          ],
        },
      },
      {
        title: "Silent Stories (17-19) years",
        description:
          "Unlock your child’s creativity with Silent Stories, a screen-free activity that boosts imagination and storytelling skills. Perfect for solo or group play, it fosters emotional understanding and strengthens communication while offering a fun, offline bonding experience.",
        price: 1,
        ageCategory: AgeCategory.YOUNG_ADULT,
        type: ProductType.MENTOONS_CARDS,
        rating: 4.5,
        tags: ["emotional understanding ", "communication"],
        productImages: [
          {
            imageUrl:
              "https://mentoons-products.s3.ap-northeast-1.amazonaws.com/Products/Silent+stories+17-19.png",
          },
          {
            imageUrl:
              "https://mentoons-products.s3.ap-northeast-1.amazonaws.com/user_2pT5VWCnXGfCEDndSUmyLrtIQcz/1733315009292-Silent%20Stories%20Thumbnail.png",
          },
        ],
        productVideos: [
          {
            videoUrl:
              "https://mentoons-products.s3.ap-northeast-1.amazonaws.com/Products/videos/Silent+Stories+(13-16)+(17-19)_02.mp4",
          },
        ],
        isFeatured: true,
        details: {
          cardType: CardType.SILENT_STORIES,
          accentColor: "#69A1FF",
          addressedIssues: [
            {
              title: "Low Self-Esteem",
              description: "Building self-confidence through daily activities",
              issueIllustrationUrl: "confidence-illustration.jpg",
            },
            {
              title: "Low Self-Esteem",
              description: "Building self-confidence through daily activities",
              issueIllustrationUrl: "confidence-illustration.jpg",
            },
            {
              title: "Low Self-Esteem",
              description: "Building self-confidence through daily activities",
              issueIllustrationUrl: "confidence-illustration.jpg",
            },
            {
              title: "Low Self-Esteem",
              description: "Building self-confidence through daily activities",
              issueIllustrationUrl: "confidence-illustration.jpg",
            },
          ],
          productDescription: [
            {
              label: "Silent Store",
              descriptionList: [
                {
                  description: "Visual Storytelling",
                },
                {
                  description: "Ecourage creativity",
                },
                {
                  description: "Screen-free activity",
                },
                {
                  description: "Enhances communication skill",
                },
                {
                  description: "Flexible use",
                },
              ],
            },
            {
              label: "How parents will benefit",
              descriptionList: [
                {
                  description: "Boosts imagination and creativity.",
                },
                {
                  description: "Inspires original ideas and stories.",
                },
                {
                  description: "Focuses on engaging offline fun",
                },
                {
                  description: "Improves storytelling and speaking skills.",
                },
                {
                  description: "Enjoy solo or group play",
                },
              ],
            },
            {
              label: "How kids will benefit",
              descriptionList: [
                {
                  description: "Observes child's creative thinking.",
                },
                {
                  description: "Sees unique prespectives from their child.",
                },
                {
                  description: "Offers a healthy alternative to screen time.",
                },
                {
                  description: "Understands child's emotions through stories.",
                },
                {
                  description: "Encourages bonding through stories.",
                },
              ],
            },
          ],
        },
      },
    ]);

    const mentoonsBook = await MentoonsBook.create([
      {
        title: "Coloring Book on Inventions & Inventors",
        description:
          "An educational and fun coloring book that introduces kids to famous inventors and their groundbreaking inventions.",
        price: 1,
        ageCategory: AgeCategory.CHILD,
        tags: ["coloring", "inventors", "inventions", "learning"],
        type: ProductType.MENTOONS_BOOKS,
        rating: 4.7,
        productImages: [
          {
            imageUrl: "inventions-coloring-book-cover.jpg",
          },
        ],
        productVideos: [
          {
            videoUrl: "inventions-coloring-book-video",
          },
        ],
        isFeatured: true,
        details: {
          pages: 100,
          author: "Mentoons Team",
          publisher: "Mentoons",
          language: "en",
          releaseDate: new Date("2024-03-10"),
          series: "Mentoons Coloring Book",
          bookType: "Coloring Book",
          isbn: "978-3-16-148411-7",
          edition: "First Edition",
          dimensions: {
            height: 11,
            width: 8.5,
            depth: 0.3,
          },
        },
      },

      {
        title: "Coloring Book in Mandala Art – Gaming Gadgets",
        description:
          "A creative mandala art coloring book featuring gaming-themed designs to help kids relax and explore their artistic side.",
        price: 1,
        ageCategory: AgeCategory.CHILD,
        tags: ["coloring", "mandala art", "gaming", "creative"],
        type: ProductType.MENTOONS_BOOKS,
        rating: 4.5,
        productImages: [
          {
            imageUrl: "activity-book-cover.jpg",
          },
        ],
        productVideos: [
          {
            videoUrl: "activity-book-video",
          },
        ],
        isFeatured: false,
        details: {
          pages: 110,
          author: "Mentoons Team",
          publisher: "Mentoons",
          language: "en",
          releaseDate: new Date("2024-03-20"),
          series: "Mentoons Coloring Book",
          bookType: "Coloring Book",
          isbn: "978-3-16-148412-4",
          edition: "First Edition",
          dimensions: {
            height: 11,
            width: 8.5,
            depth: 0.3,
          },
        },
      },
      {
        title: "Magnificent - 9 Colouring Book",
        description:
          "A fun and engaging coloring book featuring 9 unique characters for kids to bring to life with their creativity.",
        price: 1,
        ageCategory: AgeCategory.CHILD,
        tags: ["coloring", "cartoon characters", "creative", "kids"],
        type: ProductType.MENTOONS_BOOKS,
        rating: 4.8,
        productImages: [
          {
            imageUrl: "magnificent-9-coloring-book-cover.jpg",
          },
        ],
        productVideos: [
          {
            videoUrl: "magnificent-9-coloring-book-video",
          },
        ],
        isFeatured: true,
        details: {
          pages: 120,
          author: "Mentoons Team",
          publisher: "Mentoons",
          language: "en",
          releaseDate: new Date("2024-04-05"),
          series: "Mentoons Coloring Book",
          bookType: "Coloring Book",
          isbn: "978-3-16-148413-1",
          edition: "First Edition",
          dimensions: {
            height: 11,
            width: 8.5,
            depth: 0.3,
          },
        },
      },
    ]);

    console.log("Database seeded successfully!");
    console.log(`Created:
      ${comics.length} Comics
      ${audioComics.length} Audio Comics
      ${podcasts.length} Podcasts
      ${workshops.length} Workshops
      ${assessments.length} Assessments
      ${mentoonsCard.length} Mentoons Cards
      ${mentoonsBook.length} Mentoons Books
    `);
  } catch (error) {
    console.error("Error seeding database:", error);
  }
};

module.exports = seedProducts;
