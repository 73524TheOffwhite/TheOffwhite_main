import dileepMenonImg from "@/assets/image1.jpeg";
import chefSanthoshImg from "@/assets/Gemini_Generated_Image_tneg3stneg3stneg.jpg";
import aratiMenonImg from "@/assets/IMG_5702.jpg";

export const founderStoryIntro = [
  "At The Off White Bar & Grill (also called just The Off White) in Navelim, Margao, every detail is intentional. The ethereal lighting, handcrafted rattan chandeliers, stone accents, and serene yet sophisticated ambiance create more than a restaurant; they create a feeling. This is the embodiment of a shared dream between Arati Menon and Dileep Menon, brought to life with the culinary mastery of Chef Santhosh Kumar Salapu in September 2023.",
  "Their journey began with a bold vision on Agonda's pristine beach and has evolved into one of South Goa's most celebrated fine-dining destinations—award-winning, guest-obsessed, and growing with purpose.",
];

export type FounderProfile = {
  name: string;
  role: string;
  paragraphs: string[];
  imageUrl?: string;
  /** Mobile-only object-position so faces stay in frame (desktop uses center). */
  mobileObjectPosition?: string;
  /** Desktop object-position override (defaults to center). */
  desktopObjectPosition?: string;
};

export const founderProfiles: FounderProfile[] = [
  {
    name: "Arati Menon",
    role: "Managing Partner & Visionary",
    imageUrl: aratiMenonImg,
    // Full-body portrait — bias upward so face stays sharp in the card crop.
    mobileObjectPosition: "center 18%",
    desktopObjectPosition: "center 22%",
    paragraphs: [
      "Arati Menon is the heart and face of The Off White. A detail-oriented leader with an extraordinary work ethic, she combines global hospitality expertise with a deeply personal passion for creating spaces that make people feel truly cared for.",
      "Her professional journey began after earning a BA in History & Political Science in 1998 and an MBA in Marketing & Information Systems from Troy University's Sorrell Graduate School of Business (2003), Troy, Alabama, USA. After college, she honed her craft in the United States, serving as General Manager of the Ramada Downtown Atlanta and later turning around a loss-making Days Inn in Cordele, Georgia. These formative years instilled in her a commitment to operational excellence, genuine guest connection, and building high-performing teams.",
      "After seven years in the US, she and Dileep moved to Pune, India, and then to Dubai, UAE. While raising a young family, Arati returned to her first love—hospitality. In December 2017, she brought her dream to life with The White Resort (also called just The White) in Agonda, Canacona, Goa: a Santorini-inspired, boho-chic boutique haven of 14 all-white cottages. It became a celebrated “Happiness Retreat,” beloved for its serene design, direct beach access, azure pool, dream catchers, open-air showers, and soulful multi-cuisine restaurant. Guests consistently praised the tranquillity, thoughtful details—including positive affirmation cards—and the feeling of escaping into pure bliss.",
      "At both The White and The Off White, the complete design vision was Arati's own. She travelled extensively across India and abroad, personally sourcing materials, furniture, lighting, textiles, artisanal objects, and finishes that would carry soul, texture, and quiet elegance. Professional architects were engaged solely for structural and schematic drawings; every aesthetic decision—the flow of space, the play of light, the placement of every piece, and the balance of textures and tones—was conceived and curated by her.",
      "This refined eye for design and aesthetics, shaped by her years in international hospitality and a lifetime of thoughtful travel, is what gives both properties their distinctive character and emotional resonance. At The Off White, she continues to serve as Managing Partner, overseeing operations and public relations while remaining the warm, welcoming face of the brand. She collaborates closely with Chef Santhosh on menu development, blending global techniques with local inspirations, particularly Andhra flavours, and signature elements like the exclusive “Nalapu” spice blend. The result is a menu that feels both comforting and exciting, executed with precision in an ambiance of superb aesthetics and impeccable service.",
      "Arati's leadership style is collaborative, resilient, and guest-first. She believes hospitality should increase the “happiness quotient,” creating memorable experiences that guests carry home. Under her guidance, The Off White has earned consistent acclaim, including the Times Food & Nightlife Award 2024 for Best Global – Premium Dining, features in UpperCrust, Bombay Times, and Viva Goa, and glowing reviews for its elegant yet soulful setting and outstanding hospitality.",
    ],
  },
  {
    name: "Dileep Menon",
    role: "Strategic Partner & Primary Investor",
    imageUrl: dileepMenonImg,
    mobileObjectPosition: "center 18%",
    paragraphs: [
      "Dileep Menon brings the strategic depth, investment backbone, and growth vision that have allowed both ventures to flourish. An Executive Director and a member of the Board of Directors at Scholars International Group (SIG), where he oversees strategic growth and operations for a portfolio of premier schools in the UAE, Dileep combines sharp business acumen with a traveller's heart.",
      "He holds a Bachelor of Engineering in Industrial Engineering from Kolhapur Institute of Technology and an MBA in Finance from the Manderson Graduate School of Business at the University of Alabama, Tuscaloosa, Alabama, USA. His career spans senior leadership in fintech in Atlanta, real estate, education, and hospitality investments. Over 18 years with SIG, he has headed its Indian operations and now drives long-term value creation across education and real estate.",
      "For The White and The Off White, Dileep served as the primary investor and steady strategic partner. He has been instrumental in providing the financial foundation while contributing his forte in online marketing and digital advertising—Google and Meta campaigns—that helped both brands reach the right audiences and build loyal followings. He offers clear-eyed strategic advice on expansion, operations scaling, and sustainable growth, always aligned with the core promise of quality, aesthetics, and heartfelt service.",
      "A true partner in every sense, Dileep shares Arati's belief that hospitality done with integrity and passion creates lasting value—not just for guests, but for the team and the community. Together, they have transformed challenges into chapters of growth, moving from a beachfront dream realised to a thriving fine-dining destination in the heart of South Goa, with ambitious yet measured expansion plans, including additional space on the fourth floor and dedicated areas for private events on the fifth.",
      "Their shared journeys across continents have shaped not only the culinary direction but also the design philosophy of both properties. Dileep's steady support has given Arati the freedom to fully realise her creative vision, while his strategic guidance ensures that the business remains grounded and true to its founding values of quality and intimacy.",
    ],
  },
  {
    name: "Chef Santhosh Kumar Salapu",
    role: "Head Chef & Culinary Curator",
    imageUrl: chefSanthoshImg,
    mobileObjectPosition: "center 22%",
    paragraphs: [
      "Chef Santhosh Kumar Salapu is the brilliant hands and creative force in the kitchen. A dedicated bodybuilder with an athlete's discipline and a chef's soul, he brings precision, passion, and international pedigree to every plate.",
      "His foundation was laid early. He holds a degree in Hotel Management from Vishakhapatnam, where he quickly distinguished himself as a rising talent, winning multiple prizes in intercollegiate chef competitions. In his early twenties, he made his bones in the demanding French galley of a cruise liner before moving to a leading airport hotel in Dubai. These formative years honed his ability to deliver high standards, master diverse cuisines, and maintain consistent excellence under intense pressure.",
      "In 2018, Arati discovered him through a mutual friend at the gym while assembling the team for The White Resort. Chef Santhosh was working in Goa at that time and, when they met, it was an instant match. His technical mastery and intuitive understanding of flavour paired perfectly with her vision for menu design. His leadership as Head Chef in the kitchen played a significant role in making The White's restaurant one of the most popular and successful on Agonda beach.",
      "At The Off White, Chef Santhosh leads the kitchen and service teams with quiet authority. He manages hiring and training, sources the finest ingredients, collaborates on pricing, and ensures every dish reflects the restaurant's promise: high-quality product, superb aesthetics, and exceptional service. Signature creations—from the harmonious Mutton Nalapu Pulao with paya to Watermelon Wasabi Prawns, Palleturu Pulao, Nalli Nihari, and innovative comfort dishes—showcase his ability to honour global techniques while celebrating local flavours.",
      "Arati and Chef Santhosh work hand-in-hand: she contributes creative direction and guest insights; he executes with perfection and leads the team that brings it all to life. His leadership has been central to the restaurant's repeated recognition among Goa's best, including the 2024 Times Food & Nightlife Award. Guests and critics alike praise not just the food, but the seamless, warm service that makes every visit feel personal.",
    ],
  },
];

export const sharedValuesStory = [
  "Arati's visionary leadership and operational excellence, Dileep's strategic investment and marketing strength, and Chef Santhosh's culinary mastery and team stewardship form a rare, synergistic team. They are united by a simple yet powerful philosophy: create beautiful spaces, serve outstanding food with heart, and make every guest feel genuinely welcomed and cared for.",
  "What truly sets The Off White apart is an uncompromising commitment to quality that runs through every decision. Having travelled the world and dined at many of the finest restaurants, including numerous Michelin-starred establishments, Arati and Dileep possess a deeply informed appreciation for what makes food and spaces exceptional. They have brought that global perspective and exacting standard to The Off White.",
  "Only the highest-quality cold-pressed oils and the purest ghee are used in the kitchen. There are no shortcuts and no cutting corners, because they believe that truly great food does not need marketing—it speaks for itself.",
  "This conviction is so complete that Arati, Dileep, and Chef Santhosh eat exclusively at The Off White. The majority of their guests are loyal repeat customers or friends and family of those who have already experienced the warmth, the flavours, and the care that define every visit. Growth has been organic, driven almost entirely by word of mouth from satisfied guests who return again and again and bring others with them.",
  "From the serene white sands of Agonda to the elegant, light-filled rooms of The Off White in Navelim, their story is one of dreams realised through hard work, resilience, collaboration, and an unwavering commitment to quality.",
];

export const founderStoryClosing = [
  "The Off White Bar & Grill is more than a restaurant.",
  "It is a destination where aesthetics meet soul, where global experience meets Goan warmth, and where every detail is designed to create lasting memories.",
  "We invite you to experience it.",
  "This is only the beginning of the next chapter.",
];

export const founderSocialHandles = ["@offwhitegoa", "@thewhitegoa"] as const;
