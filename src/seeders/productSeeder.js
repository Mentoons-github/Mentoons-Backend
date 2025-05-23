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
const { lang } = require("moment");

const seedProducts = async () => {
  try {
    // Clear existing data
    await mongoose.connection.dropCollection("products");

    // Create Comics
    const comics = await Comic.create([
      {
        title: "Don't Fade Away",
        description:
          "A touching story about staying true to yourself and not losing your identity in the crowd.",
        price: 19,
        orignalProductSrc:
          "https://mentoons-comics.s3.ap-northeast-1.amazonaws.com/Comics-Pdf/dont+fade+away.pdf",
        ageCategory: AgeCategory.TEEN,
        type: ProductType.COMIC,
        product_type: "Platinum",
        tags: ["Cell", "Mobile Addiction", "audio", "Addiction"],
        rating: 4.3,
        productImages: [
          {
            imageUrl:
              "https://mentoons-comics.s3.ap-northeast-1.amazonaws.com/thumbnail/Audio+comics+thumbnails/Untitled_Artwork+35.jpg",
          },
        ],
        productVideos: [
          {
            videoUrl: "",
          },
        ],
        details: {
          pages: 9, //change this
          author: "Mentoons Creative Team",
          publisher: "Mentoons",
          language: "en",
          sampleUrl: "",
          releaseDate: new Date("2024-01-15"),
          series: "",
        },
      },
      {
        title: "One Way Trip",
        description:
          "An adventure that teaches valuable lessons about choices and their permanent consequences.",
        price: 19,
        orignalProductSrc:
          "https://mentoons-comics.s3.ap-northeast-1.amazonaws.com/Comics-Pdf/one+way+trip.pdf",
        ageCategory: AgeCategory.TEEN,
        type: ProductType.COMIC,
        product_type: "Platinum",
        tags: ["Cell", "Mobile Addiction", "audio", "Addiction"],
        rating: 4.3,
        productImages: [
          {
            imageUrl:
              "https://mentoons-comics.s3.ap-northeast-1.amazonaws.com/thumbnail/Audio+comics+thumbnails/Untitled_Artwork+38.jpg",
          },
        ],
        productVideos: [
          {
            videoUrl: "",
          },
        ],
        details: {
          pages: 9, //change this
          author: "Mentoons Creative Team",
          publisher: "Mentoons",
          language: "en",
          sampleUrl: "o",
          releaseDate: new Date("2024-01-15"),
          series: "",
        },
      },
      {
        title: "Bet Your Life",
        description:
          "A powerful narrative about the risks of gambling and making life-altering decisions.",
        price: 19,
        orignalProductSrc:
          "https://mentoons-comics.s3.ap-northeast-1.amazonaws.com/Comics-Pdf/bet+your+life.pdf",
        ageCategory: AgeCategory.TEEN,
        type: ProductType.COMIC,
        product_type: "Platinum",
        tags: ["Cell", "Mobile Addiction", "audio", "Addiction"],
        rating: 4.3,
        productImages: [
          {
            imageUrl:
              "https://mentoons-comics.s3.ap-northeast-1.amazonaws.com/thumbnail/Audio+comics+thumbnails/Untitled_Artwork+37.jpg",
          },
        ],
        productVideos: [
          {
            videoUrl: "",
          },
        ],
        details: {
          pages: 11, //change this
          author: "Mentoons Creative Team",
          publisher: "Mentoons",
          language: "en",
          sampleUrl: "",
          releaseDate: new Date("2024-01-15"),
          series: "",
        },
      },
      {
        title: "Come out of Gaming",
        description:
          "A realistic look at gaming addiction and the importance of maintaining life balance.",
        price: 19,
        orignalProductSrc:
          "https://mentoons-comics.s3.ap-northeast-1.amazonaws.com/Comics-Pdf/Come+Out+Of+Game.pdf",
        ageCategory: AgeCategory.TEEN,
        type: ProductType.COMIC,
        product_type: "Platinum",
        tags: ["Cell", "Mobile Addiction", "audio", "Addiction"],
        rating: 4.3,
        productImages: [
          {
            imageUrl:
              "https://mentoons-comics.s3.ap-northeast-1.amazonaws.com/thumbnail/Audio+comics+thumbnails/Untitled_Artwork+36.jpg",
          },
        ],
        productVideos: [
          {
            videoUrl: "",
          },
        ],
        details: {
          pages: 13, //change this
          author: "Mentoons Creative Team",
          publisher: "Mentoons",
          language: "en",
          sampleUrl: "",
          releaseDate: new Date("2024-01-15"),
          series: "",
        },
      },
      {
        title: "The Cell Life of Soniya",
        description:
          "An entertaining educational journey making cell biology accessible and fun.",
        price: 19,
        orignalProductSrc:
          "https://mentoons-comics.s3.ap-northeast-1.amazonaws.com/Comics-Pdf/Cell+Life+of+Soniya.pdf",
        ageCategory: AgeCategory.TEEN,
        type: ProductType.COMIC,
        product_type: "Prime",
        tags: ["Cell", "Mobile Addiction", "audio", "Addiction"],
        rating: 4.3,
        productImages: [
          {
            imageUrl:
              "https://mentoons-comics.s3.ap-northeast-1.amazonaws.com/thumbnail/Audio+comics+thumbnails/Untitled_Artwork+27.jpg",
          },
        ],
        productVideos: [
          {
            videoUrl: "",
          },
        ],
        details: {
          pages: 3, //change this
          author: "Mentoons Creative Team",
          publisher: "Mentoons",
          language: "en",
          sampleUrl: "",
          releaseDate: new Date("2024-01-15"),
          series: "",
        },
      },
      {
        title: "Tanya's Downfall",
        description:
          "A compelling story about facing consequences and finding the strength to change.",
        price: 0,
        orignalProductSrc:
          "https://mentoons-comics.s3.ap-northeast-1.amazonaws.com/Comics-Pdf/tanya_s+downfall.pdf",
        ageCategory: AgeCategory.TEEN,
        type: ProductType.COMIC,
        product_type: "Free",
        tags: ["Cell", "Mobile Addiction", "audio", "Addiction"],
        rating: 4.3,
        productImages: [
          {
            imageUrl:
              "https://mentoons-comics.s3.ap-northeast-1.amazonaws.com/thumbnail/Audio+comics+thumbnails/Untitled_Artwork+26.jpg",
          },
        ],
        productVideos: [
          {
            videoUrl: "",
          },
        ],
        details: {
          pages: 3, //change this
          author: "Mentoons Creative Team",
          publisher: "Mentoons",
          language: "en",
          sampleUrl:
            "https://mentoons-comics.s3.ap-northeast-1.amazonaws.com/Comics-Pdf/tanya_s+downfall.pdf",
          releaseDate: new Date("2024-01-15"),
          series: "",
        },
      },
      {
        title: "Live and Let Live",
        description:
          "An inspiring message about acceptance, tolerance, and celebrating differences.",
        price: 19,
        orignalProductSrc:
          "https://mentoons-comics.s3.ap-northeast-1.amazonaws.com/Comics-Pdf/live+or+let+live.pdf",
        ageCategory: AgeCategory.TEEN,
        type: ProductType.COMIC,
        product_type: "Prime",
        tags: ["Cell", "Mobile Addiction", "audio", "Addiction"],
        rating: 4.3,
        productImages: [
          {
            imageUrl:
              "https://mentoons-comics.s3.ap-northeast-1.amazonaws.com/thumbnail/Audio+comics+thumbnails/Untitled_Artwork+23.jpg",
          },
        ],
        productVideos: [
          {
            videoUrl: "",
          },
        ],
        details: {
          pages: 11, //change this
          author: "Mentoons Creative Team",
          publisher: "Mentoons",
          language: "en",
          sampleUrl: "",
          releaseDate: new Date("2024-01-15"),
          series: "",
        },
      },
      {
        title: "I can Manage (Time Management)",
        description:
          "Essential strategies for managing time effectively and achieving your goals.",
        price: 19,
        orignalProductSrc:
          "https://mentoons-comics.s3.ap-northeast-1.amazonaws.com/Comics-Pdf/Asha+_+Simran-+Time+management+(6-9)+.pdf",
        ageCategory: AgeCategory.TEEN,
        type: ProductType.COMIC,
        product_type: "Platinum",
        tags: ["Cell", "Mobile Addiction", "audio", "Addiction"],
        rating: 4.3,
        productImages: [
          {
            imageUrl:
              "https://mentoons-comics.s3.ap-northeast-1.amazonaws.com/thumbnail/Audio+comics+thumbnails/Untitled_Artwork+24.jpg",
          },
        ],
        productVideos: [
          {
            videoUrl: "",
          },
        ],
        details: {
          pages: 9, //change this
          author: "Mentoons Creative Team",
          publisher: "Mentoons",
          language: "en",
          sampleUrl: "",
          releaseDate: new Date("2024-01-15"),
          series: "",
        },
      },
      {
        title: "Choose Wisely",
        description:
          "A thoughtful exploration of decision-making and its impact on our future.",
        price: 19,
        orignalProductSrc:
          "https://mentoons-comics.s3.ap-northeast-1.amazonaws.com/Comics-Pdf/choose+wisely.pdf",
        ageCategory: AgeCategory.TEEN,
        type: ProductType.COMIC,
        product_type: "Platinum",
        tags: ["Cell", "Mobile Addiction", "audio", "Addiction"],
        rating: 4.3,
        productImages: [
          {
            imageUrl:
              "https://mentoons-comics.s3.ap-northeast-1.amazonaws.com/thumbnail/Audio+comics+thumbnails/Untitled_Artwork+33.jpg",
          },
        ],
        productVideos: [
          {
            videoUrl: "",
          },
        ],
        details: {
          pages: 12, //change this
          author: "Mentoons Creative Team",
          publisher: "Mentoons",
          language: "en",
          sampleUrl: "",
          releaseDate: new Date("2024-01-15"),
          series: "",
        },
      },
      {
        title: "Rohan and the Puppies",
        description:
          "A heartwarming tale about responsibility, compassion, and caring for animals.",
        price: 0,
        orignalProductSrc:
          "https://mentoons-comics.s3.ap-northeast-1.amazonaws.com/Comics-Pdf/rohan+and+the+puppies.pdf",
        ageCategory: AgeCategory.TEEN,
        type: ProductType.COMIC,
        product_type: "Free",
        tags: ["Cell", "Mobile Addiction", "audio", "Addiction"],
        rating: 4.3,
        productImages: [
          {
            imageUrl:
              "https://mentoons-comics.s3.ap-northeast-1.amazonaws.com/thumbnail/Audio+comics+thumbnails/Untitled_Artwork+28.jpg",
          },
        ],
        productVideos: [
          {
            videoUrl: "",
          },
        ],
        details: {
          pages: 3, //change this
          author: "Mentoons Creative Team",
          publisher: "Mentoons",
          language: "en",
          sampleUrl:
            "https://mentoons-comics.s3.ap-northeast-1.amazonaws.com/Comics-Pdf/rohan+and+the+puppies.pdf",
          releaseDate: new Date("2024-01-15"),
          series: "",
        },
      },
      {
        title: "Rishi and Rohit",
        description:
          "A story celebrating friendship, understanding, and personal growth.",
        price: 0,
        orignalProductSrc:
          "https://mentoons-comics.s3.ap-northeast-1.amazonaws.com/Comics-Pdf/rohit+and+rishi.pdf",
        ageCategory: AgeCategory.TEEN,
        type: ProductType.COMIC,
        product_type: "Free",
        tags: ["Cell", "Mobile Addiction", "audio", "Addiction"],
        rating: 4.3,
        productImages: [
          {
            imageUrl:
              "https://mentoons-comics.s3.ap-northeast-1.amazonaws.com/thumbnail/Audio+comics+thumbnails/Untitled_Artwork+29.jpg",
          },
        ],
        productVideos: [
          {
            videoUrl: "",
          },
        ],
        details: {
          pages: 4, //change this
          author: "Mentoons Creative Team",
          publisher: "Mentoons",
          language: "en",
          sampleUrl:
            "https://mentoons-comics.s3.ap-northeast-1.amazonaws.com/Comics-Pdf/rohit+and+rishi.pdf",
          releaseDate: new Date("2024-01-15"),
          series: "",
        },
      },
      {
        title: "My Daily Routine",
        description:
          "A guide to building productive habits and maintaining a balanced lifestyle.",
        price: 19,
        orignalProductSrc:
          "https://mentoons-comics.s3.ap-northeast-1.amazonaws.com/Comics-Pdf/supriya-time+management+copy.pdf",
        ageCategory: AgeCategory.TEEN,
        type: ProductType.COMIC,
        product_type: "Platinum",
        tags: ["Cell", "Mobile Addiction", "audio", "Addiction"],
        rating: 4.3,

        productImages: [
          {
            imageUrl:
              "https://mentoons-comics.s3.ap-northeast-1.amazonaws.com/thumbnail/Audio+comics+thumbnails/Untitled_Artwork+25.jpg",
          },
        ],
        productVideos: [
          {
            videoUrl: "",
          },
        ],
        details: {
          pages: 6, //change this
          author: "Mentoons Creative Team",
          publisher: "Mentoons",
          language: "en",
          sampleUrl: "",
          releaseDate: new Date("2024-01-15"),
          series: "",
        },
      },
      {
        title: "Comic on Divorce",
        description:
          "A sensitive approach to helping children understand and cope with family changes.",
        price: 0,
        orignalProductSrc:
          "https://mentoons-comics.s3.ap-northeast-1.amazonaws.com/Comics-Pdf/Divorce.pdf",
        ageCategory: AgeCategory.TEEN,
        type: ProductType.COMIC,
        product_type: "Free",
        tags: ["Cell", "Mobile Addiction", "audio", "Addiction"],
        rating: 4.3,
        productImages: [
          {
            imageUrl:
              "https://mentoons-comics.s3.ap-northeast-1.amazonaws.com/thumbnail/Audio+comics+thumbnails/Untitled_Artwork+1+4.jpg",
          },
        ],
        productVideos: [
          {
            videoUrl: "",
          },
        ],
        details: {
          pages: 9, //change this
          author: "Mentoons Creative Team",
          publisher: "Mentoons",
          language: "en",
          sampleUrl:
            "https://mentoons-comics.s3.ap-northeast-1.amazonaws.com/Comics-Pdf/Divorce.pdf",
          releaseDate: new Date("2024-01-15"),
          series: "",
        },
      },
      {
        title: "Say Sorry",
        description:
          "Learning about the importance of apologizing and making things right.",
        price: 19,
        orignalProductSrc:
          "https://mentoons-comics.s3.ap-northeast-1.amazonaws.com/Comics-Pdf/Say+Sorry.pdf",
        ageCategory: AgeCategory.TEEN,
        type: ProductType.COMIC,
        product_type: "Prime",
        tags: ["Cell", "Mobile Addiction", "audio", "Addiction"],
        rating: 4.3,
        productImages: [
          {
            imageUrl:
              "https://mentoons-comics.s3.ap-northeast-1.amazonaws.com/thumbnail/Audio+comics+thumbnails/Untitled_Artwork+20.jpg",
          },
        ],
        productVideos: [
          {
            videoUrl: "",
          },
        ],
        details: {
          pages: 8, //change this
          author: "Mentoons Creative Team",
          publisher: "Mentoons",
          language: "en",
          sampleUrl: "",
          releaseDate: new Date("2024-01-15"),
          series: "",
        },
      },
      {
        title: "How Teenagers Lose Their Jobs Part-2",
        description:
          "Valuable insights into maintaining professional behavior and building career success.",
        price: 19,
        orignalProductSrc:
          "https://mentoons-comics.s3.ap-northeast-1.amazonaws.com/Comics-Pdf/20%2B+script+2+story.pdf",
        ageCategory: AgeCategory.TEEN,
        type: ProductType.COMIC,
        tags: ["Cell", "Mobile Addiction", "audio", "Addiction"],
        rating: 4.3,
        productImages: [
          {
            imageUrl:
              "https://mentoons-comics.s3.ap-northeast-1.amazonaws.com/thumbnail/Audio+comics+thumbnails/Untitled_Artwork+19.jpg",
          },
        ],
        productVideos: [
          {
            videoUrl: "",
          },
        ],
        details: {
          pages: 5, //change this
          author: "Mentoons Creative Team",
          publisher: "Mentoons",
          language: "en",
          sampleUrl: "",
          releaseDate: new Date("2024-01-15"),
          series: "",
        },
      },
      {
        title: "Hungry for Likes Not Life",
        description:
          "Examining social media's impact and the importance of real-world connections.",
        price: 19,
        orignalProductSrc:
          "https://mentoons-comics.s3.ap-northeast-1.amazonaws.com/Comics-Pdf/Hungry+for+likes+not+life.pdf",
        ageCategory: AgeCategory.TEEN,
        type: ProductType.COMIC,
        product_type: "Platinum",
        tags: ["Cell", "Mobile Addiction", "audio", "Addiction"],
        rating: 4.3,
        productImages: [
          {
            imageUrl:
              "https://mentoons-comics.s3.ap-northeast-1.amazonaws.com/thumbnail/Audio+comics+thumbnails/Untitled_Artwork+34.jpg",
          },
        ],
        productVideos: [
          {
            videoUrl: "",
          },
        ],
        details: {
          pages: 9, //change this
          author: "Mentoons Creative Team",
          publisher: "Mentoons",
          language: "en",
          sampleUrl: "",
          releaseDate: new Date("2024-01-15"),
          series: "",
        },
      },
      {
        title: "Think Before You Act",
        description:
          "Understanding the importance of careful consideration before taking action.",
        price: 0,
        orignalProductSrc:
          "https://mentoons-comics.s3.ap-northeast-1.amazonaws.com/Comics-Pdf/Preppers+Story+(Think+Before+You+Act)+(1).pdf",
        ageCategory: AgeCategory.TEEN,
        type: ProductType.COMIC,
        product_type: "Free",
        tags: ["Cell", "Mobile Addiction", "audio", "Addiction"],
        rating: 4.3,
        productImages: [
          {
            imageUrl:
              "https://mentoons-comics.s3.ap-northeast-1.amazonaws.com/thumbnail/Audio+comics+thumbnails/Think_Before_You_Act!.jpg",
          },
        ],
        productVideos: [
          {
            videoUrl: "",
          },
        ],
        details: {
          pages: 21, //change this
          author: "Mentoons Creative Team",
          publisher: "Mentoons",
          language: "en",
          sampleUrl:
            "https://mentoons-comics.s3.ap-northeast-1.amazonaws.com/Comics-Pdf/Preppers+Story+(Think+Before+You+Act)+(1).pdf",
          releaseDate: new Date("2024-01-15"),
          series: "",
        },
      },
    ]);

    // Create Audio Comics
    const audioComics = await AudioComic.create([
      {
        title: "Bet Your Life",
        description:
          "A cautionary tale about the dangers of gambling and making risky life choices that can impact your future.",
        price: 19,
        orignalProductSrc:
          "https://mentoons-comics.s3.ap-northeast-1.amazonaws.com/AGES+13+-+19/BET_YOUR_LIFE.mp4",
        ageCategory: AgeCategory.TEEN,
        type: ProductType.AUDIO_COMIC,
        product_type: "Platinum",
        tags: ["space", "adventure", "audio"],
        rating: 4.5,
        productImages: [
          {
            imageUrl:
              "https://mentoons-comics.s3.ap-northeast-1.amazonaws.com/thumbnail/Audio+comics+thumbnails/Untitled_Artwork+37.jpg",
          },
        ],
        productVideos: [
          {
            videoUrl: "",
          },
        ],
        isFeatured: true,
        details: {
          duration: "2:17", // minutes
          narrator: "Mentoons Team",
          language: "en",
          format: "mp4",
          sampleDuration: "1:00", // minutes
          sampleUrl:
            "https://mentoons-comics.s3.ap-northeast-1.amazonaws.com/AGES+13+-+19/BET_YOUR_LIFE.mp4",
          releaseDate: new Date("2024-01-20"),
        },
      },
      {
        title: "The Cell Life of Soniya",
        description:
          "An educational journey through cell biology with Soniya, making science fun and easy to understand.",
        price: 19,
        orignalProductSrc:
          "https://mentoons-comics.s3.ap-northeast-1.amazonaws.com/AGES+13+-+19/CELL_LIFE_OF_SONIYA_02.mp4",
        ageCategory: AgeCategory.CHILD,
        type: ProductType.AUDIO_COMIC,
        product_type: "Prime",
        tags: ["Cell", "Mobile Addiction", "audio", "Addiction"],
        rating: 4.3,
        productImages: [
          {
            imageUrl:
              "https://mentoons-comics.s3.ap-northeast-1.amazonaws.com/thumbnail/Audio+comics+thumbnails/Untitled_Artwork+27.jpg",
          },
        ],
        productVideos: [
          {
            videoUrl: "",
          },
        ],
        isFeatured: true,
        details: {
          duration: "2:31", // minutes
          narrator: "Mentoons Team",
          language: "en",
          format: "mp4",
          sampleDuration: "1:00", // minutes
          sampleUrl:
            "https://mentoons-comics.s3.ap-northeast-1.amazonaws.com/AGES+13+-+19/CELL_LIFE_OF_SONIYA_02.mp4",
          releaseDate: new Date("2024-01-20"),
        },
      },
      {
        title: "Choose Wisely",
        description:
          "A story that emphasizes the importance of making thoughtful decisions and understanding their long-term impact.",
        price: 19,
        orignalProductSrc:
          "https://mentoons-comics.s3.ap-northeast-1.amazonaws.com/AGES+13+-+19/CHOOSE_WISELY.mp4",
        ageCategory: AgeCategory.TEEN,
        type: ProductType.AUDIO_COMIC,
        product_type: "Platinum",
        tags: ["Cell", "Mobile Addiction", "audio", "Addiction"],
        rating: 4.3,
        productImages: [
          {
            imageUrl:
              "https://mentoons-comics.s3.ap-northeast-1.amazonaws.com/thumbnail/Audio+comics+thumbnails/Untitled_Artwork+33.jpg",
          },
        ],
        productVideos: [
          {
            videoUrl: "",
          },
        ],
        isFeatured: true,
        details: {
          duration: "4:27", // minutes
          narrator: "Mentoons Team",
          language: "en",
          format: "mp4",
          sampleDuration: "1:00", // minutes
          sampleUrl:
            "https://mentoons-comics.s3.ap-northeast-1.amazonaws.com/AGES+13+-+19/CHOOSE_WISELY.mp4",
          releaseDate: new Date("2024-01-20"),
        },
      },
      {
        title: "Come out of Gaming",
        description:
          "An eye-opening narrative about gaming addiction and finding balance between virtual and real life.",
        price: 19,
        orignalProductSrc:
          "https://mentoons-comics.s3.ap-northeast-1.amazonaws.com/AGES+13+-+19/COME_OUT_OF_GAMING_02.mp4",
        ageCategory: AgeCategory.TEEN,
        type: ProductType.AUDIO_COMIC,
        product_type: "Platinum",
        tags: ["Cell", "Mobile Addiction", "audio", "Addiction"],
        rating: 4.3,
        productImages: [
          {
            imageUrl:
              "https://mentoons-comics.s3.ap-northeast-1.amazonaws.com/thumbnail/Audio+comics+thumbnails/Untitled_Artwork+36.jpg",
          },
        ],
        productVideos: [
          {
            videoUrl: "",
          },
        ],
        isFeatured: true,
        details: {
          duration: "5:51", // minutes
          narrator: "Mentoons Team",
          language: "en",
          format: "mp4",
          sampleDuration: "1:00", // minutes
          sampleUrl:
            "https://mentoons-comics.s3.ap-northeast-1.amazonaws.com/AGES+13+-+19/COME_OUT_OF_GAMING_02.mp4",
          releaseDate: new Date("2024-01-20"),
        },
      },
      {
        title: "Audio comic on Divorce",
        description:
          "A sensitive exploration of family changes, helping children understand and cope with divorce.",
        price: 0,
        orignalProductSrc:
          "https://mentoons-comics.s3.ap-northeast-1.amazonaws.com/AGES+13+-+19/COMIC_ON_DIVORCE_01.mp4",
        ageCategory: AgeCategory.TEEN,
        type: ProductType.AUDIO_COMIC,
        product_type: "Free",
        tags: ["Cell", "Mobile Addiction", "audio", "Addiction"],
        rating: 4.3,
        productImages: [
          {
            imageUrl:
              "https://mentoons-comics.s3.ap-northeast-1.amazonaws.com/thumbnail/Audio+comics+thumbnails/Untitled_Artwork+1+4.jpg",
          },
        ],
        productVideos: [
          {
            videoUrl: "",
          },
        ],
        isFeatured: true,
        details: {
          duration: "2:04", // minutes
          narrator: "Mentoons Team",
          language: "en",
          format: "mp4",
          sampleDuration: "1:00", // minutes
          sampleUrl:
            "https://mentoons-comics.s3.ap-northeast-1.amazonaws.com/AGES+13+-+19/COMIC_ON_DIVORCE_01.mp4",
          releaseDate: new Date("2024-01-20"),
        },
      },
      {
        title: "Don't Fade Away",
        description:
          "A powerful story about maintaining your identity and standing strong in the face of peer pressure.",
        price: 19,
        orignalProductSrc:
          "https://mentoons-comics.s3.ap-northeast-1.amazonaws.com/AGES+13+-+19/DONT_FADE_AWAY_02.mp4",
        ageCategory: AgeCategory.TEEN,
        type: ProductType.AUDIO_COMIC,
        product_type: "Platinum",
        tags: ["Cell", "Mobile Addiction", "audio", "Addiction"],
        rating: 4.3,
        productImages: [
          {
            imageUrl:
              "https://mentoons-comics.s3.ap-northeast-1.amazonaws.com/thumbnail/Audio+comics+thumbnails/Untitled_Artwork+35.jpg",
          },
        ],
        productVideos: [
          {
            videoUrl: "",
          },
        ],
        isFeatured: true,
        details: {
          duration: "2:54", // minutes
          narrator: "Mentoons Team",
          language: "en",
          format: "mp4",
          sampleDuration: "1:00", // minutes
          sampleUrl:
            "https://mentoons-comics.s3.ap-northeast-1.amazonaws.com/AGES+13+-+19/DONT_FADE_AWAY_02.mp4",
          releaseDate: new Date("2024-01-20"),
        },
      },
      {
        title: "Hungry For Likes Not Life",
        description:
          "An important message about social media addiction and the pursuit of online validation versus real-life fulfillment.",
        price: 19,
        orignalProductSrc:
          "https://mentoons-comics.s3.ap-northeast-1.amazonaws.com/AGES+13+-+19/HUNGRY_FOR_LIKES_NOT_LIFE_01.mp4",
        ageCategory: AgeCategory.TEEN,
        type: ProductType.AUDIO_COMIC,
        product_type: "Platinum",
        tags: ["Cell", "Mobile Addiction", "audio", "Addiction"],
        rating: 4.3,
        productImages: [
          {
            imageUrl:
              "https://mentoons-comics.s3.ap-northeast-1.amazonaws.com/thumbnail/Audio+comics+thumbnails/Untitled_Artwork+34.jpg",
          },
        ],
        productVideos: [
          {
            videoUrl: "",
          },
        ],
        isFeatured: true,
        details: {
          duration: "2:10", // minutes
          narrator: "Mentoons Team",
          language: "en",
          format: "mp4",
          sampleDuration: "1:00", // minutes
          sampleUrl:
            "https://mentoons-comics.s3.ap-northeast-1.amazonaws.com/AGES+13+-+19/HUNGRY_FOR_LIKES_NOT_LIFE_01.mp4",
          releaseDate: new Date("2024-01-20"),
        },
      },
      {
        title: "One Way Trip",
        description:
          "A compelling story about life-changing decisions and their irreversible consequences.",
        price: 19,
        orignalProductSrc:
          "https://mentoons-comics.s3.ap-northeast-1.amazonaws.com/AGES+13+-+19/ONE-WAY-TRIP_1.mp4",
        ageCategory: AgeCategory.TEEN,
        type: ProductType.AUDIO_COMIC,
        product_type: "Platinum",
        tags: ["Cell", "Mobile Addiction", "audio", "Addiction"],
        rating: 4.3,
        productImages: [
          {
            imageUrl:
              "https://mentoons-comics.s3.ap-northeast-1.amazonaws.com/thumbnail/Audio+comics+thumbnails/Untitled_Artwork+38.jpg",
          },
        ],
        productVideos: [
          {
            videoUrl: "",
          },
        ],
        isFeatured: true,
        details: {
          duration: "4:09", // minutes
          narrator: "Mentoons Team",
          language: "en",
          format: "mp4",
          sampleDuration: "1:00", // minutes
          sampleUrl:
            "https://mentoons-comics.s3.ap-northeast-1.amazonaws.com/AGES+13+-+19/ONE-WAY-TRIP_1.mp4",
          releaseDate: new Date("2024-01-20"),
        },
      },
      {
        title: "Rishi and Rohit",
        description:
          "A heartwarming tale of friendship, understanding, and personal growth between two friends.",
        price: 0,
        orignalProductSrc:
          "https://mentoons-comics.s3.ap-northeast-1.amazonaws.com/AGES+13+-+19/RISHI+AND+ROHIT.mp4",
        ageCategory: AgeCategory.CHILD,
        type: ProductType.AUDIO_COMIC,
        product_type: "Free",
        tags: ["Cell", "Mobile Addiction", "audio", "Addiction"],
        rating: 4.3,
        productImages: [
          {
            imageUrl:
              "https://mentoons-comics.s3.ap-northeast-1.amazonaws.com/thumbnail/Audio+comics+thumbnails/Untitled_Artwork+29.jpg",
          },
        ],
        productVideos: [
          {
            videoUrl: "",
          },
        ],
        isFeatured: true,
        details: {
          duration: "2:20", // minutes
          narrator: "Mentoons Team",
          language: "en",
          format: "mp4",
          sampleDuration: "1:00", // minutes
          sampleUrl:
            "https://mentoons-comics.s3.ap-northeast-1.amazonaws.com/AGES+13+-+19/RISHI+AND+ROHIT.mp4",
          releaseDate: new Date("2024-01-20"),
        },
      },
      {
        title: "Rohan and the Puppies",
        description:
          "A touching story about compassion, responsibility, and the joy of caring for animals.",
        price: 0,
        orignalProductSrc:
          "https://mentoons-comics.s3.ap-northeast-1.amazonaws.com/AGES+13+-+19/Rohan+and+the+Puppies_01.mp4",
        ageCategory: AgeCategory.CHILD,
        type: ProductType.AUDIO_COMIC,
        product_type: "Free",
        tags: ["Cell", "Mobile Addiction", "audio", "Addiction"],
        rating: 4.3,
        productImages: [
          {
            imageUrl:
              "https://mentoons-comics.s3.ap-northeast-1.amazonaws.com/thumbnail/Audio+comics+thumbnails/Untitled_Artwork+28.jpg",
          },
        ],
        productVideos: [
          {
            videoUrl: "",
          },
        ],
        isFeatured: true,
        details: {
          duration: "2:09", // minutes
          narrator: "Mentoons Team",
          language: "en",
          format: "mp4",
          sampleDuration: "1:00", // minutes
          sampleUrl:
            "https://mentoons-comics.s3.ap-northeast-1.amazonaws.com/AGES+13+-+19/Rohan+and+the+Puppies_01.mp4",
          releaseDate: new Date("2024-01-20"),
        },
      },
      {
        title: "Think Before You Act",
        description:
          "An engaging narrative that teaches the importance of considering consequences before taking action.",
        price: 0,
        orignalProductSrc:
          "https://mentoons-comics.s3.ap-northeast-1.amazonaws.com/AGES+13+-+19/Think+Before+You+Act.mp4",
        ageCategory: AgeCategory.TEEN,
        type: ProductType.AUDIO_COMIC,
        product_type: "Free",
        tags: ["Cell", "Mobile Addiction", "audio", "Addiction"],
        rating: 4.3,
        productImages: [
          {
            imageUrl:
              "https://mentoons-comics.s3.ap-northeast-1.amazonaws.com/thumbnail/Audio+comics+thumbnails/Think_Before_You_Act!.jpg",
          },
        ],
        productVideos: [
          {
            videoUrl: "",
          },
        ],
        isFeatured: true,
        details: {
          duration: "3:45", // minutes
          narrator: "Mentoons Team",
          language: "en",
          format: "mp4",
          sampleDuration: "1:00", // minutes
          sampleUrl:
            "https://mentoons-comics.s3.ap-northeast-1.amazonaws.com/AGES+13+-+19/Think+Before+You+Act.mp4",
          releaseDate: new Date("2024-01-20"),
        },
      },
      {
        title: "Tanya's Downfall",
        description:
          "A cautionary tale about the consequences of poor choices and the path to redemption.",
        price: 0,
        orignalProductSrc:
          "https://mentoons-comics.s3.ap-northeast-1.amazonaws.com/AGES+13+-+19/TANYA_DOWN-FALL_02.mp4",
        ageCategory: AgeCategory.CHILD,
        type: ProductType.AUDIO_COMIC,
        product_type: "Free",
        tags: ["Cell", "Mobile Addiction", "audio", "Addiction"],
        rating: 4.3,
        productImages: [
          {
            imageUrl:
              "https://mentoons-comics.s3.ap-northeast-1.amazonaws.com/thumbnail/Audio+comics+thumbnails/Untitled_Artwork+26.jpg",
          },
        ],
        productVideos: [
          {
            videoUrl: "",
          },
        ],
        isFeatured: true,
        details: {
          duration: "1:53", // minutes
          narrator: "Mentoons Team",
          language: "en",
          format: "mp4",
          sampleDuration: "1:00", // minutes
          sampleUrl:
            "https://mentoons-comics.s3.ap-northeast-1.amazonaws.com/AGES+13+-+19/TANYA_DOWN-FALL_02.mp4",
          releaseDate: new Date("2024-01-20"),
        },
      },
      {
        title: "How Teenagers Lose Their Jobs Part-1",
        description:
          "Essential lessons about workplace etiquette and common mistakes that can impact your career.",
        price: 19,
        orignalProductSrc:
          "https://mentoons-comics.s3.ap-northeast-1.amazonaws.com/AGES+20%2B/SANKAR_INTERVIEW.mp4",
        ageCategory: AgeCategory.ADULT,
        type: ProductType.AUDIO_COMIC,
        tags: ["Cell", "Mobile Addiction", "audio", "Addiction"],
        rating: 4.3,
        productImages: [
          {
            imageUrl:
              "https://mentoons-comics.s3.ap-northeast-1.amazonaws.com/thumbnail/Audio+comics+thumbnails/Untitled_Artwork+1+3.jpg",
          },
        ],
        productVideos: [
          {
            videoUrl: "",
          },
        ],
        isFeatured: true,
        details: {
          duration: "1:13", // minutes
          narrator: "Mentoons Team",
          language: "en",
          format: "mp4",
          sampleDuration: "1:00", // minutes
          sampleUrl:
            "https://mentoons-comics.s3.ap-northeast-1.amazonaws.com/AGES+20%2B/SANKAR_INTERVIEW.mp4",
          releaseDate: new Date("2024-01-20"),
        },
      },
      {
        title: "How Teenagers Lose Their Jobs Part-2",
        description:
          "Continued guidance on maintaining professional behavior and building a successful career path.",
        price: 19,
        orignalProductSrc:
          "https://mentoons-comics.s3.ap-northeast-1.amazonaws.com/AGES+20%2B/Sana+Comic+Interview.mp4",
        ageCategory: AgeCategory.ADULT,
        type: ProductType.AUDIO_COMIC,
        tags: ["Cell", "Mobile Addiction", "audio", "Addiction"],
        rating: 4.3,
        productImages: [
          {
            imageUrl:
              "https://mentoons-comics.s3.ap-northeast-1.amazonaws.com/thumbnail/Audio+comics+thumbnails/Untitled_Artwork+19.jpg",
          },
        ],
        productVideos: [
          {
            videoUrl: "",
          },
        ],
        isFeatured: true,
        details: {
          duration: "0:58", // minutes
          narrator: "Mentoons Team",
          language: "en",
          format: "mp4",
          sampleDuration: "1:00", // minutes
          sampleUrl:
            "https://mentoons-comics.s3.ap-northeast-1.amazonaws.com/AGES+20%2B/Sana+Comic+Interview.mp4",
          releaseDate: new Date("2024-01-20"),
        },
      },
      {
        title: "I can Manage (Time Management)",
        description:
          "Practical strategies and tips for effective time management and building productive habits.",
        price: 19,
        orignalProductSrc:
          "https://mentoons-comics.s3.ap-northeast-1.amazonaws.com/AGES+6+-+12/Asha+%26+Simran-+Time+management+(6-12)_1.mp4",
        ageCategory: AgeCategory.CHILD,
        type: ProductType.AUDIO_COMIC,
        product_type: "Platinum",
        tags: ["Cell", "Mobile Addiction", "audio", "Addiction"],
        rating: 4.3,
        productImages: [
          {
            imageUrl:
              "https://mentoons-comics.s3.ap-northeast-1.amazonaws.com/thumbnail/Audio+comics+thumbnails/Untitled_Artwork+24.jpg",
          },
        ],
        productVideos: [
          {
            videoUrl: "",
          },
        ],
        isFeatured: true,
        details: {
          duration: "1:29", // minutes
          narrator: "Mentoons Team",
          language: "en",
          format: "mp4",
          sampleDuration: "1:00", // minutes
          sampleUrl:
            "https://mentoons-comics.s3.ap-northeast-1.amazonaws.com/AGES+6+-+12/Asha+%26+Simran-+Time+management+(6-12)_1.mp4",
          releaseDate: new Date("2024-01-20"),
        },
      },
      {
        title: "Audio comic on Honesty",
        description:
          "A valuable lesson about the importance of truthfulness and integrity in daily life.",
        price: 19,
        orignalProductSrc:
          "https://mentoons-comics.s3.ap-northeast-1.amazonaws.com/AGES+6+-+12/COMIC_ON_HONESTY.mp4",
        ageCategory: AgeCategory.CHILD,
        type: ProductType.AUDIO_COMIC,
        tags: ["Cell", "Mobile Addiction", "audio", "Addiction"],
        rating: 4.3,
        productImages: [
          {
            imageUrl:
              "https://mentoons-comics.s3.ap-northeast-1.amazonaws.com/thumbnail/Audio+comics+thumbnails/Untitled_Artwork+40.jpg",
          },
        ],
        productVideos: [
          {
            videoUrl: "",
          },
        ],
        isFeatured: true,
        details: {
          duration: "1:16", // minutes
          narrator: "Mentoons Team",
          language: "en",
          format: "mp4",
          sampleDuration: "1:00", // minutes
          sampleUrl:
            "https://mentoons-comics.s3.ap-northeast-1.amazonaws.com/AGES+6+-+12/COMIC_ON_HONESTY.mp4",
          releaseDate: new Date("2024-01-20"),
        },
      },
      {
        title: "Greeting Comic",
        description:
          "Learning social etiquette and the importance of proper greetings in building relationships.",
        price: 19,
        orignalProductSrc:
          "https://mentoons-comics.s3.ap-northeast-1.amazonaws.com/AGES+6+-+12/GREETING_COMIC.mp4",
        ageCategory: AgeCategory.CHILD,
        type: ProductType.AUDIO_COMIC,
        tags: ["Cell", "Mobile Addiction", "audio", "Addiction"],
        rating: 4.3,
        productImages: [
          {
            imageUrl:
              "https://mentoons-comics.s3.ap-northeast-1.amazonaws.com/thumbnail/Audio+comics+thumbnails/Untitled_Artwork+39.jpg",
          },
        ],
        productVideos: [
          {
            videoUrl: "",
          },
        ],
        isFeatured: true,
        details: {
          duration: "1:44", // minutes
          narrator: "Mentoons Team",
          language: "en",
          format: "mp4",
          sampleDuration: "1:00", // minutes
          sampleUrl:
            "https://mentoons-comics.s3.ap-northeast-1.amazonaws.com/AGES+6+-+12/GREETING_COMIC.mp4",
          releaseDate: new Date("2024-01-20"),
        },
      },
      {
        title: "Live and Let Live",
        description:
          "An inspiring message about acceptance, tolerance, and celebrating differences.",
        price: 19,
        orignalProductSrc:
          "https://mentoons-comics.s3.ap-northeast-1.amazonaws.com/AGES+6+-+12/SAY+SORRY+COMIC.mp4",
        ageCategory: AgeCategory.CHILD,
        type: ProductType.AUDIO_COMIC,
        product_type: "Prime",
        tags: ["Cell", "Mobile Addiction", "audio", "Addiction"],
        rating: 4.3,
        productImages: [
          {
            imageUrl:
              "https://mentoons-comics.s3.ap-northeast-1.amazonaws.com/thumbnail/Audio+comics+thumbnails/Untitled_Artwork+23.jpg",
          },
        ],
        productVideos: [
          {
            videoUrl: "",
          },
        ],
        isFeatured: true,
        details: {
          duration: "2:02", // minutes
          narrator: "Mentoons Team",
          language: "en",
          format: "mp4",
          sampleDuration: "1:00", // minutes
          sampleUrl:
            "https://mentoons-comics.s3.ap-northeast-1.amazonaws.com/AGES+6+-+12/SAY+SORRY+COMIC.mp4",
          releaseDate: new Date("2024-01-20"),
        },
      },
      {
        title: "Say Sorry",
        description:
          "Understanding the power of apology and taking responsibility for our actions.",
        price: 19,
        orignalProductSrc:
          "https://mentoons-comics.s3.ap-northeast-1.amazonaws.com/AGES+6+-+12/SAY+SORRY+COMIC.mp4",
        ageCategory: AgeCategory.CHILD,
        type: ProductType.AUDIO_COMIC,
        product_type: "Prime",
        tags: ["Cell", "Mobile Addiction", "audio", "Addiction"],
        rating: 4.3,
        productImages: [
          {
            imageUrl:
              "https://mentoons-comics.s3.ap-northeast-1.amazonaws.com/thumbnail/Audio+comics+thumbnails/Untitled_Artwork+20.jpg",
          },
        ],
        productVideos: [
          {
            videoUrl: "",
          },
        ],
        isFeatured: true,
        details: {
          duration: "2:08", // minutes
          narrator: "Mentoons Team",
          language: "en",
          format: "mp4",
          sampleDuration: "1:00", // minutes
          sampleUrl:
            "https://mentoons-comics.s3.ap-northeast-1.amazonaws.com/AGES+6+-+12/SAY+SORRY+COMIC.mp4",
          releaseDate: new Date("2024-01-20"),
        },
      },

      {
        title: "My Daily Routine",
        description:
          "Tips and strategies for creating and maintaining healthy daily habits for success.",
        price: 19,
        orignalProductSrc:
          "https://mentoons-comics.s3.ap-northeast-1.amazonaws.com/AGES+6+-+12/SUPRIYA_TIME_MANAGEMENT_1.mp4",
        ageCategory: AgeCategory.CHILD,
        type: ProductType.AUDIO_COMIC,
        product_type: "Platinum",
        tags: ["Cell", "Mobile Addiction", "audio", "Addiction"],
        rating: 4.3,
        productImages: [
          {
            imageUrl:
              "https://mentoons-comics.s3.ap-northeast-1.amazonaws.com/thumbnail/Audio+comics+thumbnails/Untitled_Artwork+25.jpg",
          },
        ],
        productVideos: [
          {
            videoUrl: "",
          },
        ],
        isFeatured: true,
        details: {
          duration: "0:47", // minutes
          narrator: "Mentoons Team",
          language: "en",
          format: "mp4",
          sampleDuration: "1:00", // minutes
          sampleUrl:
            "https://mentoons-comics.s3.ap-northeast-1.amazonaws.com/AGES+6+-+12/SUPRIYA_TIME_MANAGEMENT_1.mp4",
          releaseDate: new Date("2024-01-20"),
        },
      },
      {
        title: "Do You Know",
        description:
          "Continued guidance on maintaining professional behavior and building a successful career path.",
        price: 19,
        orignalProductSrc:
          "https://mentoons-comics.s3.ap-northeast-1.amazonaws.com/BOOKS/BOOK+3+DO+YOU+KNOW_FINAL.mp4",
        ageCategory: AgeCategory.TEEN,
        type: ProductType.AUDIO_COMIC,
        product_type: "Platinum",
        tags: ["Cell", "Mobile Addiction", "audio", "Addiction"],
        rating: 4.3,
        productImages: [
          {
            imageUrl:
              "https://mentoons-comics.s3.ap-northeast-1.amazonaws.com/thumbnail/Audio+comics+thumbnails/Untitled_Artwork+31.jpg",
          },
        ],
        productVideos: [
          {
            videoUrl: "",
          },
        ],
        isFeatured: true,
        details: {
          duration: "3:44", // minutes
          narrator: "Mentoons Team",
          language: "en",
          format: "mp4",
          sampleDuration: "1:00", // minutes
          sampleUrl:
            "https://mentoons-comics.s3.ap-northeast-1.amazonaws.com/BOOKS/BOOK+3+DO+YOU+KNOW_FINAL.mp4",
          releaseDate: new Date("2024-01-20"),
        },
      },
      {
        title: "Electronic Gadgets And Kids",
        description:
          "Understanding the impact of technology on children and promoting healthy digital habits.",
        price: 0,
        orignalProductSrc:
          "https://mentoons-comics.s3.ap-northeast-1.amazonaws.com/BOOKS/BOOK_02_GADGETS_AND_KIDS_01.mp4",
        ageCategory: AgeCategory.CHILD,
        type: ProductType.AUDIO_COMIC,
        tags: ["Cell", "Mobile Addiction", "audio", "Addiction"],
        rating: 4.3,
        productImages: [
          {
            imageUrl:
              "https://mentoons-comics.s3.ap-northeast-1.amazonaws.com/thumbnail/Audio+comics+thumbnails/Untitled_Artwork+32.jpg",
          },
        ],
        productVideos: [
          {
            videoUrl: "",
          },
        ],
        isFeatured: true,
        details: {
          duration: "5:21", // minutes
          narrator: "Mentoons Team",
          language: "en",
          format: "mp4",
          sampleDuration: "1:00", // minutes
          sampleUrl:
            "https://mentoons-comics.s3.ap-northeast-1.amazonaws.com/BOOKS/BOOK_02_GADGETS_AND_KIDS_01.mp4",
          releaseDate: new Date("2024-01-20"),
        },
      },
      {
        title: "How to Handle Relationships",
        description:
          "Guidance on building and maintaining healthy relationships with family, friends, and peers.",
        price: 19,
        orignalProductSrc:
          "https://mentoons-comics.s3.ap-northeast-1.amazonaws.com/BOOKS/HOW+TO+HANDLE+RELATIONSHIP.mp4",
        ageCategory: AgeCategory.TEEN,
        type: ProductType.AUDIO_COMIC,
        product_type: "Platinum",
        tags: ["Cell", "Mobile Addiction", "audio", "Addiction"],
        rating: 4.3,
        productImages: [
          {
            imageUrl:
              "https://mentoons-comics.s3.ap-northeast-1.amazonaws.com/thumbnail/Audio+comics+thumbnails/Untitled_Artwork+30.jpg",
          },
        ],
        productVideos: [
          {
            videoUrl: "",
          },
        ],
        isFeatured: true,
        details: {
          duration: "5:11", // minutes
          narrator: "Mentoons Team",
          language: "en",
          format: "mp4",
          sampleDuration: "1:00", // minutes
          sampleUrl:
            "https://mentoons-comics.s3.ap-northeast-1.amazonaws.com/BOOKS/HOW+TO+HANDLE+RELATIONSHIP.mp4",
          releaseDate: new Date("2024-01-20"),
        },
      },
      {
        title: "Listen To Me",
        description:
          "A story about the importance of active listening and effective communication.",
        price: 19,
        orignalProductSrc:
          "https://mentoons-comics.s3.ap-northeast-1.amazonaws.com/AGES+6+-+12/Comic+on+Listen+to+me_01.mp4",
        ageCategory: AgeCategory.CHILD,
        type: ProductType.AUDIO_COMIC,
        product_type: "Prime",
        tags: ["Cell", "Mobile Addiction", "audio", "Addiction"],
        rating: 4.3,
        productImages: [
          {
            imageUrl:
              "https://mentoons-comics.s3.ap-northeast-1.amazonaws.com/thumbnail/Audio+comics+thumbnails/Untitled_Artwork+22.jpg",
          },
        ],
        productVideos: [
          {
            videoUrl: "",
          },
        ],
        isFeatured: false,
        details: {
          duration: "2:12", // minutes
          narrator: "Mentoons Team",
          language: "en",
          format: "mp4",
          sampleDuration: "1:00", // minutes
          sampleUrl:
            "https://mentoons-comics.s3.ap-northeast-1.amazonaws.com/AGES+6+-+12/Comic+on+Listen+to+me_01.mp4",
          releaseDate: new Date("2024-01-20"),
        },
      },
    ]);

    // Create Podcasts
    const podcasts = await Podcast.create([
      {
        title: "Negative impact of Mobile phone",
        description:
          "Podcast Negative Impact of Mobile Phones takes a closer look at the consequences of our constant connection to the digital world. Through expert insights, real-life stories, and research-backed discussions, we explore how excessive mobile phone usage can affect mental health, disrupt relationships, and hinder personal growth. Each episode uncovers the hidden costs of living through a screen and offers strategies to reclaim balance, improve focus, and foster deeper connections with the world around us.",
        price: 19,
        orignalProductSrc:
          "https://mentoons-comics.s3.ap-northeast-1.amazonaws.com/podcast/negative_impact_of_mobile.mp3",
        ageCategory: AgeCategory.TEEN,
        type: ProductType.PODCAST,
        product_type: "Free",
        tags: ["technology", "addiction", "news"],
        rating: 4.5,
        productImages: [
          {
            imageUrl: "/assets/images/negative-impact-of-mobile-phone.jpg",
          },
        ],
        productVideos: [
          {
            videoUrl: "",
          },
        ],
        details: {
          category: "mobile addiction",
          episodeNumber: 1,
          duration: "2:12",
          language: "en",
          host: "Haaris Rueben",
          sampleUrl:
            "https://mentoons-comics.s3.ap-northeast-1.amazonaws.com/podcast/negative_impact_of_mobile.mp3",
          releaseDate: new Date("2024-02-15"),
        },
      },
      {
        title: "Negative impact of social media",
        description:
          "Podcast on Negative Impact of Social Media delves into the darker side of the digital landscape and its effects on mental health, self-esteem, and social relationships. Each episode uncovers how excessive use of social platforms can lead to anxiety, comparison, isolation, and addiction. Through expert interviews, personal stories, and actionable advice, we explore the psychological toll of social media and offer strategies to create healthier habits, foster genuine connections, and regain control over our digital lives.",
        price: 19,
        orignalProductSrc:
          "https://mentoons-comics.s3.ap-northeast-1.amazonaws.com/podcast/negative-impact-of-social-media.mp3",
        ageCategory: AgeCategory.TEEN,
        type: ProductType.PODCAST,
        product_type: "Free",
        tags: ["technology", "addiction", "news"],
        rating: 4.5,
        productImages: [
          {
            imageUrl: "/assets/images/negative-impact-of-social-media.jpg",
          },
        ],
        productVideos: [
          {
            videoUrl: "",
          },
        ],
        details: {
          category: "mobile addiction",
          episodeNumber: 1,
          duration: "2:12",
          language: "en",
          host: "Haaris Rueben",
          sampleUrl:
            "https://mentoons-comics.s3.ap-northeast-1.amazonaws.com/podcast/negative-impact-of-social-media.mp3",
          releaseDate: new Date("2024-02-15"),
        },
      },
      {
        title: "How does it feel to be an teenager",
        description:
          "Podcast on How Does It Feel to Be a Teenager explores the unique challenges and experiences of adolescence in today's fast-paced world. Each episode dives into topics like identity, peer pressure, mental health, and navigating relationships during this transformative phase of life. Featuring candid conversations with teens, experts, and influencers, we shed light on the emotions, struggles, and joys that come with being a teenager. Together, we'll provide insights and advice to help teens feel understood, empowered, and confident in their journey to adulthood.",
        price: 19,
        orignalProductSrc:
          "https://mentoons-comics.s3.ap-northeast-1.amazonaws.com/podcast/how-does-it-feet-to-be-an-teenager-orignals.mp3",
        ageCategory: AgeCategory.TEEN,
        type: ProductType.PODCAST,
        product_type: "Free",
        tags: ["technology", "addiction", "news"],
        rating: 4.5,
        productImages: [
          {
            imageUrl: "/assets/images/how-does-it-feel-to-be-teenager.jpg",
          },
        ],
        productVideos: [
          {
            videoUrl: "",
          },
        ],
        details: {
          category: "teen emotions",
          episodeNumber: 1,
          duration: "2:12",
          language: "en",
          host: "Haaris Rueben",
          sampleUrl:
            "https://mentoons-comics.s3.ap-northeast-1.amazonaws.com/podcast/how-does-it-feet-to-be-an-teenager-orignals.mp3",
          releaseDate: new Date("2024-02-15"),
        },
      },
      {
        title: "Performance Addiction",
        description:
          "Podcast on Performance Addiction explores the relentless pursuit of achievement and perfection in today's competitive culture. Each episode delves into how the pressure to constantly excel—whether in academics, career, or personal life—can lead to burnout, anxiety, and a diminished sense of self-worth. Through interviews with psychologists, performance coaches, and individuals who have struggled with this addiction, we unpack the harmful effects of an overemphasis on success and offer strategies to cultivate self-acceptance, balance, and fulfillment beyond mere performance.",
        price: 19,
        orignalProductSrc:
          "https://mentoons-comics.s3.ap-northeast-1.amazonaws.com/podcast/perfomance-addiction.mp3",
        ageCategory: AgeCategory.TEEN,
        type: ProductType.PODCAST,
        product_type: "Free",
        tags: ["technology", "addiction", "news"],
        rating: 4.5,
        productImages: [
          {
            imageUrl: "/assets/images/perfomance-addiction.jpg",
          },
        ],
        productVideos: [
          {
            videoUrl: "",
          },
        ],
        details: {
          category: "teen emotions",
          episodeNumber: 1,
          duration: "2:12",
          language: "en",
          host: "Haaris Rueben",
          sampleUrl:
            "https://mentoons-comics.s3.ap-northeast-1.amazonaws.com/podcast/perfomance-addiction.mp3",
          releaseDate: new Date("2024-02-15"),
        },
      },
      {
        title: "The Magic of play without phone",
        description:
          "Social Media Reward System delves into how platforms use rewards to keep users hooked. Understand the psychology behind likes, shares, and notifications in this eye-opening podcast.",
        price: 19,
        orignalProductSrc:
          "https://mentoons-comics.s3.ap-northeast-1.amazonaws.com/podcast/the-magic-of-play-without-phone.mp3",
        ageCategory: AgeCategory.CHILD,
        type: ProductType.PODCAST,
        product_type: "Prime",
        tags: ["technology", "addiction", "news"],
        rating: 4.5,
        productImages: [
          {
            imageUrl: "/assets/images/social-media-reward-system.jpg",
          },
        ],
        productVideos: [
          {
            videoUrl: "",
          },
        ],
        details: {
          category: "mobile addiction",
          episodeNumber: 1,
          duration: "2:12",
          language: "en",
          host: "Kisha Kothari",
          sampleUrl:
            "https://mentoons-comics.s3.ap-northeast-1.amazonaws.com/podcast/the-magic-of-play-without-phone.mp3",
          releaseDate: new Date("2024-02-15"),
        },
      },
      {
        title: "Common Parenting Mistake",
        description:
          "Podcast on Common Parenting Mistakes offers a compassionate and insightful look into the missteps many parents make in raising their children. Each episode explores topics like overprotection, inconsistency, unrealistic expectations, and miscommunication, revealing how these actions can impact a child's emotional and behavioral development. Through expert interviews and real-life anecdotes, we provide practical advice to help parents recognize and correct these mistakes, fostering healthier relationships, stronger communication, and a nurturing environment for their children to thrive..",
        price: 19,
        orignalProductSrc:
          "https://mentoons-comics.s3.ap-northeast-1.amazonaws.com/podcast/common-parrenting-mistake-orignals.mp3",
        ageCategory: AgeCategory.TEEN,
        type: ProductType.PODCAST,
        product_type: "Free",
        tags: ["technology", "addiction", "news"],
        rating: 4.5,
        productImages: [
          {
            imageUrl: "/assets/images/common-parenting-mistakes.jpg",
          },
        ],
        productVideos: [
          {
            videoUrl: "",
          },
        ],
        details: {
          category: "teen emotions",
          episodeNumber: 1,
          duration: "2:12",
          language: "en",
          host: "Kisha Kothari",
          sampleUrl:
            "https://mentoons-comics.s3.ap-northeast-1.amazonaws.com/podcast/common-parrenting-mistake-orignals.mp3",
          releaseDate: new Date("2024-02-15"),
        },
      },
      {
        title: "Entertainment Addiction",
        description:
          "Podcast on Entertainment Addiction delves into the growing dependency on entertainment and its impact on our daily lives. Each episode examines how excessive consumption of TV, video games, social media, and other forms of entertainment can lead to decreased productivity, social isolation, and mental health challenges. Through expert insights, personal stories, and practical tips, we explore ways to strike a healthier balance between entertainment and real-life responsibilities, fostering a more fulfilling and engaged lifestyle.",
        price: 19,
        orignalProductSrc:
          "https://mentoons-comics.s3.ap-northeast-1.amazonaws.com/podcast/entertainment-addiction-orignals.mp3",
        ageCategory: AgeCategory.TEEN,
        type: ProductType.PODCAST,
        product_type: "Prime",
        tags: ["technology", "addiction", "news"],
        rating: 4.5,
        productImages: [
          {
            imageUrl: "/assets/images/Entertainment_Addiction_ 2.jpg",
          },
        ],
        productVideos: [
          {
            videoUrl: "",
          },
        ],
        details: {
          category: "gaming addiction",
          episodeNumber: 1,
          duration: "2:12",
          language: "en",
          host: "Haaris Rueben",
          sampleUrl:
            "https://mentoons-comics.s3.ap-northeast-1.amazonaws.com/podcast/entertainment-addiction-orignals.mp3",
          releaseDate: new Date("2024-02-15"),
        },
      },
      {
        title: "Toddler phone Addiction",
        description:
          "Podcast on Toddler Phone Addiction investigates the effects of early exposure to screens on young children's development and behavior. Each episode explores how excessive phone use can impact toddlers' cognitive, social, and emotional growth, and offers insights into the challenges faced by parents in managing screen time. Through expert interviews, case studies, and practical advice, we provide strategies for creating healthy screen habits, encouraging interactive play, and supporting a balanced approach to technology in early childhood.",
        price: 19,
        orignalProductSrc:
          "https://mentoons-comics.s3.ap-northeast-1.amazonaws.com/podcast/toddler-phone-addiction.mp3",
        ageCategory: AgeCategory.CHILD,
        type: ProductType.PODCAST,
        product_type: "Prime",
        tags: ["technology", "addiction", "news"],
        rating: 4.5,
        productImages: [
          {
            imageUrl: "/assets/images/toddler-phone-addiction.jpg",
          },
        ],
        productVideos: [
          {
            videoUrl: "",
          },
        ],
        details: {
          category: "mobile addiction",
          episodeNumber: 1,
          duration: "2:12",
          language: "en",
          host: "Kisha Kothari",
          sampleUrl:
            "https://mentoons-comics.s3.ap-northeast-1.amazonaws.com/podcast/toddler-phone-addiction.mp3",
          releaseDate: new Date("2024-02-15"),
        },
      },
      {
        title: "Social media de-addiction",
        description:
          "Podcast on Social Media De-addiction explores the journey to breaking Free from the grips of excessive social media use. Each episode delves into the effects of social media addiction on mental health, relationships, and productivity, and offers practical advice for reclaiming control. Featuring insights from experts, personal success stories, and actionable strategies, we guide listeners through the process of reducing screen time, fostering healthier online habits, and finding a more balanced, fulfilling life beyond the screen.",
        price: 19,
        orignalProductSrc:
          "https://mentoons-comics.s3.ap-northeast-1.amazonaws.com/podcast/social-media-de-addiction-orignals.mp3",
        ageCategory: AgeCategory.TEEN,
        type: ProductType.PODCAST,
        product_type: "Prime",
        tags: ["technology", "addiction", "news"],
        rating: 4.5,
        productImages: [
          {
            imageUrl: "/assets/images/social-media-de-addiction.jpg",
          },
        ],
        productVideos: [
          {
            videoUrl: "",
          },
        ],
        details: {
          category: "mobile addiction",
          episodeNumber: 1,
          duration: "2:12",
          language: "en",
          host: "Kisha Kothari",
          sampleUrl:
            "https://mentoons-comics.s3.ap-northeast-1.amazonaws.com/podcast/social-media-de-addiction-orignals.mp3",
          releaseDate: new Date("2024-02-15"),
        },
      },
      {
        title: "Teen Emotions and Behavioural Problems",
        description:
          "Podcast on Teen Emotions and Behavioral Problems addresses the complex emotional and behavioral challenges faced by adolescents. Each episode explores issues such as mood swings, anxiety, defiance, and social pressures, providing a deep dive into the underlying causes and impacts. Through expert interviews, real-life stories, and practical advice, we aim to offer parents, educators, and teens themselves insights into managing and understanding these emotional and behavioral struggles, fostering a supportive environment for healthy growth and development.",
        price: 19,
        orignalProductSrc:
          "https://mentoons-comics.s3.ap-northeast-1.amazonaws.com/podcast/teen-emotional-and-behavioural-problems-orignals.mp3",
        ageCategory: AgeCategory.TEEN,
        type: ProductType.PODCAST,
        product_type: "Platinum",
        tags: ["technology", "addiction", "news"],
        rating: 4.5,
        productImages: [
          {
            imageUrl: "/assets/images/Teen_emotion_&_behaviour_problems_ 2.jpg",
          },
        ],
        productVideos: [
          {
            videoUrl: "",
          },
        ],
        details: {
          category: "teen emotions",
          episodeNumber: 1,
          duration: "2:12",
          language: "en",
          host: "Kisha Kothari",
          sampleUrl:
            "https://mentoons-comics.s3.ap-northeast-1.amazonaws.com/podcast/teen-emotional-and-behavioural-problems-orignals.mp3",
          releaseDate: new Date("2024-02-15"),
        },
      },
      {
        title: "The Magical Journey to self Discovery",
        description:
          "Podcast on The Magical Journey to Self-Discovery invites listeners to embark on a transformative exploration of personal growth and self-awareness. Each episode delves into various paths and practices that lead to uncovering one's true self, including mindfulness, introspection, and personal development strategies. Through inspiring stories, expert advice, and practical tips, we guide you through the process of self-discovery, helping you to embrace your strengths, understand your values, and navigate your unique journey toward a more fulfilling and authentic life.",
        price: 19,
        orignalProductSrc:
          "https://mentoons-comics.s3.ap-northeast-1.amazonaws.com/podcast/magical-journey-to-self-dicovery-orignals.mp3",
        ageCategory: AgeCategory.TEEN,
        type: ProductType.PODCAST,
        product_type: "Platinum",
        tags: ["technology", "addiction", "news"],
        rating: 4.5,
        productImages: [
          {
            imageUrl: "/assets/images/magical-journey-to-self-discovery.jpg",
          },
        ],
        productVideos: [
          {
            videoUrl: "",
          },
        ],
        details: {
          category: "teen emotions",
          episodeNumber: 1,
          duration: "2:12",
          language: "en",
          host: "Kisha Kothari",
          sampleUrl:
            "https://mentoons-comics.s3.ap-northeast-1.amazonaws.com/podcast/magical-journey-to-self-dicovery-orignals.mp3",
          releaseDate: new Date("2024-02-15"),
        },
      },
      {
        title: "Maintaining relationship with teenager",
        description:
          "Podcast on Maintaining a Relationship with Your Teenager explores effective strategies for building and sustaining strong connections with adolescents. Each episode addresses common challenges in parent-teen relationships, such as communication barriers, conflicts, and evolving dynamics. Through expert advice, real-life experiences, and practical tips, we provide guidance on fostering trust, understanding, and open dialogue. Whether you're navigating tricky conversations or seeking ways to support and connect with your teenager, this podcast offers valuable insights for maintaining a healthy and positive relationship throughout the teenage years.",
        price: 19,
        orignalProductSrc:
          "https://mentoons-comics.s3.ap-northeast-1.amazonaws.com/podcast/maintaining-relationship-with-teenager-orignals.mp3",
        ageCategory: AgeCategory.TEEN,
        type: ProductType.PODCAST,
        product_type: "Platinum",

        tags: ["technology", "addiction", "news"],
        rating: 4.5,
        productImages: [
          {
            imageUrl: "/assets/images/maintain-relationship-with-teen.jpg",
          },
        ],
        productVideos: [
          {
            videoUrl: "",
          },
        ],
        details: {
          category: "teen emotions",
          episodeNumber: 1,
          duration: "2:12",
          language: "en",
          host: "Kisha Kothari",
          sampleUrl:
            "https://mentoons-comics.s3.ap-northeast-1.amazonaws.com/podcast/maintaining-relationship-with-teenager-orignals.mp3",
          releaseDate: new Date("2024-02-15"),
        },
      },
      {
        title:
          "Phrases and sentences parents should not speak in front of children",
        description:
          "Podcast on Phrases and Sentences Parents Should Not Speak in Front of Children focuses on the impact of language on a child's emotional and psychological development. Each episode examines common phrases and statements that can negatively affect self-esteem, behavior, and family dynamics. Through expert insights, real-life examples, and practical advice, we guide parents on how to communicate more effectively and positively. We offer alternative approaches to help foster a supportive and nurturing environment for children to thrive emotionally and mentally.",
        price: 19,
        orignalProductSrc:
          "https://mentoons-comics.s3.ap-northeast-1.amazonaws.com/podcast/phrases-sentences-orignals.mp3",
        ageCategory: AgeCategory.TEEN,
        type: ProductType.PODCAST,
        product_type: "Platinum",
        tags: ["technology", "addiction", "news"],
        rating: 4.5,
        productImages: [
          {
            imageUrl: "/assets/images/Phrases_and_sentences_parents.jpg",
          },
        ],
        productVideos: [
          {
            videoUrl: "",
          },
        ],
        details: {
          category: "teen emotions",
          episodeNumber: 1,
          duration: "2:12",
          language: "en",
          host: "Kisha Kothari",
          sampleUrl:
            "https://mentoons-comics.s3.ap-northeast-1.amazonaws.com/podcast/phrases-sentences-orignals.mp3",
          releaseDate: new Date("2024-02-15"),
        },
      },
      {
        title: "Role Model For Kids",
        description:
          "Podcast on Role Model for Kids explores the vital role that positive role models play in a child's development. Each episode highlights how behaviors, values, and attitudes demonstrated by parents, caregivers, and other influential figures can shape a child's character and aspirations. Through expert interviews, inspiring stories, and actionable advice, we discuss ways to model integrity, resilience, and kindness. This podcast provides practical tips for adults to embody the qualities they hope to instill in children, helping them become confident, responsible, and compassionate individuals.",
        price: 19,
        orignalProductSrc:
          "https://mentoons-comics.s3.ap-northeast-1.amazonaws.com/podcast/role-models-for-kid-orignals.mp3",
        ageCategory: AgeCategory.TEEN,
        type: ProductType.PODCAST,
        product_type: "Platinum",
        tags: ["technology", "addiction", "news"],
        rating: 4.5,
        productImages: [
          {
            imageUrl: "/assets/images/Role_Model_For_Kids_.jpg",
          },
        ],
        productVideos: [
          {
            videoUrl: "",
          },
        ],
        details: {
          category: "teen emotions",
          episodeNumber: 1,
          duration: "2:12",
          language: "en",
          host: "Kisha Kothari",
          sampleUrl:
            "https://mentoons-comics.s3.ap-northeast-1.amazonaws.com/podcast/role-models-for-kid-orignals.mp3",
          releaseDate: new Date("2024-02-15"),
        },
      },
      {
        title: "Things parents do that annoy kids",
        description:
          "Podcast on Things Parents Do That Annoy Kids dives into the everyday behaviors and habits that can frustrate or alienate children and teens. Each episode explores common parental actions and comments—such as overbearing advice, inconsistent rules, or interruptions of personal space—that can lead to conflicts and misunderstandings. Through expert insights, real-life anecdotes, and practical tips, we offer strategies for parents to improve communication, foster mutual respect, and build stronger, more harmonious relationships with their children.",
        price: 19,
        orignalProductSrc:
          "https://mentoons-comics.s3.ap-northeast-1.amazonaws.com/podcast/things-parents-do-that-annoy-kids-orignals.mp3",
        ageCategory: AgeCategory.TEEN,
        type: ProductType.PODCAST,
        product_type: "Prime",
        tags: ["technology", "addiction", "news"],
        rating: 4.5,
        productImages: [
          {
            imageUrl: "/assets/images/Things_parents_do_that_annoy_kids 2.jpg",
          },
        ],
        productVideos: [
          {
            videoUrl: "",
          },
        ],
        details: {
          category: "teen emotions",
          episodeNumber: 1,
          duration: "2:12",
          language: "en",
          host: "Kisha Kothari",
          sampleUrl:
            "https://mentoons-comics.s3.ap-northeast-1.amazonaws.com/podcast/things-parents-do-that-annoy-kids-orignals.mp3",
          releaseDate: new Date("2024-02-15"),
        },
      },
      {
        title: "Electronic gadgets and kids.",
        description:
          "Podcast on Electronic Gadgets and Kids examines the impact of digital devices on children's development and daily lives. Each episode explores how smartphones, tablets, and other gadgets influence aspects such as cognitive development, social skills, and physical health. Through expert interviews, research findings, and practical advice, we address the benefits and potential drawbacks of technology use, offering strategies for setting healthy boundaries and encouraging balanced screen time. Our goal is to help parents and caregivers navigate the digital landscape to support their children's overall well-being and growth.",
        price: 19,
        orignalProductSrc:
          "https://mentoons-comics.s3.ap-northeast-1.amazonaws.com/podcast/electronic-gadgets-and-kids-orignals.mp3",
        ageCategory: AgeCategory.CHILD,
        type: ProductType.PODCAST,
        product_type: "Platinum",
        tags: ["technology", "addiction", "news"],
        rating: 4.5,
        productImages: [
          {
            imageUrl: "/assets/images/Electronic_Gadgets_.jpg",
          },
        ],
        productVideos: [
          {
            videoUrl: "",
          },
        ],
        details: {
          category: "mobile addiction",
          episodeNumber: 1,
          duration: "2:12",
          language: "en",
          host: "Haaris Rueben",
          sampleUrl:
            "https://mentoons-comics.s3.ap-northeast-1.amazonaws.com/podcast/electronic-gadgets-and-kids-orignals.mp3",
          releaseDate: new Date("2024-02-15"),
        },
      },
      {
        title: "Reconnecting Gen-Z with value beyond the screen.",
        description:
          "Helping Gen-Z rediscover meaningful connections and life experiences beyond digital screens, fostering deeper relationships and personal growth in a tech-driven world.",
        price: 19,
        orignalProductSrc:
          "https://mentoons-comics.s3.ap-northeast-1.amazonaws.com/podcast/negative_impact_of_mobile.mp3",
        ageCategory: AgeCategory.TEEN,
        type: ProductType.PODCAST,
        product_type: "Platinum",
        tags: ["technology", "addiction", "news"],
        rating: 4.5,
        productImages: [
          {
            imageUrl:
              "https://mentoons-products.s3.ap-northeast-1.amazonaws.com/Products/thumbnails/Reconnecting+gen+Z+with+value+beyond+the+screen+.png",
          },
        ],
        productVideos: [
          {
            videoUrl: "",
          },
        ],
        details: {
          category: "mobile addiction",
          episodeNumber: 1,
          duration: "2:12",
          language: "en",
          host: "Haaris Rueben",
          sampleUrl:
            "https://mentoons-comics.s3.ap-northeast-1.amazonaws.com/podcast/reconnecting-genz-with-value-beyond-the-screen.mp3",
          releaseDate: new Date("2024-02-15"),
        },
      },
      {
        title: "Fun beyond video games",
        description:
          "Helping Gen-Z rediscover meaningful connections and life experiences beyond digital screens, fostering deeper relationships and personal growth in a tech-driven world.",
        price: 19,
        orignalProductSrc:
          "https://mentoons-comics.s3.ap-northeast-1.amazonaws.com/podcast/fun-beyond-video-game.mp3",
        ageCategory: AgeCategory.TEEN,
        type: ProductType.PODCAST,
        product_type: "Platinum",
        tags: ["technology", "addiction", "news"],
        rating: 4.5,
        productImages: [
          {
            imageUrl:
              "https://mentoons-products.s3.ap-northeast-1.amazonaws.com/Products/thumbnails/Fun+beyond+Games.png",
          },
        ],
        productVideos: [
          {
            videoUrl: "",
          },
        ],
        details: {
          category: "gaming addiction",
          episodeNumber: 1,
          duration: "2:12",
          language: "en",
          host: "Kisha Kothari",
          sampleUrl:
            "https://mentoons-comics.s3.ap-northeast-1.amazonaws.com/podcast/fun-beyond-video-game.mp3",
          releaseDate: new Date("2024-02-15"),
        },
      },
      {
        title: "How to Maintain Healthy Relations",
        description:
          "Podcast on maintaining healthy relationship .A healty realtionship is where you feel the comfort trusted support each other and wellcome",
        price: 19,
        orignalProductSrc:
          "https://mentoons-comics.s3.ap-northeast-1.amazonaws.com/podcast/how-to-maintain-healthy-relations.mp3",
        ageCategory: AgeCategory.TEEN,
        type: ProductType.PODCAST,
        product_type: "Platinum",
        tags: ["Health", "relation", "news"],
        rating: 4.5,
        productImages: [
          {
            imageUrl:
              "https://mentoons-products.s3.ap-northeast-1.amazonaws.com/Products/thumbnails/How+to+maintain+Healthy+Relations+.png",
          },
        ],
        productVideos: [
          {
            videoUrl: "",
          },
        ],
        details: {
          category: "teen emotions",
          episodeNumber: 1,
          duration: "2:12",
          language: "en",
          host: "Kisha Kothari",
          sampleUrl:
            "https://mentoons-comics.s3.ap-northeast-1.amazonaws.com/podcast/how-to-maintain-healthy-relations.mp3",
          releaseDate: new Date("2024-02-15"),
        },
      },
    ]);

    // // Create Workshops
    // const workshops = await Workshop.create([
    //   {
    //     title: "Comic Creation Masterclass",
    //     description: "Learn to create your own comics",
    //     price: 19,
    //     ageCategory: AgeCategory.TEEN,
    //     tags: ["education", "art", "comics"],
    //     details: {
    //       instructor: "Emily Chen",
    //       location: "Online",
    //       schedule: new Date("2024-03-01T15:00:00Z"),
    //       duration: 3, // hours
    //       capacity: 20,
    //       materials: ["sketchbook", "pencils", "digital tablet"],
    //     },
    //   },
    // ]);

    // // Create Assessments
    const assessments = await Assessment.create([
      {
        title: "Psychological Emotions (Therapy) ",
        description:
          "Valuable insights into maintaining professional behavior and building career success.",
        price: 10,
        originalProductSrc: "",
        ageCategory: AgeCategory.ADULT,
        type: ProductType.ASSESSMENT,
        tags: [
          "emotional well-being",
          "family values",
          "relationship dynamics",
        ],
        rating: 4.5,
        productImages: [
          {
            imageUrl: "/assets/assesments/thumbnails/therapy.png",
          },
        ],
        productVideos: [
          {
            videoUrl: "",
          },
        ],
        isFeatured: true,
        details: {
          color: "#652D90",
          duration: 10, // minutes
          difficulty: "College Students",
          credits: "Mentoons",
          questionGallery: [
            {
              imageUrl: "/assets/assesments/Therapy/therapy-01.JPG",
              options: [
                "Everyone approaches me with their problems.",
                "I don't allow anyone to share their problems with me.",
              ],
              correctAnswer: "Everyone approaches me with their problems.",
            },
            {
              imageUrl: "/assets/assesments/Therapy/therapy-02.JPG",
              options: [
                "The teacher recommended therapy for everyone.",
                "A few students and i were exempted from therapy.",
              ],
              correctAnswer: "A few students and i were exempted from therapy.",
            },
            {
              imageUrl: "/assets/assesments/Therapy/therapy-03.JPG",
              options: [
                "Very few are seeking therpay.",
                "None of us gose for therapy.",
              ],
              correctAnswer: "None of us gose for therapy.",
            },
            {
              imageUrl: "/assets/assesments/Therapy/therapy-04.JPG",
              options: ["It works wonderful on me.", "It has no impact on me."],
              corrctAnswer: "It works wonderful on me.",
            },
            {
              imageUrl: "/assets/assesments/Therapy/therapy-05.JPG",
              options: [
                "I feel sorted and peaceful.",
                "Therapy makes me more confused",
              ],
              correctAnswer: "Therapy makes me more confused",
            },
            {
              imageUrl: "/assets/assesments/Therapy/therapy-06.JPG",
              options: ["Absolutely", "Not necessarily"],
              correctAnswer: "Absolutely",
            },

            {
              imageUrl: "/assets/assesments/Therapy/therapy-07.JPG",
              options: [
                "But it's very expensive",
                "My parents won't allow it.",
              ],
              correctAnswer: "My parents won't allow it.",
            },
            {
              imageUrl: "/assets/assesments/Therapy/therapy-08.JPG",
              options: [
                "I feel better after spending time with my friends.",
                "Even my friends cannot help with my situation.",
              ],
              correctAnswer: "Even my friends cannot help with my situation.",
            },
            {
              imageUrl: "/assets/assesments/Therapy/therapy-09.JPG",
              options: ["Therapy helped me.", "Nothing worked on me."],
              correctAnswer: "Nothing worked on me.",
            },
            {
              imageUrl: "/assets/assesments/Therapy/therapy-10.JPG",
              options: [
                "I am scared to tell my parents",
                "My parents gladdly welcomed me sharing the idea.",
              ],
              correctAnswer: "My parents gladdly welcomed me sharing the idea.",
            },
          ],
        },
      },

      {
        title: "Psychological Emotions (Self Reflection)",
        description:
          "Uncover your strengths, traits, and behaviors to better understand yourself.",
        price: 15,
        originalProductSrc: "",
        ageCategory: AgeCategory.ADULT,
        type: ProductType.ASSESSMENT,
        tags: [
          "emotional well-being",
          "family values",
          "relationship dynamics",
        ],
        rating: 4.5,
        productImages: [
          {
            imageUrl: "/assets/assesments/thumbnails/self-reflection.png",
          },
        ],
        productVideos: [
          {
            videoUrl: "",
          },
        ],
        isFeatured: false,
        details: {
          color: "#F7941D",
          duration: 10, // minutes
          difficulty: "Individuals from any background",
          credits: "Mentoons",
          questionGallery: [
            {
              imageUrl:
                "/assets/assesments/Self Reflection/self-reflection-01.JPG",
              options: [
                "I wish i continue my career.",
                "I have a balanced life now.",
              ],
              correctAnswer: "I wish i continue my career.",
            },
            {
              imageUrl:
                "/assets/assesments/Self Reflection/self-reflection-02.JPG",
              options: [
                "I miss being a pilot",
                "I am happy serving as a doctor.",
              ],
              correctAnswer: "I am happy serving as a doctor.",
            },
            {
              imageUrl:
                "/assets/assesments/Self Reflection/self-reflection-03.JPG",
              options: [
                "To save my friendship, I will listen adn console.",
                "I will fight for my rights even at the cost of my friendship.",
              ],
              correctAnswer:
                "I will fight for my rights even at the cost of my friendship.",
            },
            {
              imageUrl:
                "/assets/assesments/Self Reflection/self-reflection-04.JPG",
              options: [
                "I miss my friend and try to reconnect.",
                "I focus on making new friends.",
              ],
              correctAnswer: "I focus on making new friends.",
            },
            {
              imageUrl:
                "/assets/assesments/Self Reflection/self-reflection-05.JPG",
              options: [
                "I think about what to do next.",
                "I feel bad and do nothing.",
              ],
              correctAnswer: "I think about what to do next.",
            },
            {
              imageUrl:
                "/assets/assesments/Self Reflection/self-reflection-06.JPG",
              options: ["I am diet conscious.", "I am a foodie."],
              correctAnswer: "I am diet conscious.",
            },
            {
              imageUrl:
                "/assets/assesments/Self Reflection/self-reflection-07.JPG",
              options: [
                "I am okay with hugging once in while.",
                "I hate beign touched or hugged.",
              ],
              correctAnswer: "I hate beign touched or hugged.",
            },
            {
              imageUrl:
                "/assets/assesments/Self Reflection/self-reflection-08.JPG",
              options: [
                "I celebrate with my friends",
                "I just share my happiness online.",
              ],
              correctAnswer: "I celebrate with my friends",
            },
            {
              imageUrl:
                "/assets/assesments/Self Reflection/self-reflection-09.JPG",
              options: [
                "I have will to fight back",
                "I sulk and accept defeat.",
              ],
              correctAnswer: "I have will to fight back",
            },
            {
              imageUrl:
                "/assets/assesments/Self Reflection/self-reflection-10.JPG",
              options: [
                "I know i won't be able to finish task, so I won't even try.",
                " I'll listen to my father and complete it.",
              ],
              correctAnswer: " I'll listen to my father and complete it.",
            },
          ],
        },
      },
      {
        title: "Psychological Emotions (Meditation) ",
        description:
          "Evaluate your emotional intelligence and social skills for better relationships and interactions.",
        price: 10,
        originalProductSrc: "",
        ageCategory: AgeCategory.ADULT,
        type: ProductType.ASSESSMENT,
        tags: [
          "emotional well-being",
          "family values",
          "relationship dynamics",
        ],
        rating: 4.5,
        productImages: [
          {
            imageUrl: "/assets/assesments/thumbnails/meditation.png",
          },
        ],
        productVideos: [
          {
            videoUrl: "",
          },
        ],
        isFeatured: false,
        details: {
          color: "#F7941D",
          duration: 10, // minutes
          difficulty: "College Students",
          credits: "Mentoons",
          questionGallery: [
            {
              imageUrl: "/assets/assesments/Meditation/meditation-01.JPG",
              options: ["Meditation helps me.", "Meditation doesn't help me."],
              correctAnswer: "Meditation helps me.",
            },
            {
              imageUrl: "/assets/assesments/Meditation/meditation-02.JPG",
              options: [
                "Meditation helps me overcome stress.",
                "Meditation does not helps me",
              ],
              correctAnswer: "Meditation helps me overcome stress.",
            },
            {
              imageUrl: "/assets/assesments/Meditation/meditation-03.JPG",
              options: [
                "I remember things better.",
                "I forgot things even after meditating.",
              ],
              correctAnswer: "I remember things better.",
            },
            {
              imageUrl: "/assets/assesments/Meditation/meditation-04.JPG",
              options: ["Reduce stress and anxiety", "Get better sleep"],
              correctAnswer: "Reduce stress and anxiety",
            },
            {
              imageUrl: "/assets/assesments/Meditation/meditation-05.JPG",
              options: [
                "I feel pain in my lower back",
                "I feel calm and deeply relaxed.",
              ],
              correctAnswer: "I feel calm and deeply relaxed.",
            },
            {
              imageUrl: "/assets/assesments/Meditation/meditation-06.JPG",
              options: ["Very effective.", "Didn't work for me."],
              correctAnswer: "Very effective.",
            },
            {
              imageUrl: "/assets/assesments/Meditation/meditation-07.JPG",
              options: [
                "Helps me understand myself better",
                "Increase positive feeling toward other.",
              ],
              correctAnswer: "Helps me understand myself better",
            },
            {
              imageUrl: "/assets/assesments/Meditation/meditation-08.JPG",
              options: ["It works for me.", "It doesn't work for me."],
              correctAnswer: "It works for me.",
            },
            {
              imageUrl: "/assets/assesments/Meditation/meditation-09.JPG",
              options: [
                "It boosts my thinking.",
                "It's not effective. for me.",
              ],
              correctAnswer: "It boosts my thinking.",
            },
            {
              imageUrl: "/assets/assesments/Meditation/meditation-10.JPG",
              options: ["It improves my focus.", "It doesn't help me."],
              correctAnswer: "It improves my focus.",
            },
          ],
        },
      },
      {
        title: "Physical Emotion",
        description:
          "Valuable insights into maintaining professional behavior and building career success.",
        price: 15,
        originalProductSrc: "",
        ageCategory: AgeCategory.ADULT,
        type: ProductType.ASSESSMENT,
        tags: [
          "emotional well-being",
          "family values",
          "relationship dynamics",
        ],
        rating: 4.5,
        productImages: [
          {
            imageUrl: "/assets/assesments/thumbnails/physical-emotion.png",
          },
        ],
        productVideos: [
          {
            videoUrl: "",
          },
        ],
        isFeatured: false,
        details: {
          color: "#652D90",
          duration: 10, // minutes
          difficulty: "Individuals from any background",
          credits: "Mentoons",
          questionGallery: [
            {
              imageUrl:
                "/assets/assesments/Physical emotions/physical-emotion-01.jpg",
              options: [
                "The girl dosen't have any issue with kissing",
                "In an engagement, the girl avoids kissing in front of relatives.",
              ],
              correctAnswer: "The girl dosen't have any issue with kissing",
            },
            {
              imageUrl:
                "/assets/assesments/Physical emotions/physical-emotion-02.jpg",
              options: [
                "In my house, I prefer to study. My parents take care of my grandmother and take her to regular checkups",
                "I will take medical responsibility and give my parents a break",
              ],
              correctAnswer:
                "I will take medical responsibility and give my parents a break",
            },
            {
              imageUrl:
                "/assets/assesments/Physical emotions/physical-emotion-03.jpg",
              options: [
                "I get to take a body massage, I feel relaxed.",
                "I don't enjoy body massage.",
              ],
              correctAnswer: "I get to take a body massage, I feel relaxed.",
            },
            {
              imageUrl:
                "/assets/assesments/Physical emotions/physical-emotion-04.jpg",
              options: [
                "I follow a proper gym routine and take proteins on time.",
                "I avoid taking proteins.",
              ],
              correctAnswer:
                "I follow a proper gym routine and take proteins on time.",
            },
            {
              imageUrl:
                "/assets/assesments/Physical emotions/physical-emotion-05.jpg",
              options: [
                "I enjoy holding hands while walking, It feels so good.",
                "I don't like holding hands in public.",
              ],
              correctAnswer:
                "I enjoy holding hands while walking, It feels so good.",
            },
          ],
        },
      },
      {
        title: "Physical Emotion (Eat Healthy)",
        description:
          "Uncover your strengths, traits, and behaviors to better understand yourself.",
        price: 10,
        originalProductSrc: "",
        ageCategory: AgeCategory.ADULT,
        type: ProductType.ASSESSMENT,
        tags: [
          "emotional well-being",
          "family values",
          "relationship dynamics",
        ],
        rating: 4.5,
        productImages: [
          {
            imageUrl: "/assets/assesments/thumbnails/eat-healthy.png",
          },
        ],
        productVideos: [
          {
            videoUrl: "",
          },
        ],
        isFeatured: false,
        details: {
          color: "#652D90",
          duration: 10, // minutes
          difficulty: "College Students",
          credits: "Mentoons",
          questionGallery: [
            {
              imageUrl: "/assets/assesments/Eat healthy/eat-healthy-01.jpg",
              options: [
                "I'll make a quick salad.",
                "I'll order a fried chicken.",
              ],
              correctAnswer: "I'll make a quick salad.",
            },
            {
              imageUrl: "/assets/assesments/Eat healthy/eat-healthy-02.jpg",
              options: [
                "I'll enjoy a fruit salad",
                "I'll eat ice cream or cake.",
              ],
              correctAnswer: "I'll enjoy a fruit salad",
            },
            {
              imageUrl: "/assets/assesments/Eat healthy/eat-healthy-03.jpg",
              options: [
                "I'll use olive oil or avocado as a topping",
                "I'll add mayonnaise or creamy dressings",
              ],
              correctAnswer: "I'll use olive oil or avocado as a topping",
            },
            {
              imageUrl: "/assets/assesments/Eat healthy/eat-healthy-04.jpg",
              options: [
                "I dringk water or buttermilk.",
                "I drink cola or sugary drinks.",
              ],
              correctAnswer: "I dringk water or buttermilk.",
            },
            {
              imageUrl: "/assets/assesments/Eat healthy/eat-healthy-05.jpg",
              options: [
                "I eat roti, rice, dal, and sabzi",
                "I eat biryani or fried snacks.",
              ],
              correctAnswer: "I eat roti, rice, dal, and sabzi",
            },
            {
              imageUrl: "/assets/assesments/Eat healthy/eat-healthy-06.jpg",
              options: ["I'll eat fresh fruit", "I'll have a milkshake."],
              correctAnswer: "I'll eat fresh fruit",
            },
            {
              imageUrl: "/assets/assesments/Eat healthy/eat-healthy-07.jpg",
              options: ["I'll cook veggies and chicken", "I'll order pizza."],
              correctAnswer: "I'll cook veggies and chicken",
            },
            {
              imageUrl: "/assets/assesments/Eat healthy/eat-healthy-08.jpg",
              options: [
                "I have a piece of dark chocolate",
                "I have laddu and or a lot of sweets.",
              ],
              correctAnswer: "I have a piece of dark chocolate",
            },
            {
              imageUrl: "/assets/assesments/Eat healthy/eat-healthy-09.JPG",
              options: [
                "I ordered a single slice to satisfy craving.",
                "I ordered three slices of pizza to feel full.",
              ],
              correctAnswer: "I ordered a single slice to satisfy craving.",
            },
            {
              imageUrl: "/assets/assesments/Eat healthy/eat-healthy-10.JPG",
              options: [
                "Low-fat noodles and snacks with Diet Coke.",
                "A proper balanced meal full of nutrients.",
              ],
              correctAnswer: "A proper balanced meal full of nutrients.",
            },
          ],
        },
      },
      {
        title: "Opinion Assesment",
        description:
          "Evaluate your emotional intelligence and social skills for better relationships and interactions.",
        price: 10,
        originalProductSrc: "",
        ageCategory: AgeCategory.ADULT,
        type: ProductType.ASSESSMENT,
        tags: [
          "emotional well-being",
          "family values",
          "relationship dynamics",
        ],
        rating: 4.5,
        productImages: [
          {
            imageUrl: "/assets/assesments/thumbnails/opinions.png",
          },
        ],
        productVideos: [
          {
            videoUrl: "",
          },
        ],
        isFeatured: false,
        details: {
          color: "#652D90",
          duration: 10, // minutes
          difficulty: "College Students",
          credits: "Mentoons",
          questionGallery: [
            {
              imageUrl: "/assets/assesments/opinions/opinion-01.png",
              options: ["I give one clear opinion.", "I give 2 or 3 opinions."],
              correctAnswer: "I give one clear opinion.",
            },
            {
              imageUrl: "/assets/assesments/opinions/opinion-02.png",
              options: [
                "I share it, no matter what.",
                "I share it only when asked.",
              ],
              correctAnswer: "I share it, no matter what.",
            },
            {
              imageUrl: "/assets/assesments/opinions/opinion-03.png",
              options: ["Real friends.", "Online friends."],
              correctAnswer: "Real friends.",
            },
            {
              imageUrl: "/assets/assesments/opinions/opinion-04.png",
              options: ["I ignore it.", "I give my opinion."],
              correctAnswer: "I give my opinion.",
            },
            {
              imageUrl: "/assets/assesments/opinions/opinion-05.png",
              options: ["I feel scared.", "I feel comfortable."],
              correctAnswer: "I feel comfortable.",
            },
            {
              imageUrl: "/assets/assesments/opinions/opinion-06.png",
              options: ["I ignore all of them.", "I take selectively"],
              correctAnswer: "I take selectively",
            },
            {
              imageUrl: "/assets/assesments/opinions/opinion-07.png",
              options: [
                "I'm very vocal about it.",
                "I prefer to keep it to myself",
              ],
              correctAnswer: "I'm very vocal about it.",
            },
            {
              imageUrl: "/assets/assesments/opinions/opinion-08.png",
              options: ["Yes, it is", "No, it's isn't"],
              correctAnswer: "Yes, it is",
            },
            {
              imageUrl: "/assets/assesments/opinions/opinion-09.png",
              options: ["Yes, it is.", "No it isn't."],
              correctAnswer: "Yes, it is.",
            },
            {
              imageUrl: "/assets/assesments/opinions/opinion-10.png",
              options: ["I give my own opinion.", "I follow other's opinions."],
              correctAnswer: "I give my own opinion.",
            },
          ],
        },
      },
      {
        title: "Exercise Assesment",
        description:
          "Valuable insights into maintaining professional behavior and building career success.",
        price: 10,
        originalProductSrc: "",
        ageCategory: AgeCategory.ADULT,
        type: ProductType.ASSESSMENT,
        tags: [
          "emotional well-being",
          "family values",
          "relationship dynamics",
        ],
        rating: 4.5,
        productImages: [
          {
            imageUrl: "/assets/assesments/thumbnails/exercise.png",
          },
        ],
        productVideos: [
          {
            videoUrl: "",
          },
        ],
        isFeatured: false,
        details: {
          color: "#F7941D",
          duration: 10, // minutes
          difficulty: "College Students",
          credits: "Mentoons",
          questionGallery: [
            {
              imageUrl: "/assets/assesments/Exercise/exercise-01.jpg",
              options: ["I'm ready to exercise", "I want to sleep more"],
              correctAnswer: "I'm ready to exercise",
            },
            {
              imageUrl: "/assets/assesments/Exercise/exercise-02.jpg",
              options: ["I'm excited", "I don't feel likt it"],
              correctAnswer: "I'm excited",
            },
            {
              imageUrl: "/assets/assesments/Exercise/exercise-03.jpg",
              options: ["I'm motivated", "I feel lazy."],
              correctAnswer: "I'm motivated",
            },
            {
              imageUrl: "/assets/assesments/Exercise/exercise-04.jpg",
              options: ["I feel strong", "I want to stop"],
              correctAnswer: "I feel strong",
            },
            {
              imageUrl: "/assets/assesments/Exercise/exercise-05.jpg",
              options: ["I feel great", "I'm exhausted"],
              correctAnswer: "I feel great",
            },
            {
              imageUrl: "/assets/assesments/Exercise/exercise-06.jpg",
              options: ["I stretch or walk", "I sit and relax"],
              correctAnswer: "I stretch or walk",
            },
            {
              imageUrl: "/assets/assesments/Exercise/exercise-07.jpg",
              options: [
                "I feel good and want to exercise",
                "I feel tired and prefer to rest.",
              ],
              correctAnswer: "I feel good and want to exercise",
            },
            {
              imageUrl: "/assets/assesments/Exercise/exercise-08.jpg",
              options: [
                "I'll do it in the evening",
                "I'll skip it for today and rest",
              ],
              correctAnswer: "I'll do it in the evening",
            },
            {
              imageUrl: "/assets/assesments/Exercise/exercise-09.jpg",
              options: ["I'll skip the workout", "I'll try to work out anyway"],
              correctAnswer: "I'll try to work out anyway",
            },
            {
              imageUrl: "/assets/assesments/Exercise/exercise-10.JPG",
              options: [
                "I go to sleep by 9 PM and wake up in the morining",
                "I have irregular sleep because I wake up at night due to notificaitons.",
              ],
              correctAnswer:
                "I go to sleep by 9 PM and wake up in the morining",
            },
          ],
        },
      },
      {
        title: "Behavioural Assesment",
        description:
          "Uncover your strengths, traits, and behaviors to better understand yourself.",
        price: 10,
        originalProductSrc: "",
        ageCategory: AgeCategory.ADULT,
        type: ProductType.ASSESSMENT,
        tags: [
          "emotional well-being",
          "family values",
          "relationship dynamics",
        ],
        rating: 4.5,
        productImages: [
          {
            imageUrl: "/assets/assesments/thumbnails/behaviour.png",
          },
        ],
        productVideos: [
          {
            videoUrl: "",
          },
        ],
        isFeatured: false,
        details: {
          color: "#F7941D",
          duration: 10, // minutes
          difficulty: "College Students",
          credits: "Mentoons",
          questionGallery: [
            {
              imageUrl: "/assets/assesments/Behaviours/behavioural-01.jpg",
              options: [
                "I worry I can't finish everything on time.",
                "I feel I have to do everything perfectly.",
              ],
              correctAnswer: "I worry I can't finish everything on time.",
            },
            {
              imageUrl: "/assets/assesments/Behaviours/behavioural-02.jpg",
              options: [
                "I try to stay polite and calm.",
                "I struggle to control my behaviour because of how i feel.",
              ],
              correctAnswer: "I try to stay polite and calm.",
            },
            {
              imageUrl: "/assets/assesments/Behaviours/behavioural-03.jpg",
              options: [
                "How can i help you? Are you hurt?",
                "Why weren't you paying attention?",
              ],
              correctAnswer: "How can i help you? Are you hurt?",
            },
            {
              imageUrl: "/assets/assesments/Behaviours/behavioural-04.jpg",
              options: [
                "I feel really sad all the time",
                "I feel like everything is too hard to enjoy",
              ],
              correctAnswer: "I feel really sad all the time",
            },
            {
              imageUrl: "/assets/assesments/Behaviours/behavioural-05.jpg",
              options: [
                "I will simply put the balance in my wallet without checking",
                "I will check the balance twice",
              ],
              correctAnswer:
                "I will simply put the balance in my wallet without checking",
            },
            {
              imageUrl: "/assets/assesments/Behaviours/behavioural-06.jpg",
              options: [
                "I engage in my hobbies, and I feel happy and fulfilled",
                "I don't have any particular hobbies that interest me.",
              ],
              correctAnswer:
                "I engage in my hobbies, and I feel happy and fulfilled",
            },
            {
              imageUrl: "/assets/assesments/Behaviours/behavioural-07.jpg",
              options: [
                "I am very comfortable staying alone",
                "I am not comfortable being with others",
              ],
              correctAnswer: "I am very comfortable staying alone",
            },
            {
              imageUrl: "/assets/assesments/Behaviours/behavioural-08.jpg",
              options: [
                "I can recall things, but it take effort",
                "I struggle to remember even simple things",
              ],
              correctAnswer: "I can recall things, but it take effort",
            },
            {
              imageUrl: "/assets/assesments/Behaviours/behavioural-09.jpg",
              options: [
                "I have to many thoughts running through my mind",
                "I don't feel tired enough to sleep",
              ],
              correctAnswer: "I have to many thoughts running through my mind",
            },
            {
              imageUrl: "/assets/assesments/Behaviours/behavioural-10.jpg",
              options: [
                "I chat with the person next",
                "You keep your eye on the phone",
              ],
              correctAnswer: "I chat with the person next",
            },
          ],
        },
      },
      {
        title: "Opinion Assesment",
        description:
          "Evaluate your emotional intelligence and social skills for better relationships and interactions.",
        price: 10,
        originalProductSrc: "",
        ageCategory: AgeCategory.ADULT,
        type: ProductType.ASSESSMENT,
        tags: [
          "emotional well-being",
          "family values",
          "relationship dynamics",
        ],
        rating: 4.5,
        productImages: [
          {
            imageUrl: "/assets/assesments/thumbnails/opinions.png",
          },
        ],
        productVideos: [
          {
            videoUrl: "",
          },
        ],
        isFeatured: false,
        details: {
          color: "#652D90",
          duration: 10, // minutes
          difficulty: "College Students",
          credits: "Mentoons",
          questionGallery: [
            {
              imageUrl: "/assets/assesments/opinions/opinion-01.png",
              options: ["I give one clear opinion.", "I give 2 or 3 opinions."],
              correctAnswer: "I give one clear opinion.",
            },
            {
              imageUrl: "/assets/assesments/opinions/opinion-02.png",
              options: [
                "I share it, no matter what.",
                "I share it only when asked.",
              ],
              correctAnswer: "I share it, no matter what.",
            },
            {
              imageUrl: "/assets/assesments/opinions/opinion-03.png",
              options: ["Real friends.", "Online friends."],
              correctAnswer: "Real friends.",
            },
            {
              imageUrl: "/assets/assesments/opinions/opinion-04.png",
              options: ["I ignore it.", "I give my opinion."],
              correctAnswer: "I give my opinion.",
            },
            {
              imageUrl: "/assets/assesments/opinions/opinion-05.png",
              options: ["I feel scared.", "I feel comfortable."],
              correctAnswer: "I feel comfortable.",
            },
            {
              imageUrl: "/assets/assesments/opinions/opinion-06.png",
              options: ["I ignore all of them.", "I take selectively"],
              correctAnswer: "I take selectively",
            },
            {
              imageUrl: "/assets/assesments/opinions/opinion-07.png",
              options: [
                "I'm very vocal about it.",
                "I prefer to keep it to myself",
              ],
              correctAnswer: "I'm very vocal about it.",
            },
            {
              imageUrl: "/assets/assesments/opinions/opinion-08.png",
              options: ["Yes, it is", "No, it's isn't"],
              correctAnswer: "Yes, it is",
            },
            {
              imageUrl: "/assets/assesments/opinions/opinion-09.png",
              options: ["Yes, it is.", "No it isn't."],
              correctAnswer: "Yes, it is.",
            },
            {
              imageUrl: "/assets/assesments/opinions/opinion-10.png",
              options: ["I give my own opinion.", "I follow other's opinions."],
              correctAnswer: "I give my own opinion.",
            },
          ],
        },
      },
    ]);

    // Sample Mentoons Card
    const mentoonsCard = await MentoonsCard.create([
      {
        title: "Conversation Starter Cards (6-12) years",
        description:
          "Discover the power of meaningful conversations with our Conversation Starter Cards. Watch your kids become more expressive, creative, and socially confident.",
        price: 199,
        orignalProductSrc:
          "https://mentoons-products.s3.ap-northeast-1.amazonaws.com/Products/Conversation_starter_cards/6-12/Conversaion+starter+cards+6-12.pdf",
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
              "https://mentoons-products.s3.ap-northeast-1.amazonaws.com/Products/Conversation_starter_cards/6-12/Conversation+starter+cards+6-12+sub.mp4",
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
        price: 199,
        orignalProductSrc:
          "https://mentoons-products.s3.ap-northeast-1.amazonaws.com/Products/Conversation_starter_cards/13-16/Conversation+starter+cards+13-16.pdf",
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
              "https://mentoons-products.s3.ap-northeast-1.amazonaws.com/Products/Conversation_starter_cards/13-16/Conversation+starter+card+13-19.mp4",
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
        price: 199,
        orignalProductSrc:
          "https://mentoons-products.s3.ap-northeast-1.amazonaws.com/Products/Conversation_starter_cards/17-19/Conversation+starter+cards+17-19.pdf",
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
              "https://mentoons-products.s3.ap-northeast-1.amazonaws.com/Products/Conversation_starter_cards/13-16/Conversation+starter+cards+13-16.pdf",
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
        price: 199,
        orignalProductSrc:
          "https://mentoons-products.s3.ap-northeast-1.amazonaws.com/Products/Conversation_Story_Cards_20%2B/Conversation+Story+Cards+20%2B.pdf",
        ageCategory: AgeCategory.ADULT,
        type: ProductType.MENTOONS_CARDS,
        rating: 4.5,
        tags: ["confidence", "empathy"],
        productImages: [
          {
            imageUrl:
              "https://mentoons-products.s3.ap-northeast-1.amazonaws.com/Products/Conversation_Story_Cards_20%2B/Conversation+Story+Cards+20%2B.png",
          },
          {
            imageUrl:
              "https://mentoons-products.s3.ap-northeast-1.amazonaws.com/Products/20%2BConversationStarterCards.png",
          },
        ],
       productVideos: [
          {
            videoUrl:
              "https://mentoons-products.s3.ap-northeast-1.amazonaws.com/Products/Conversation_Story_Cards_20%2B/Conversation+Story+Cards+20%2B.png",
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
        price: 199,
        orignalProductSrc:
          "https://mentoons-products.s3.ap-northeast-1.amazonaws.com/Products/Story_Reteller_Cards/6-12/Story+reteller+6-12.pdf",
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
              "https://mentoons-products.s3.ap-northeast-1.amazonaws.com/Products/Story_Reteller_Cards/6-12/Story+Re-teller+Card+6-12.mp4",
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
        price: 199,
        orignalProductSrc:
          "https://mentoons-products.s3.ap-northeast-1.amazonaws.com/Products/Story_Reteller_Cards/13-16/Story+Reteller+Cards+13-16.pdf",
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
              "https://mentoons-products.s3.ap-northeast-1.amazonaws.com/Products/Story_Reteller_Cards/13-16/Story+Reteller+Cards+13-19.mp4",
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
                    "Helps teens express themselves Freely, boosting confidence",
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
        price: 199,
        orignalProductSrc:
          "https://mentoons-products.s3.ap-northeast-1.amazonaws.com/Products/Story_Reteller_Cards/17-19/Story+Reteller+Cards+17-19.pdf",
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
              "https://mentoons-products.s3.ap-northeast-1.amazonaws.com/Products/Story_Reteller_Cards/13-16/Story+Reteller+Cards+13-19.mp4",
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
          "Unlock your child’s creativity with Silent Stories, a screen-Free activity that boosts imagination and storytelling skills. Perfect for solo or group play, it fosters emotional understanding and strengthens communication while offering a fun, offline bonding experience.",
        price: 199,
        orignalProductSrc:
          "https://mentoons-products.s3.ap-northeast-1.amazonaws.com/Products/Silent_stories/6-12/Silent+Stories+6-12.pdf",
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
              "https://mentoons-products.s3.ap-northeast-1.amazonaws.com/Products/Silent_stories/6-12/Silent+Stories+(Ages+6-12)_04.mp4",
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
                  description: "Screen-Free activity",
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
          "Unlock your child’s creativity with Silent Stories, a screen-Free activity that boosts imagination and storytelling skills. Perfect for solo or group play, it fosters emotional understanding and strengthens communication while offering a fun, offline bonding experience.",
        price: 199,
        orignalProductSrc:
          "https://mentoons-products.s3.ap-northeast-1.amazonaws.com/Products/Silent_stories/13-16/Silent+stories+13-16.pdf",
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
              "https://mentoons-products.s3.ap-northeast-1.amazonaws.com/Products/Silent_stories/13-16/Silent+Stories+(13-16)+(17-19)+Sub.mp4",
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
                    "Helps teens express themselves Freely, boosting confidence",
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
                    "Helps teens express themselves Freely, boosting confidence",
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
                    "Helps teens express themselves Freely, boosting confidence",
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
          "Unlock your child’s creativity with Silent Stories, a screen-Free activity that boosts imagination and storytelling skills. Perfect for solo or group play, it fosters emotional understanding and strengthens communication while offering a fun, offline bonding experience.",
        price: 199,
        orignalProductSrc:
          "https://mentoons-products.s3.ap-northeast-1.amazonaws.com/Products/Silent_stories/17-19/Silent+stories+17-19.pdf",
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
              "https://mentoons-products.s3.ap-northeast-1.amazonaws.com/Products/Silent_stories/13-16/Silent+Stories+(13-16)+(17-19)+Sub.mp4",
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
                  description: "Screen-Free activity",
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
        price: 19,
        orignalProductSrc:
          "https://mentoons-products.s3.ap-northeast-1.amazonaws.com/Products/coloring_Books/productPDF/6-12/Inventions+and+Inventors+coloring+book.pdf",
        ageCategory: AgeCategory.CHILD,
        tags: ["coloring", "inventors", "inventions", "learning"],
        type: ProductType.MENTOONS_BOOKS,
        rating: 4.7,
        productImages: [
          {
            imageUrl:
              "https://mentoons-products.s3.ap-northeast-1.amazonaws.com/Products/coloring_Books/6-12/inventionsAndInventors.png",
          },
          {
            imageUrl:
              "https://mentoons-products.s3.ap-northeast-1.amazonaws.com/Products/productSamples/6-12/inventors+and+inventions/sample+1.png",
          },
          {
            imageUrl:
              "https://mentoons-products.s3.ap-northeast-1.amazonaws.com/Products/productSamples/6-12/inventors+and+inventions/sample+3.png",
          },
        ],
       productVideos: [
          {
            videoUrl: "",
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
        price: 19,
        orignalProductSrc:
          "https://mentoons-products.s3.ap-northeast-1.amazonaws.com/Products/coloring_Books/productPDF/6-12/Gaming_Book_mandala+art).pdf",
        ageCategory: AgeCategory.CHILD,
        tags: ["coloring", "mandala art", "gaming", "creative"],
        type: ProductType.MENTOONS_BOOKS,
        rating: 4.5,
        productImages: [
          {
            imageUrl:
              "https://mentoons-products.s3.ap-northeast-1.amazonaws.com/Products/coloring_Books/6-12/mandalaArt.png",
          },
          {
            imageUrl:
              "https://mentoons-products.s3.ap-northeast-1.amazonaws.com/Products/productSamples/6-12/mandla+art/Gaming+sample+-01-04.png",
          },
          {
            imageUrl:
              "https://mentoons-products.s3.ap-northeast-1.amazonaws.com/Products/productSamples/6-12/mandla+art/Gaming+sample+-01-06.png",
          },
        ],
       productVideos: [
          {
            videoUrl: "",
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
        price: 19,
        orignalProductSrc:
          "https://mentoons-products.s3.ap-northeast-1.amazonaws.com/Products/coloring_Books/productPDF/6-12/M9+colouring+book.pdf",
        ageCategory: AgeCategory.CHILD,
        tags: ["coloring", "cartoon characters", "creative", "kids"],
        type: ProductType.MENTOONS_BOOKS,
        rating: 4.8,
        productImages: [
          {
            imageUrl:
              "https://mentoons-products.s3.ap-northeast-1.amazonaws.com/Products/coloring_Books/6-12/magnificent-9.png",
          },
          {
            imageUrl:
              "https://mentoons-products.s3.ap-northeast-1.amazonaws.com/Products/productSamples/6-12/m9+coloring+book/1.png",
          },
          {
            imageUrl:
              "https://mentoons-products.s3.ap-northeast-1.amazonaws.com/Products/productSamples/6-12/m9+coloring+book/2.png",
          },
        ],
       productVideos: [
          {
            videoUrl: "",
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
      ${comics.length} Mentoons Comics
      ${audioComics.length} Mentoons Audio Comics
    `);
  } catch (error) {
    console.error("Error seeding database:", error);
  }
};

module.exports = seedProducts;
