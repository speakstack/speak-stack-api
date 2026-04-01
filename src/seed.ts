import { DataSource } from "typeorm";
import { Badge, BadgeTriggerType } from "./badge/entities/badge.entity";
import { Language } from "./language/entities/language.entity";
import { Level } from "./level/entities/level.entity";
import { Tag } from "./tag/entities/tag.entity";
import { User } from "./user/entities/user.entity";
// Import PostAttachment before Post to resolve circular dependency in Bun
import "./post/entities/post-attachment.entity";
import { Post, PostType, PostStatus } from "./post/entities/post.entity";
import { Answer } from "./answer/entities/answer.entity";
import { PostVote } from "./vote/entities/post-vote.entity";
import { AnswerVote } from "./vote/entities/answer-vote.entity";
import { ReputationHistory } from "./reputation/entities/reputation-history.entity";
import {
  UserLanguage,
  UserLanguageRelation,
  LanguageProficiency,
} from "./user-language/entities/user-language.entity";
import { SnakeNamingStrategy } from "./config/snake-naming.strategy";

// ─── Languages ───────────────────────────────────────────────────────────────

const LANGUAGES: { code: string; name: string }[] = [
  { code: "en", name: "English" },
  { code: "en-US", name: "English (US)" },
  { code: "en-GB", name: "English (UK)" },
  { code: "ja", name: "Japanese" },
  { code: "ko", name: "Korean" },
  { code: "zh-CN", name: "Chinese (Simplified)" },
  { code: "zh-TW", name: "Chinese (Traditional)" },
  { code: "vi", name: "Vietnamese" },
  { code: "th", name: "Thai" },
  { code: "es", name: "Spanish" },
  { code: "fr", name: "French" },
  { code: "de", name: "German" },
  { code: "pt", name: "Portuguese" },
  { code: "pt-BR", name: "Portuguese (Brazil)" },
  { code: "it", name: "Italian" },
  { code: "ru", name: "Russian" },
  { code: "ar", name: "Arabic" },
  { code: "hi", name: "Hindi" },
  { code: "id", name: "Indonesian" },
  { code: "tr", name: "Turkish" },
  { code: "pl", name: "Polish" },
  { code: "nl", name: "Dutch" },
  { code: "sv", name: "Swedish" },
  { code: "uk", name: "Ukrainian" },
  { code: "tl", name: "Tagalog" },
];

// ─── Levels ──────────────────────────────────────────────────────────────────

const LEVELS: { name: string; minReputation: number }[] = [
  { name: "Newbie", minReputation: 0 },
  { name: "Beginner", minReputation: 100 },
  { name: "Intermediate", minReputation: 500 },
  { name: "Advanced", minReputation: 1500 },
  { name: "Expert", minReputation: 5000 },
];

// ─── Badges ──────────────────────────────────────────────────────────────────

const BADGES: { name: string; slug: string; description: string; triggerType: BadgeTriggerType; threshold: number }[] = [
  { name: "First Post", slug: "first-post", description: "Created your first post", triggerType: BadgeTriggerType.FIRST_POST, threshold: 1 },
  { name: "First Answer", slug: "first-answer", description: "Wrote your first answer", triggerType: BadgeTriggerType.FIRST_ANSWER, threshold: 1 },
  { name: "First Comment", slug: "first-comment", description: "Left your first comment", triggerType: BadgeTriggerType.FIRST_COMMENT, threshold: 1 },
  { name: "Prolific Poster", slug: "prolific-poster", description: "Created 10 posts", triggerType: BadgeTriggerType.POST_COUNT, threshold: 10 },
  { name: "Helpful Hand", slug: "helpful-hand", description: "Wrote 10 answers", triggerType: BadgeTriggerType.ANSWER_COUNT, threshold: 10 },
  { name: "Problem Solver", slug: "problem-solver", description: "Had 5 answers accepted", triggerType: BadgeTriggerType.ACCEPTED_ANSWER_COUNT, threshold: 5 },
  { name: "Rising Star", slug: "rising-star", description: "Received 10 upvotes", triggerType: BadgeTriggerType.UPVOTES_RECEIVED, threshold: 10 },
  { name: "Popular Voice", slug: "popular-voice", description: "Received 50 upvotes", triggerType: BadgeTriggerType.UPVOTES_RECEIVED, threshold: 50 },
  { name: "Legend", slug: "legend", description: "Received 100 upvotes", triggerType: BadgeTriggerType.UPVOTES_RECEIVED, threshold: 100 },
];

// ─── Tags ────────────────────────────────────────────────────────────────────

interface TagSeed {
  name: string;
  slug: string;
  description: string;
  color: string;
  languageCode: string | null;
}

const GLOBAL_TAGS: TagSeed[] = [
  {
    name: "Grammar",
    slug: "grammar",
    description: "Questions about grammar rules and sentence structure",
    color: "#3B82F6",
    languageCode: null,
  },
  {
    name: "Vocabulary",
    slug: "vocabulary",
    description: "Word meanings, usage, and synonyms",
    color: "#8B5CF6",
    languageCode: null,
  },
  {
    name: "Pronunciation",
    slug: "pronunciation",
    description: "How to pronounce words and sounds",
    color: "#EC4899",
    languageCode: null,
  },
  {
    name: "Writing",
    slug: "writing",
    description: "Written composition and style",
    color: "#F59E0B",
    languageCode: null,
  },
  {
    name: "Reading",
    slug: "reading",
    description: "Reading comprehension and practice",
    color: "#10B981",
    languageCode: null,
  },
  {
    name: "Listening",
    slug: "listening",
    description: "Listening comprehension and practice",
    color: "#06B6D4",
    languageCode: null,
  },
  {
    name: "Speaking",
    slug: "speaking",
    description: "Oral communication and fluency practice",
    color: "#F97316",
    languageCode: null,
  },
  {
    name: "Culture",
    slug: "culture",
    description: "Cultural context and customs related to language",
    color: "#EF4444",
    languageCode: null,
  },
  {
    name: "Slang",
    slug: "slang",
    description: "Informal language, idioms, and colloquialisms",
    color: "#A855F7",
    languageCode: null,
  },
  {
    name: "Business",
    slug: "business",
    description: "Professional and business language",
    color: "#64748B",
    languageCode: null,
  },
  {
    name: "Travel",
    slug: "travel",
    description: "Language for travel and tourism situations",
    color: "#14B8A6",
    languageCode: null,
  },
  {
    name: "Translation",
    slug: "translation",
    description: "Translation help between languages",
    color: "#6366F1",
    languageCode: null,
  },
  {
    name: "Resources",
    slug: "resources",
    description: "Learning materials, books, apps, and tools",
    color: "#84CC16",
    languageCode: null,
  },
  {
    name: "Tips",
    slug: "tips",
    description: "Study tips and learning strategies",
    color: "#FACC15",
    languageCode: null,
  },
];

const LANGUAGE_TAGS: TagSeed[] = [
  {
    name: "Kanji",
    slug: "kanji",
    description: "Chinese characters used in Japanese writing",
    color: "#DC2626",
    languageCode: "ja",
  },
  {
    name: "Hiragana",
    slug: "hiragana",
    description: "Japanese hiragana script",
    color: "#E11D48",
    languageCode: "ja",
  },
  {
    name: "Katakana",
    slug: "katakana",
    description: "Japanese katakana script",
    color: "#BE185D",
    languageCode: "ja",
  },
  {
    name: "JLPT",
    slug: "jlpt",
    description: "Japanese Language Proficiency Test",
    color: "#9F1239",
    languageCode: "ja",
  },
  {
    name: "Keigo",
    slug: "keigo",
    description: "Japanese honorific and polite language",
    color: "#B91C1C",
    languageCode: "ja",
  },
  {
    name: "TOPIK",
    slug: "topik",
    description: "Test of Proficiency in Korean",
    color: "#1D4ED8",
    languageCode: "ko",
  },
  {
    name: "Hangul",
    slug: "hangul",
    description: "Korean alphabet system",
    color: "#2563EB",
    languageCode: "ko",
  },
  {
    name: "Hanzi",
    slug: "hanzi",
    description: "Chinese characters",
    color: "#B45309",
    languageCode: "zh-CN",
  },
  {
    name: "HSK",
    slug: "hsk",
    description: "Hanyu Shuiping Kaoshi — Chinese proficiency test",
    color: "#D97706",
    languageCode: "zh-CN",
  },
  {
    name: "Pinyin",
    slug: "pinyin",
    description: "Romanization system for Mandarin Chinese",
    color: "#F59E0B",
    languageCode: "zh-CN",
  },
  {
    name: "Subjunctive",
    slug: "subjunctive",
    description: "Spanish subjunctive mood",
    color: "#059669",
    languageCode: "es",
  },
  {
    name: "DELE",
    slug: "dele",
    description: "Diploma de Español como Lengua Extranjera",
    color: "#047857",
    languageCode: "es",
  },
  {
    name: "DELF",
    slug: "delf",
    description: "Diplôme d'études en langue française",
    color: "#4338CA",
    languageCode: "fr",
  },
  {
    name: "Goethe",
    slug: "goethe",
    description: "Goethe-Zertifikat German exam",
    color: "#7C3AED",
    languageCode: "de",
  },
];

// ─── Users ───────────────────────────────────────────────────────────────────

interface UserSeed {
  username: string;
  email: string;
  displayName: string;
  role: string;
  reputation: number;
  avatarUrl: string | null;
}

const USERS: UserSeed[] = [
  // Admins
  {
    username: "admin",
    email: "admin@speakstack.io",
    displayName: "SpeakStack Admin",
    role: "admin",
    reputation: 1000,
    avatarUrl: null,
  },
  {
    username: "mod_linh",
    email: "linh@speakstack.io",
    displayName: "Linh Nguyen",
    role: "moderator",
    reputation: 750,
    avatarUrl: null,
  },
  // Regular users — diverse backgrounds
  {
    username: "yuki_tanaka",
    email: "yuki@example.com",
    displayName: "Yuki Tanaka",
    role: "user",
    reputation: 320,
    avatarUrl: null,
  },
  {
    username: "mike_johnson",
    email: "mike@example.com",
    displayName: "Mike Johnson",
    role: "user",
    reputation: 185,
    avatarUrl: null,
  },
  {
    username: "soo_jin",
    email: "soojin@example.com",
    displayName: "Kim Soo-jin",
    role: "user",
    reputation: 410,
    avatarUrl: null,
  },
  {
    username: "marie_dupont",
    email: "marie@example.com",
    displayName: "Marie Dupont",
    role: "user",
    reputation: 95,
    avatarUrl: null,
  },
  {
    username: "carlos_garcia",
    email: "carlos@example.com",
    displayName: "Carlos García",
    role: "user",
    reputation: 220,
    avatarUrl: null,
  },
  {
    username: "wei_chen",
    email: "wei@example.com",
    displayName: "Wei Chen",
    role: "user",
    reputation: 530,
    avatarUrl: null,
  },
  {
    username: "anna_schmidt",
    email: "anna@example.com",
    displayName: "Anna Schmidt",
    role: "user",
    reputation: 60,
    avatarUrl: null,
  },
  {
    username: "thanh_pham",
    email: "thanh@example.com",
    displayName: "Thanh Pham",
    role: "user",
    reputation: 275,
    avatarUrl: null,
  },
  {
    username: "raj_patel",
    email: "raj@example.com",
    displayName: "Raj Patel",
    role: "user",
    reputation: 140,
    avatarUrl: null,
  },
  {
    username: "sakura_ito",
    email: "sakura@example.com",
    displayName: "Sakura Ito",
    role: "user",
    reputation: 45,
    avatarUrl: null,
  },
];

// ─── User Languages ─────────────────────────────────────────────────────────

interface UserLanguageSeed {
  username: string;
  languageCode: string;
  relation: UserLanguageRelation;
  proficiency: LanguageProficiency | null;
}

const USER_LANGUAGES: UserLanguageSeed[] = [
  // admin — English native, learning Vietnamese
  { username: "admin", languageCode: "en", relation: UserLanguageRelation.NATIVE, proficiency: LanguageProficiency.NATIVE },
  { username: "admin", languageCode: "vi", relation: UserLanguageRelation.LEARNING, proficiency: LanguageProficiency.INTERMEDIATE },

  // mod_linh — Vietnamese native, fluent English, can help with both
  { username: "mod_linh", languageCode: "vi", relation: UserLanguageRelation.NATIVE, proficiency: LanguageProficiency.NATIVE },
  { username: "mod_linh", languageCode: "en", relation: UserLanguageRelation.CAN_HELP, proficiency: LanguageProficiency.FLUENT },
  { username: "mod_linh", languageCode: "ja", relation: UserLanguageRelation.LEARNING, proficiency: LanguageProficiency.BEGINNER },

  // yuki_tanaka — Japanese native, learning English & Korean
  { username: "yuki_tanaka", languageCode: "ja", relation: UserLanguageRelation.NATIVE, proficiency: LanguageProficiency.NATIVE },
  { username: "yuki_tanaka", languageCode: "en", relation: UserLanguageRelation.LEARNING, proficiency: LanguageProficiency.ADVANCED },
  { username: "yuki_tanaka", languageCode: "ko", relation: UserLanguageRelation.LEARNING, proficiency: LanguageProficiency.BEGINNER },

  // mike_johnson — English native, learning Japanese
  { username: "mike_johnson", languageCode: "en", relation: UserLanguageRelation.NATIVE, proficiency: LanguageProficiency.NATIVE },
  { username: "mike_johnson", languageCode: "en-US", relation: UserLanguageRelation.NATIVE, proficiency: LanguageProficiency.NATIVE },
  { username: "mike_johnson", languageCode: "ja", relation: UserLanguageRelation.LEARNING, proficiency: LanguageProficiency.INTERMEDIATE },

  // soo_jin — Korean native, fluent English, can help Korean learners
  { username: "soo_jin", languageCode: "ko", relation: UserLanguageRelation.NATIVE, proficiency: LanguageProficiency.NATIVE },
  { username: "soo_jin", languageCode: "en", relation: UserLanguageRelation.CAN_HELP, proficiency: LanguageProficiency.FLUENT },
  { username: "soo_jin", languageCode: "ja", relation: UserLanguageRelation.LEARNING, proficiency: LanguageProficiency.INTERMEDIATE },

  // marie_dupont — French native, learning Spanish & English
  { username: "marie_dupont", languageCode: "fr", relation: UserLanguageRelation.NATIVE, proficiency: LanguageProficiency.NATIVE },
  { username: "marie_dupont", languageCode: "es", relation: UserLanguageRelation.LEARNING, proficiency: LanguageProficiency.INTERMEDIATE },
  { username: "marie_dupont", languageCode: "en", relation: UserLanguageRelation.LEARNING, proficiency: LanguageProficiency.ADVANCED },

  // carlos_garcia — Spanish native, learning English & Portuguese
  { username: "carlos_garcia", languageCode: "es", relation: UserLanguageRelation.NATIVE, proficiency: LanguageProficiency.NATIVE },
  { username: "carlos_garcia", languageCode: "en", relation: UserLanguageRelation.LEARNING, proficiency: LanguageProficiency.INTERMEDIATE },
  { username: "carlos_garcia", languageCode: "pt-BR", relation: UserLanguageRelation.LEARNING, proficiency: LanguageProficiency.BEGINNER },

  // wei_chen — Chinese native, fluent English, can help with Chinese
  { username: "wei_chen", languageCode: "zh-CN", relation: UserLanguageRelation.NATIVE, proficiency: LanguageProficiency.NATIVE },
  { username: "wei_chen", languageCode: "en", relation: UserLanguageRelation.CAN_HELP, proficiency: LanguageProficiency.FLUENT },
  { username: "wei_chen", languageCode: "ja", relation: UserLanguageRelation.LEARNING, proficiency: LanguageProficiency.ADVANCED },

  // anna_schmidt — German native, learning French
  { username: "anna_schmidt", languageCode: "de", relation: UserLanguageRelation.NATIVE, proficiency: LanguageProficiency.NATIVE },
  { username: "anna_schmidt", languageCode: "fr", relation: UserLanguageRelation.LEARNING, proficiency: LanguageProficiency.BEGINNER },
  { username: "anna_schmidt", languageCode: "en", relation: UserLanguageRelation.CAN_HELP, proficiency: LanguageProficiency.FLUENT },

  // thanh_pham — Vietnamese native, learning English & Japanese
  { username: "thanh_pham", languageCode: "vi", relation: UserLanguageRelation.NATIVE, proficiency: LanguageProficiency.NATIVE },
  { username: "thanh_pham", languageCode: "en", relation: UserLanguageRelation.LEARNING, proficiency: LanguageProficiency.INTERMEDIATE },
  { username: "thanh_pham", languageCode: "ja", relation: UserLanguageRelation.LEARNING, proficiency: LanguageProficiency.BEGINNER },

  // raj_patel — Hindi native, learning English & Korean
  { username: "raj_patel", languageCode: "hi", relation: UserLanguageRelation.NATIVE, proficiency: LanguageProficiency.NATIVE },
  { username: "raj_patel", languageCode: "en", relation: UserLanguageRelation.LEARNING, proficiency: LanguageProficiency.ADVANCED },
  { username: "raj_patel", languageCode: "ko", relation: UserLanguageRelation.LEARNING, proficiency: LanguageProficiency.BEGINNER },

  // sakura_ito — Japanese native, beginner English
  { username: "sakura_ito", languageCode: "ja", relation: UserLanguageRelation.NATIVE, proficiency: LanguageProficiency.NATIVE },
  { username: "sakura_ito", languageCode: "en", relation: UserLanguageRelation.LEARNING, proficiency: LanguageProficiency.BEGINNER },
];

// ─── Posts ───────────────────────────────────────────────────────────────────

interface PostSeed {
  authorUsername: string;
  type: PostType;
  status: PostStatus;
  title: string;
  content: string;
  targetLanguageCode: string;
  tagSlugs: string[];
  isDeleted?: boolean;
  isClosed?: boolean;
  closedReason?: string;
  closedByUsername?: string;
  viewCount?: number;
}

const POSTS: PostSeed[] = [
  // ── QUESTION type ─────────────────────────────────────────────────────────
  {
    authorUsername: "mike_johnson",
    type: PostType.QUESTION,
    status: PostStatus.ANSWERED,
    title: "When should I use は vs が in Japanese?",
    content: `I've been studying Japanese for about 6 months and I still struggle with the difference between は (wa) and が (ga). I know は is the topic marker and が is the subject marker, but in practice I can never decide which one to use.\n\nFor example:\n- 私は学生です (I am a student)\n- 誰が来ましたか (Who came?)\n\nCan someone explain the key differences with more examples? When does it really matter which one I choose?`,
    targetLanguageCode: "ja",
    tagSlugs: ["grammar", "jlpt"],
    viewCount: 245,
  },
  {
    authorUsername: "marie_dupont",
    type: PostType.QUESTION,
    status: PostStatus.OPEN,
    title: "Difference between ser and estar in Spanish?",
    content: `I'm French and learning Spanish. Both "ser" and "estar" translate to "être" in French (or "to be" in English), but they're used differently.\n\nI know the basics:\n- Ser = permanent characteristics\n- Estar = temporary states/locations\n\nBut what about sentences like "La fiesta es/está en mi casa"? Both seem possible. Can native speakers share the nuances I'm missing?`,
    targetLanguageCode: "es",
    tagSlugs: ["grammar", "vocabulary"],
    viewCount: 132,
  },
  {
    authorUsername: "raj_patel",
    type: PostType.QUESTION,
    status: PostStatus.OPEN,
    title: "How do Korean honorifics work in daily conversation?",
    content: `I just started learning Korean and the honorific system seems incredibly complex. There are different speech levels, different verb endings, and even different vocabulary depending on who you're talking to.\n\nIn daily life:\n- When do Koreans switch between formal and informal?\n- Is it offensive to use 반말 (banmal) with strangers?\n- How do you handle it when you're not sure of someone's age?\n\nAny tips for a beginner would be greatly appreciated!`,
    targetLanguageCode: "ko",
    tagSlugs: ["grammar", "culture", "tips"],
    viewCount: 89,
  },
  {
    authorUsername: "anna_schmidt",
    type: PostType.QUESTION,
    status: PostStatus.OPEN,
    title: "How to use the French subjunctive correctly?",
    content: `As a German speaker, the subjunctive mood is really confusing to me. In German we have Konjunktiv but it works quite differently.\n\nI know I need subjunctive after "il faut que" and "je veux que", but are there other triggers I should memorize? And when is it okay to just use the indicative instead?\n\nExamples of my confusion:\n- "Je pense que..." → indicative or subjunctive?\n- "Je ne pense pas que..." → does negation change it?`,
    targetLanguageCode: "fr",
    tagSlugs: ["grammar", "delf"],
    viewCount: 67,
  },
  {
    authorUsername: "thanh_pham",
    type: PostType.QUESTION,
    status: PostStatus.ANSWERED,
    title: "What are the most common English phrasal verbs I should learn?",
    content: `I'm Vietnamese and studying English. Phrasal verbs are the hardest part for me because they don't translate literally.\n\nFor example:\n- "give up" = từ bỏ (not "give" + "up")\n- "look after" = chăm sóc (not "look" + "after")\n\nCan native English speakers share the top 20-30 most essential phrasal verbs that I absolutely need for daily conversation?`,
    targetLanguageCode: "en",
    tagSlugs: ["vocabulary", "tips"],
    viewCount: 312,
  },
  {
    authorUsername: "carlos_garcia",
    type: PostType.QUESTION,
    status: PostStatus.OPEN,
    title: "English tenses: Present Perfect vs Simple Past?",
    content: `As a Spanish speaker, I struggle with when to use Present Perfect vs Simple Past in English.\n\nIn Spanish we have "Pretérito Perfecto" and "Pretérito Indefinido" but the usage rules are different.\n\n- "I have eaten" vs "I ate" — when do I use each?\n- "I have been to Japan" vs "I went to Japan" — what's the difference?\n- Does it change between American and British English?\n\nI keep getting corrected by my American friends but the rules seem inconsistent.`,
    targetLanguageCode: "en",
    tagSlugs: ["grammar"],
    viewCount: 198,
  },

  // ── HOW_DO_YOU_SAY type ───────────────────────────────────────────────────
  {
    authorUsername: "mike_johnson",
    type: PostType.HOW_DO_YOU_SAY,
    status: PostStatus.ANSWERED,
    title: 'How do you say "I\'m looking forward to it" in Japanese?',
    content: `I want to express excitement about a future event in Japanese. Like when a friend invites you somewhere and you want to say "I'm looking forward to it!"\n\nIs 楽しみにしています the right way? Are there casual and formal versions?`,
    targetLanguageCode: "ja",
    tagSlugs: ["vocabulary", "speaking"],
    viewCount: 156,
  },
  {
    authorUsername: "anna_schmidt",
    type: PostType.HOW_DO_YOU_SAY,
    status: PostStatus.OPEN,
    title: 'How do you say "I changed my mind" in French?',
    content: `I want to express that I've changed my decision about something. In German we say "Ich habe meine Meinung geändert" but I'm not sure about the French equivalent.\n\nIs it "J'ai changé d'avis" or "J'ai changé mon esprit"? Or something completely different?`,
    targetLanguageCode: "fr",
    tagSlugs: ["vocabulary"],
    viewCount: 43,
  },
  {
    authorUsername: "sakura_ito",
    type: PostType.HOW_DO_YOU_SAY,
    status: PostStatus.OPEN,
    title: 'How do you say "That makes sense" in English?',
    content: `日本語で「なるほど」とよく言いますが、英語では何と言いますか？\n\n"I understand" は知っていますが、もっとカジュアルな表現を知りたいです。友達と話す時に使える表現を教えてください。\n\n(In Japanese we often say "naruhodo" - what's the English equivalent? I know "I understand" but I want something more casual for chatting with friends.)`,
    targetLanguageCode: "en",
    tagSlugs: ["vocabulary", "slang", "speaking"],
    viewCount: 78,
  },
  {
    authorUsername: "raj_patel",
    type: PostType.HOW_DO_YOU_SAY,
    status: PostStatus.ANSWERED,
    title: 'How do you say "no worries" in Korean?',
    content: `When someone apologizes for something small, I want to say "no worries" or "it's okay, don't worry about it" in Korean.\n\nI know 괜찮아요 but is there a more natural/casual way to say it among friends?`,
    targetLanguageCode: "ko",
    tagSlugs: ["vocabulary", "speaking"],
    viewCount: 91,
  },
  {
    authorUsername: "thanh_pham",
    type: PostType.HOW_DO_YOU_SAY,
    status: PostStatus.OPEN,
    title: 'How do you say "It\'s up to you" in English?',
    content: `Trong tiếng Việt chúng tôi nói "Tùy bạn" khi để người khác quyết định. Trong tiếng Anh có những cách nào để nói điều này?\n\n(In Vietnamese we say "Tùy bạn" when letting someone else decide. What are the ways to say this in English?)\n\nI want to know both formal and casual versions.`,
    targetLanguageCode: "en",
    tagSlugs: ["vocabulary", "speaking"],
    viewCount: 55,
  },

  // ── DOES_THIS_SOUND_NATURAL type ──────────────────────────────────────────
  {
    authorUsername: "yuki_tanaka",
    type: PostType.DOES_THIS_SOUND_NATURAL,
    status: PostStatus.ANSWERED,
    title: "Does this sound natural? - Emailing my professor in English",
    content: `I'm writing an email to my university professor in English. Does this sound natural?\n\n---\n\nDear Professor Smith,\n\nI am writing to you because I would like to ask about the assignment that is due next week. I am having difficulty understanding the requirements. Could you please explain them to me in more detail?\n\nI am looking forward to your reply.\n\nBest regards,\nYuki Tanaka\n\n---\n\nIs this too formal? Too stiff? What would a native speaker write?`,
    targetLanguageCode: "en",
    tagSlugs: ["writing", "business"],
    viewCount: 203,
  },
  {
    authorUsername: "carlos_garcia",
    type: PostType.DOES_THIS_SOUND_NATURAL,
    status: PostStatus.OPEN,
    title: "Does this sound natural? - Ordering food in English",
    content: `When I go to a restaurant in the US, I usually say:\n\n"I would like to have the chicken sandwich, please."\n\nMy American friends tell me this sounds "too polite" or "robotic." What do native speakers actually say when ordering food? Is "Can I get..." more natural?`,
    targetLanguageCode: "en",
    tagSlugs: ["speaking", "culture"],
    viewCount: 167,
  },
  {
    authorUsername: "mike_johnson",
    type: PostType.DOES_THIS_SOUND_NATURAL,
    status: PostStatus.OPEN,
    title: "Does this sound natural? - Declining an invitation in Japanese",
    content: `I want to politely decline a dinner invitation from a colleague in Japanese. I wrote:\n\nすみません、今週はちょっと忙しいので、行けないと思います。また今度誘ってください。\n\n(Sorry, I'm a bit busy this week, so I don't think I can go. Please invite me again next time.)\n\nDoes this sound natural and polite enough for a work colleague?`,
    targetLanguageCode: "ja",
    tagSlugs: ["speaking", "culture", "keigo"],
    viewCount: 88,
  },

  // ── PLEASE_CORRECT type ───────────────────────────────────────────────────
  {
    authorUsername: "sakura_ito",
    type: PostType.PLEASE_CORRECT,
    status: PostStatus.ANSWERED,
    title: "Please correct my English paragraph about my hobby",
    content: `Please correct my English writing. I wrote about my hobby:\n\n---\n\n"My hobby is to cooking. I cook every day since 3 years. I like most to make Japanese food but recently I am interesting in Italian food too. Last week I maked a pasta carbonara and it was very delicious. My family said it is the most good pasta they eated."\n\n---\n\nPlease fix all mistakes and explain why. Thank you!`,
    targetLanguageCode: "en",
    tagSlugs: ["writing", "grammar"],
    viewCount: 276,
  },
  {
    authorUsername: "marie_dupont",
    type: PostType.PLEASE_CORRECT,
    status: PostStatus.OPEN,
    title: "Please correct my Spanish email to a client",
    content: `I'm trying to write a business email in Spanish. Please correct it:\n\n---\n\n"Estimado Sr. López,\n\nGracias por su mensaje. Yo quiero confirmar que nosotros recibimos su pedido. El paquete será enviado en la próxima semana. Si tiene algunas preguntas, no dude en contactarnos.\n\nCordiales saludos,\nMarie Dupont"\n\n---\n\nI feel like something is off but I can't pinpoint what. Is "algunas preguntas" correct here?`,
    targetLanguageCode: "es",
    tagSlugs: ["writing", "business", "grammar"],
    viewCount: 54,
  },
  {
    authorUsername: "thanh_pham",
    type: PostType.PLEASE_CORRECT,
    status: PostStatus.OPEN,
    title: "Please correct my English self-introduction",
    content: `I need to introduce myself at a conference. Please correct:\n\n---\n\n"Hello everyone. My name is Thanh and I come from Vietnam. I have been working as software engineer for 5 years. I interesting in web development and I want to sharing my experience about building scalable applications. I hope you will enjoy my presentation. Thank you for your listening."\n\n---\n\nI know there are mistakes but I want to understand the correct patterns.`,
    targetLanguageCode: "en",
    tagSlugs: ["speaking", "business", "grammar"],
    viewCount: 143,
  },

  // ── WHATS_THE_DIFFERENCE type ─────────────────────────────────────────────
  {
    authorUsername: "wei_chen",
    type: PostType.WHATS_THE_DIFFERENCE,
    status: PostStatus.ANSWERED,
    title: 'What\'s the difference between "make" and "do" in English?',
    content: `In Chinese, we typically use 做 (zuò) for both "make" and "do" in English. But I keep getting them wrong.\n\n- "make a decision" but "do homework"?\n- "make a mistake" but "do the dishes"?\n- "make money" but "do business"?\n\nIs there a rule, or do I just have to memorize every combination?`,
    targetLanguageCode: "en",
    tagSlugs: ["vocabulary", "grammar"],
    viewCount: 289,
  },
  {
    authorUsername: "yuki_tanaka",
    type: PostType.WHATS_THE_DIFFERENCE,
    status: PostStatus.OPEN,
    title: 'What\'s the difference between "see", "look", and "watch"?',
    content: `In Japanese, we mainly use 見る (miru) for all of these. But English has three different words:\n\n- see\n- look (at)\n- watch\n\nI know "watch TV" and "see a doctor" but I get confused in other situations. Like:\n- Do I "see" or "watch" a movie?\n- Do I "look at" or "see" a beautiful sunset?\n\nWhat's the core difference between these three?`,
    targetLanguageCode: "en",
    tagSlugs: ["vocabulary"],
    viewCount: 178,
  },
  {
    authorUsername: "carlos_garcia",
    type: PostType.WHATS_THE_DIFFERENCE,
    status: PostStatus.OPEN,
    title: 'What\'s the difference between "say", "tell", "speak", and "talk"?',
    content: `Spanish has "decir" and "hablar" but English has four words for communication:\n\n- say: "She said hello"\n- tell: "She told me a story"\n- speak: "She speaks English"\n- talk: "She talked to me"\n\nSometimes they seem interchangeable. Can someone explain the differences clearly?`,
    targetLanguageCode: "en",
    tagSlugs: ["vocabulary", "grammar"],
    viewCount: 145,
  },

  // ── DISCUSSION type ───────────────────────────────────────────────────────
  {
    authorUsername: "soo_jin",
    type: PostType.DISCUSSION,
    status: PostStatus.OPEN,
    title: "What's your experience with language exchange apps?",
    content: `I've tried several language exchange apps (HelloTalk, Tandem, etc.) to practice Japanese, but I find it hard to maintain consistent conversations.\n\nWhat's been your experience? Do you have tips for:\n- Finding good language partners?\n- Keeping conversations going beyond the first few messages?\n- Balancing between practicing your target language and helping your partner?\n\nI'd love to hear what has worked for others!`,
    targetLanguageCode: "ja",
    tagSlugs: ["tips", "resources", "speaking"],
    viewCount: 334,
  },
  {
    authorUsername: "wei_chen",
    type: PostType.DISCUSSION,
    status: PostStatus.OPEN,
    title: "How long did it take you to become conversational?",
    content: `I've been studying Japanese for about 2 years now and while I can read manga with a dictionary, I still freeze up in real conversations.\n\nI'm curious about other people's timelines:\n- How long did it take you to have basic conversations in your target language?\n- What was the breakthrough moment?\n- Did you study in the country or self-study?\n\nI want to set realistic expectations for myself.`,
    targetLanguageCode: "ja",
    tagSlugs: ["tips", "speaking"],
    viewCount: 412,
  },
  {
    authorUsername: "admin",
    type: PostType.DISCUSSION,
    status: PostStatus.OPEN,
    title: "Best resources for learning Vietnamese in 2024?",
    content: `I've been learning Vietnamese for a while now and want to share some resources I've found helpful, and hear about others:\n\nWhat I'm using:\n- Pimsleur Vietnamese (good for pronunciation/tones)\n- "Vietnamese: An Essential Grammar" by Binh Nhu Ngo\n- YouTube channels like Learn Vietnamese with Annie\n\nWhat are your go-to resources? Especially looking for:\n- Listening practice with natural speech\n- Northern vs Southern dialect materials\n- Intermediate level content (not just beginner stuff)`,
    targetLanguageCode: "vi",
    tagSlugs: ["resources", "tips", "listening"],
    viewCount: 187,
  },

  // ── RESOURCE type ─────────────────────────────────────────────────────────
  {
    authorUsername: "soo_jin",
    type: PostType.RESOURCE,
    status: PostStatus.OPEN,
    title: "Free TOPIK preparation materials and study plan",
    content: `I passed TOPIK II Level 5 last year and want to share the resources I used:\n\n**Reading:**\n- TOPIK GUIDE website (free practice tests)\n- Naver News (start with entertainment section, easier vocab)\n\n**Listening:**\n- KBS World Radio Korean lessons\n- Talk To Me In Korean podcast (TTMIK)\n\n**Writing:**\n- Practice with past TOPIK essays\n- Get corrections on SpeakStack!\n\n**Study Plan:**\n- 3 months before: focus on grammar patterns\n- 1 month before: practice tests every weekend\n- Last week: review wrong answers\n\nHope this helps someone preparing for TOPIK!`,
    targetLanguageCode: "ko",
    tagSlugs: ["resources", "topik", "tips"],
    viewCount: 456,
  },
  {
    authorUsername: "yuki_tanaka",
    type: PostType.RESOURCE,
    status: PostStatus.OPEN,
    title: "My favorite English learning YouTube channels",
    content: `I've been studying English for years and these YouTube channels helped me the most:\n\n1. **English with Lucy** — Great British English pronunciation\n2. **Rachel's English** — Best for American pronunciation\n3. **BBC Learning English** — News-based learning\n4. **engVid** — Multiple teachers, covers grammar well\n5. **TED-Ed** — Great for advanced listening\n\nFor Japanese speakers specifically:\n- **Atsueigo** — Explains in Japanese, very helpful\n- **Kevin's English Room** — Fun comparisons between English and Japanese\n\nWhat channels do you recommend?`,
    targetLanguageCode: "en",
    tagSlugs: ["resources", "listening", "pronunciation"],
    viewCount: 523,
  },

  // ── Edge cases ────────────────────────────────────────────────────────────
  // Deleted post
  {
    authorUsername: "raj_patel",
    type: PostType.QUESTION,
    status: PostStatus.OPEN,
    title: "[Deleted] Test post please ignore",
    content: "This is a test post that was deleted by the author.",
    targetLanguageCode: "en",
    tagSlugs: [],
    isDeleted: true,
    viewCount: 5,
  },
  // Closed post
  {
    authorUsername: "mike_johnson",
    type: PostType.QUESTION,
    status: PostStatus.CLOSED,
    title: "Can someone do my Japanese homework?",
    content: "I have a Japanese assignment due tomorrow. Can someone translate these 10 sentences for me? Will pay $5.",
    targetLanguageCode: "ja",
    tagSlugs: ["translation"],
    isClosed: true,
    closedReason: "This post was closed because it violates our community guidelines. We help people learn, but we don't do homework for others.",
    closedByUsername: "admin",
    viewCount: 34,
  },
  // Additional variety posts
  {
    authorUsername: "wei_chen",
    type: PostType.HOW_DO_YOU_SAY,
    status: PostStatus.ANSWERED,
    title: 'How do you say "long time no see" in Japanese?',
    content: `I know this phrase actually comes from Chinese (好久不见), but what's the natural Japanese equivalent?\n\nIs it just 久しぶり (hisashiburi)? Are there formal and casual versions?`,
    targetLanguageCode: "ja",
    tagSlugs: ["vocabulary", "speaking"],
    viewCount: 134,
  },
  {
    authorUsername: "soo_jin",
    type: PostType.PLEASE_CORRECT,
    status: PostStatus.ANSWERED,
    title: "Please correct my Japanese diary entry",
    content: `I wrote a short diary entry in Japanese. Please correct:\n\n---\n\n"今日は友達と一緒に映画を見に行きました。映画はとても面白いでした。その後、レストランに行って、おいしい料理を食べました。私はカレーを食べたが、友達はラーメンを食べました。楽しいな一日でした。"\n\n---\n\nI'm JLPT N3 level. Please explain my mistakes!`,
    targetLanguageCode: "ja",
    tagSlugs: ["writing", "grammar", "jlpt"],
    viewCount: 192,
  },
  {
    authorUsername: "mod_linh",
    type: PostType.WHATS_THE_DIFFERENCE,
    status: PostStatus.OPEN,
    title: "What's the difference between 聞く, 聴く, and 訊く in Japanese?",
    content: `I know all three kanji are read as きく (kiku) in Japanese, but they have different nuances:\n\n- 聞く\n- 聴く\n- 訊く\n\nWhen do you use each one? I often see 聞く used most commonly but I'm curious about the specific differences. This seems similar to how Vietnamese has different words for different types of listening/asking.`,
    targetLanguageCode: "ja",
    tagSlugs: ["vocabulary", "kanji"],
    viewCount: 98,
  },
  {
    authorUsername: "marie_dupont",
    type: PostType.DOES_THIS_SOUND_NATURAL,
    status: PostStatus.OPEN,
    title: "Does this sound natural? - Talking about weekend plans in Spanish",
    content: `I wrote about my weekend plans in Spanish:\n\n---\n\n"Este fin de semana, voy a ir a la playa con mis amigos. Nosotros vamos a nadar y tomar el sol. Después, vamos a comer en un restaurante cerca del mar. Yo espero que el tiempo será bueno."\n\n---\n\nDoes this sound like how a native speaker would say it? I feel like I'm being too formal or textbook-like.`,
    targetLanguageCode: "es",
    tagSlugs: ["writing", "speaking"],
    viewCount: 62,
  },
  {
    authorUsername: "thanh_pham",
    type: PostType.QUESTION,
    status: PostStatus.OPEN,
    title: "How to improve English listening skills for fast speech?",
    content: `I can understand English when people speak slowly and clearly, but when native speakers talk at normal speed, I get lost.\n\nSpecific problems:\n- Connected speech ("wanna" instead of "want to", "gonna" instead of "going to")\n- Swallowed sounds and reductions\n- Different accents (I only understand American accent from movies)\n\nWhat strategies helped you improve your listening comprehension for real-world speech?`,
    targetLanguageCode: "en",
    tagSlugs: ["listening", "pronunciation", "tips"],
    viewCount: 267,
  },
  {
    authorUsername: "admin",
    type: PostType.QUESTION,
    status: PostStatus.ANSWERED,
    title: "Vietnamese tones: How to distinguish hỏi and ngã?",
    content: `As an English speaker, the hardest part of Vietnamese pronunciation for me is distinguishing between the hỏi (?) and ngã (~) tones.\n\nTo my ears, they sound almost identical — both seem to go down then up.\n\nNative Vietnamese speakers: can you explain the difference? Any tips for practicing?`,
    targetLanguageCode: "vi",
    tagSlugs: ["pronunciation", "tips"],
    viewCount: 198,
  },
  {
    authorUsername: "mike_johnson",
    type: PostType.QUESTION,
    status: PostStatus.OPEN,
    title: "Best way to memorize kanji? RTK vs WaniKani vs Anki?",
    content: `I've been trying to learn kanji for months and I'm overwhelmed. There seem to be three popular methods:\n\n1. **RTK (Remembering the Kanji)** — Learn meanings first, readings later\n2. **WaniKani** — SRS-based, teaches radicals → kanji → vocab\n3. **Anki** — DIY flashcards, completely customizable\n\nWhich method worked for you? I'm aiming for JLPT N2 level (~1000 kanji). Currently I know about 200 kanji but I keep forgetting them.`,
    targetLanguageCode: "ja",
    tagSlugs: ["kanji", "jlpt", "resources", "tips"],
    viewCount: 387,
  },
  {
    authorUsername: "carlos_garcia",
    type: PostType.DISCUSSION,
    status: PostStatus.OPEN,
    title: "Is it rude to correct someone's English in conversation?",
    content: `I'm at an intermediate level in English and I have mixed feelings about being corrected.\n\nSometimes I want people to correct me so I can improve, but other times it feels embarrassing, especially in group settings.\n\nQuestions for the community:\n- Do you prefer to be corrected immediately or later?\n- How do you politely correct someone without making them feel bad?\n- Is it different in professional vs casual settings?\n\nI think this is important for our community since we're all learning from each other.`,
    targetLanguageCode: "en",
    tagSlugs: ["culture", "speaking", "tips"],
    viewCount: 298,
  },
];

// ─── Answers ─────────────────────────────────────────────────────────────────

interface AnswerSeed {
  postIndex: number; // index into POSTS array
  authorUsername: string;
  content: string;
  isAccepted?: boolean;
  isVerified?: boolean;
  verifiedByUsername?: string;
  verifierIsNative?: boolean;
  isDeleted?: boolean;
}

const ANSWERS: AnswerSeed[] = [
  // Post 0: は vs が (mike_johnson's question)
  {
    postIndex: 0,
    authorUsername: "yuki_tanaka",
    content: `Great question! As a native Japanese speaker, here's how I think about は vs が:\n\n**は (topic marker) — "Speaking of X..."**\n- Used to introduce the topic you're talking about\n- 私**は**学生です = "As for me, I'm a student"\n\n**が (subject marker) — "X is the one that..."**\n- Used to identify or emphasize the subject\n- 誰**が**来ましたか = "WHO is the one that came?"\n\n**Key rules:**\n1. Use が with question words (誰が, 何が, どこが)\n2. Use が when introducing NEW information\n3. Use は when talking about KNOWN/established topics\n4. Use が with existence verbs (いる/ある): 猫**が**いる\n5. Use は for contrast: コーヒー**は**好きだけど、紅茶**は**好きじゃない\n\nA simple test: if you can say "Speaking of X..." naturally, use は. If you're pointing out or identifying something, use が.`,
    isAccepted: true,
    isVerified: true,
    verifiedByUsername: "yuki_tanaka",
    verifierIsNative: true,
  },
  {
    postIndex: 0,
    authorUsername: "wei_chen",
    content: `Adding to Yuki's excellent answer:\n\nOne pattern that helped me was thinking about **old vs new information**:\n\n- は marks information the listener already knows (old)\n- が marks information that's new or surprising\n\nExample:\n- A: 昨日、パーティーに行きました。(Yesterday, I went to a party.)\n- B: 誰**が**来ましたか？(Who came?) — asking for NEW info\n- A: 田中さん**が**来ました。(Tanaka came.) — providing NEW info\n\nBut then if you continue talking about Tanaka:\n- 田中さん**は**とても元気でした。(Tanaka was very energetic.) — now he's OLD info/topic\n\nThis "information flow" perspective really helped me as a Chinese speaker!`,
    isAccepted: false,
  },

  // Post 4: phrasal verbs (thanh_pham's question)
  {
    postIndex: 4,
    authorUsername: "mike_johnson",
    content: `As a native English speaker, here are the phrasal verbs I use literally every day:\n\n**Essential (use daily):**\n1. **get up** — wake up / stand up\n2. **wake up** — stop sleeping\n3. **turn on/off** — activate/deactivate\n4. **pick up** — lift / answer phone / learn casually\n5. **put on** — wear\n6. **take off** — remove clothing / plane departing\n7. **look for** — search\n8. **find out** — discover\n9. **give up** — stop trying\n10. **come back** — return\n\n**Very common:**\n11. **figure out** — understand/solve\n12. **look up** — search for information\n13. **run out of** — have no more of something\n14. **come up with** — think of an idea\n15. **get along with** — have a good relationship\n16. **look forward to** — anticipate with excitement\n17. **put off** — postpone\n18. **bring up** — mention a topic\n19. **turn out** — result in\n20. **work out** — exercise / solve / succeed\n\nTip: Don't try to memorize all at once. Learn 2-3 per week and try to use them in conversation!`,
    isAccepted: true,
    isVerified: true,
    verifiedByUsername: "admin",
    verifierIsNative: true,
  },
  {
    postIndex: 4,
    authorUsername: "soo_jin",
    content: `I'd add a few more that were game-changers for me as a Korean speaker:\n\n- **end up** — finally be in a situation (unexpectedly): "I ended up staying home"\n- **hang out** — spend time casually: "Let's hang out this weekend"\n- **show up** — arrive/appear: "He didn't show up to the meeting"\n- **check out** — look at / leave a hotel: "Check out this video!"\n- **go through** — experience something difficult: "She's going through a hard time"\n\nAlso, one trick: many phrasal verbs can be separated:\n- "Turn the TV **off**" = "Turn **off** the TV" (both correct)\n- But with pronouns, you MUST separate: "Turn **it** off" (not "Turn off it")`,
    isAccepted: false,
  },

  // Post 6: "I'm looking forward to it" in Japanese
  {
    postIndex: 6,
    authorUsername: "yuki_tanaka",
    content: `Yes! 楽しみにしています is perfect! Here are the levels of formality:\n\n**Formal (business/elders):**\n- 楽しみにしております (tanoshimi ni shite orimasu) — most polite\n- 楽しみにしています (tanoshimi ni shite imasu) — standard polite\n\n**Casual (friends):**\n- 楽しみにしてる (tanoshimi ni shiteru) — casual\n- 楽しみ！(tanoshimi!) — most casual, just "exciting!"\n\n**Examples:**\n- Boss invites you to dinner: 楽しみにしております\n- Friend invites you to a party: 楽しみ～！\n- Coworker you're friendly with: 楽しみにしてます`,
    isAccepted: true,
    isVerified: true,
    verifiedByUsername: "yuki_tanaka",
    verifierIsNative: true,
  },

  // Post 9: "no worries" in Korean
  {
    postIndex: 9,
    authorUsername: "soo_jin",
    content: `Here are the ways to say "no worries" in Korean, from formal to casual:\n\n**Formal:**\n- 괜찮습니다 (gwaenchansseumnida) — very formal\n- 신경 쓰지 마세요 (singyeong sseuji maseyo) — "Don't worry about it"\n\n**Polite:**\n- 괜찮아요 (gwaenchanayo) — standard, works in most situations\n- 별말씀을요 (byeolmalsseumeullyo) — "Don't mention it"\n\n**Casual (friends/younger):**\n- 괜찮아 (gwaenchana) — most common casual\n- 아니야, 괜찮아 (aniya, gwaenchana) — "No no, it's fine"\n- 별거 아니야 (byeolgeo aniya) — "It's nothing"\n- ㄱㅊ (in text messages) — abbreviated 괜찮아\n\nPro tip: 괜찮아(요) is the Swiss Army knife of Korean. It works for "it's okay," "I'm fine," "no worries," and even "no thanks." You really can't go wrong with it!`,
    isAccepted: true,
    isVerified: true,
    verifiedByUsername: "soo_jin",
    verifierIsNative: true,
  },

  // Post 11: Email to professor (yuki_tanaka)
  {
    postIndex: 11,
    authorUsername: "mike_johnson",
    content: `Your email is actually quite good! It's grammatically correct and appropriate. A few suggestions to make it sound more natural:\n\n**Your version:**\n> I am writing to you because I would like to ask about the assignment...\n\n**More natural version:**\n> Dear Professor Smith,\n>\n> I hope this email finds you well. I had a question about the assignment due next week — I'm having some trouble understanding the requirements. Would you be able to clarify them when you get a chance?\n>\n> Thank you for your time.\n>\n> Best,\n> Yuki\n\n**Key changes:**\n1. "I hope this email finds you well" — common opener (optional but nice)\n2. "I had a question about..." — more natural than "I am writing because I would like to ask"\n3. "Would you be able to..." — softer than "Could you please"\n4. "When you get a chance" — shows respect for their time\n5. "Best," — shorter closing is fine for professors you know\n\nYour original is NOT wrong — it's just more formal than most American students would write. In a US university, casual-professional is the norm.`,
    isAccepted: true,
    isVerified: true,
    verifiedByUsername: "mike_johnson",
    verifierIsNative: true,
  },
  {
    postIndex: 11,
    authorUsername: "soo_jin",
    content: `As another non-native speaker, I want to add that the "right" formality depends on the culture!\n\nIn the US — Mike's casual version is perfect.\nIn the UK — your original formal version might actually be more appropriate.\nIn Korea/Japan — we tend to be very formal with professors, so your instinct makes total sense.\n\nOne thing I learned: in the US, professors often prefer emails that get to the point quickly. They receive hundreds of emails, so being concise is actually more respectful than being ultra-polite.`,
    isAccepted: false,
  },

  // Post 15: Please correct hobby paragraph (sakura_ito)
  {
    postIndex: 15,
    authorUsername: "admin",
    content: `Here's your corrected text with explanations:\n\n**Original → Corrected:**\n\n❌ "My hobby is **to cooking**"\n✅ "My hobby is **cooking**"\n→ After "is," use gerund (-ing), not "to + -ing"\n\n❌ "I cook every day **since 3 years**"\n✅ "I **have been cooking** every day **for 3 years**"\n→ Use "for" (duration) not "since" (starting point). Use present perfect continuous for ongoing actions.\n\n❌ "I like **most to make**"\n✅ "I like **making... the most**" or "**What I enjoy most is making**"\n→ "Most" goes at the end, and use gerund after "like"\n\n❌ "I **am interesting** in"\n✅ "I **am interested** in"\n→ "Interested" (feeling) vs "interesting" (causing interest)\n\n❌ "I **maked**"\n✅ "I **made**"\n→ "Make" is irregular: make → made → made\n\n❌ "**the most good** pasta"\n✅ "**the best** pasta"\n→ "Good" is irregular: good → better → best\n\n❌ "they **eated**"\n✅ "they **had eaten** / they **had ever eaten**"\n→ "Eat" is irregular: eat → ate → eaten\n\n**Corrected paragraph:**\n"My hobby is cooking. I have been cooking every day for 3 years. What I enjoy most is making Japanese food, but recently I've become interested in Italian food too. Last week I made pasta carbonara and it was delicious. My family said it was the best pasta they had ever eaten."`,
    isAccepted: true,
    isVerified: true,
    verifiedByUsername: "admin",
    verifierIsNative: true,
  },

  // Post 18: "make" vs "do" (wei_chen)
  {
    postIndex: 18,
    authorUsername: "mike_johnson",
    content: `There IS a general pattern, though there are exceptions:\n\n**DO** — routine tasks, work, obligations\n- do homework, do housework, do the dishes\n- do your job, do business, do a task\n- do your best, do someone a favor\n- do exercise (but "make" for specific exercises)\n\n**MAKE** — creating, producing, causing something new\n- make food (make dinner, make coffee)\n- make a decision, make a choice\n- make a mistake, make progress\n- make money, make a plan\n- make a phone call, make an effort\n- make friends, make noise\n\n**The rough rule:**\n- **DO** = performing an action (nothing new is created)\n- **MAKE** = producing/creating a result\n\n**Common tricky ones:**\n- "make the bed" (not do) — you're "creating" a neat bed\n- "do the laundry" (not make) — it's a chore/routine\n- "make an appointment" (not do) — you're creating one\n\nHonestly though, there are enough exceptions that you'll need to memorize the most common collocations. The good news: even if you mix them up, people will always understand you!`,
    isAccepted: true,
    isVerified: true,
    verifiedByUsername: "admin",
    verifierIsNative: true,
  },

  // Post 27: "long time no see" in Japanese
  {
    postIndex: 27,
    authorUsername: "yuki_tanaka",
    content: `Yes! Here are the Japanese equivalents:\n\n**Casual (friends):**\n- 久しぶり！(hisashiburi!) — Most common casual version\n- 久しぶりだね！(hisashiburi da ne!) — With a friendly "right?"\n\n**Polite (coworkers, acquaintances):**\n- お久しぶりです (ohisashiburi desu) — Standard polite\n\n**Very formal (business, elders):**\n- ご無沙汰しております (gobusata shite orimasu) — Very formal, implies "I'm sorry for not being in touch"\n\n**Fun fact:** "Long time no see" in English is actually believed by some linguists to be a calque (direct translation) from Chinese 好久不見! So the phrase has come full circle. 😄\n\n**Usage tip:** Unlike English where "long time no see" works in any situation, in Japanese you need to match the formality level to the relationship. Using 久しぶり with your boss would be too casual!`,
    isAccepted: true,
    isVerified: true,
    verifiedByUsername: "yuki_tanaka",
    verifierIsNative: true,
  },

  // Post 28: Please correct Japanese diary (soo_jin)
  {
    postIndex: 28,
    authorUsername: "yuki_tanaka",
    content: `Your Japanese is pretty good for N3! Here are the corrections:\n\n❌ "面白い**でした**"\n✅ "面白**かったです**"\n→ i-adjectives change form: 面白い → 面白かった (past). Don't add でした to i-adjectives.\n\n❌ "食べた**が**"\n✅ "食べた**けど** / 食べました**が**"\n→ が for contrast is formal. In a diary (casual), use けど. If using が, keep the whole sentence in ます form.\n\n❌ "楽し**いな**一日"\n✅ "楽し**い**一日" or "楽しかった一日"\n→ な is for na-adjectives (静かな). 楽しい is an i-adjective, so no な needed.\n\n**Corrected version:**\n"今日は友達と一緒に映画を見に行きました。映画はとても面白かったです。その後、レストランに行って、おいしい料理を食べました。私はカレーを食べたけど、友達はラーメンを食べました。楽しい一日でした。"\n\nKeep writing diary entries — it's one of the best ways to improve! 📝`,
    isAccepted: true,
    isVerified: true,
    verifiedByUsername: "yuki_tanaka",
    verifierIsNative: true,
  },
  {
    postIndex: 28,
    authorUsername: "mike_johnson",
    content: `As a fellow Japanese learner (also around N3), I want to point out something that helped me with the i-adjective mistake:\n\n**Pattern to remember:**\ni-adjective + です (present): 面白いです\ni-adjective past: 面白**かった**です (NOT 面白いでした)\n\nna-adjective + です (present): 静かです\nna-adjective past: 静か**でした** (here でした IS correct)\n\nThe rule is: i-adjectives conjugate themselves (drop い, add かった). na-adjectives use でした because they don't conjugate.\n\nI made this same mistake for months until someone explained it this way!`,
    isAccepted: false,
  },

  // Post 32: Vietnamese tones (admin's question)
  {
    postIndex: 32,
    authorUsername: "mod_linh",
    content: `Đây là câu hỏi rất hay! / Great question!\n\nAs a native Vietnamese speaker (Northern dialect), here's the difference:\n\n**Hỏi tone (?)** — starts mid, dips down, then rises slightly\n- Think of it as a "questioning" tone\n- It's smoother and gentler\n- Example: bảo (to tell), hỏi (to ask)\n\n**Ngã tone (~)** — starts mid, dips down, then rises sharply with a glottal stop\n- Think of it as a "broken" or "creaky" tone\n- There's a brief interruption in your voice (glottal stop)\n- Example: bão (storm), ngã (to fall)\n\n**Practice tips:**\n1. Put your hand on your throat — ngã has a noticeable "catch" that hỏi doesn't\n2. Hỏi is smooth like a U shape: ˘\n3. Ngã is like a checkmark with a bump: ˜\n4. Record yourself and compare with native audio\n5. In Southern Vietnamese, they actually merge into one tone! So if you're in Ho Chi Minh City, don't worry as much.\n\n**Minimal pairs to practice:**\n- bản (map) vs bãn (doesn't exist, but try the tone)\n- hải (sea) vs hãi (rare but try)\n- mỉm (to smile slightly) vs mĩ (beautiful/America)`,
    isAccepted: true,
    isVerified: true,
    verifiedByUsername: "mod_linh",
    verifierIsNative: true,
  },
  {
    postIndex: 32,
    authorUsername: "thanh_pham",
    content: `As another Vietnamese native speaker, I want to add some practical advice:\n\nThe hardest thing about hỏi vs ngã for foreigners is the **glottal stop** in ngã. Here's how to feel it:\n\n1. Say "uh-oh" in English\n2. Feel that stop between "uh" and "oh"? That's a glottal stop.\n3. Now try to put that stop in the middle of a Vietnamese word with ngã tone.\n\n**Also important:** In everyday speech in the South (Saigon), we actually pronounce both tones the same way (as hỏi). So if you're planning to live in Southern Vietnam, this distinction matters less.\n\nBut for Northern Vietnamese (Hanoi), the distinction is important and people will notice.\n\nDon't get discouraged — even Vietnamese children take years to master the correct tone marks in writing! 💪`,
    isAccepted: false,
  },

  // Post 3: French subjunctive (anna_schmidt's question) — no accepted answer yet
  {
    postIndex: 3,
    authorUsername: "marie_dupont",
    content: `Ah, le subjonctif ! As a French native, I can help:\n\n**Main triggers for subjunctive:**\n\n1. **Desire/Will:** vouloir que, souhaiter que, désirer que\n2. **Necessity:** il faut que, il est nécessaire que\n3. **Emotion:** être content que, avoir peur que, être triste que\n4. **Doubt/Uncertainty:** douter que, il est possible que\n5. **Negation of certainty:** ne pas penser que, ne pas croire que\n\n**Your specific questions:**\n- "Je pense que..." → **INDICATIVE** ✅ (you're stating a belief)\n- "Je ne pense pas que..." → **SUBJUNCTIVE** ✅ (negation introduces doubt)\n\n**When you DON'T need subjunctive:**\n- After "parce que, puisque" (because)\n- After "il est certain que, il est évident que"\n- After "je sais que, je crois que" (certainty)\n\n**Tip:** If the main clause expresses certainty → indicative. If it expresses uncertainty, desire, or emotion → subjunctive.`,
    isAccepted: false,
    isVerified: true,
    verifiedByUsername: "marie_dupont",
    verifierIsNative: true,
  },

  // Post 5: Present Perfect vs Simple Past (carlos_garcia)
  {
    postIndex: 5,
    authorUsername: "admin",
    content: `This is a really common confusion! Here's the key:\n\n**Simple Past** — finished action at a specific time\n- "I **ate** breakfast at 8am" (specific time)\n- "I **went** to Japan in 2019" (specific time)\n- "Shakespeare **wrote** Hamlet" (specific, completed period)\n\n**Present Perfect** — connects past to present\n- "I **have eaten** already" (relevant now: I'm not hungry)\n- "I **have been** to Japan" (life experience, no specific time)\n- "I **have lived** here for 5 years" (started in past, still true)\n\n**The golden rule:** If you mention a SPECIFIC time → Simple Past. If the time is unspecified or the result matters NOW → Present Perfect.\n\n**British vs American English:**\nYes! There IS a difference:\n- British: "I**'ve just eaten**" (present perfect preferred)\n- American: "I **just ate**" (simple past is fine)\n\nAmericans use Simple Past more often in situations where British speakers use Present Perfect. Both are correct in their dialect.\n\nAs a Spanish speaker, your "Pretérito Perfecto" maps roughly to Present Perfect, but the usage rules don't match 100%.`,
    isAccepted: false,
  },

  // Post 30: weekend plans in Spanish (marie_dupont)
  {
    postIndex: 30,
    authorUsername: "carlos_garcia",
    content: `¡Tu español es bastante bueno! Here are some suggestions to make it sound more natural:\n\n**Your version → More natural version:**\n\n❌ "Nosotros vamos a nadar"\n✅ "Vamos a nadar"\n→ In Spanish, we almost NEVER use subject pronouns (yo, nosotros, etc.) unless for emphasis. The verb form already tells us who.\n\n❌ "Yo espero que el tiempo **será** bueno"\n✅ "Espero que el tiempo **sea** bueno"\n→ "Esperar que" triggers SUBJUNCTIVE! (sea, not será)\n→ Also drop "Yo"\n\n**More natural version:**\n"Este fin de semana voy a ir a la playa con mis amigos. Vamos a nadar y tomar el sol. Después, vamos a comer en un restaurante cerca del mar. Espero que haga buen tiempo."\n\n**Bonus:** "Espero que haga buen tiempo" (I hope the weather is good) is even more natural than "espero que el tiempo sea bueno". We use "hacer + weather" in Spanish: hace calor, hace frío, hace buen tiempo.`,
    isAccepted: false,
    isVerified: true,
    verifiedByUsername: "carlos_garcia",
    verifierIsNative: true,
  },

  // Post 31: English listening (thanh_pham) — open question, multiple answers
  {
    postIndex: 31,
    authorUsername: "mike_johnson",
    content: `As a native speaker who teaches English, here are my top tips for understanding fast speech:\n\n**1. Learn common reductions:**\n- "want to" → "wanna"\n- "going to" → "gonna"\n- "got to" → "gotta"\n- "kind of" → "kinda"\n- "don't know" → "dunno"\n- "give me" → "gimme"\n- "let me" → "lemme"\n\n**2. Practice with podcasts at different speeds:**\n- Start at 0.75x speed\n- Move to 1x when comfortable\n- Then try 1.25x — when you go back to 1x it'll feel slow!\n\n**3. Shadow native speakers:**\n- Play audio and speak along simultaneously\n- This trains your ear AND your mouth\n\n**4. Expose yourself to different accents:**\n- American: podcasts, Netflix\n- British: BBC\n- Australian: try some Aussie YouTubers\n\n**5. Best resources:**\n- "English Pronunciation in Use" (Cambridge)\n- Rachel's English YouTube channel\n- The "Elllo" website (free listening with transcripts)\n- Netflix with ENGLISH subtitles (not Vietnamese!)`,
    isAccepted: false,
  },

  // Post 34: kanji methods (mike_johnson)
  {
    postIndex: 34,
    authorUsername: "yuki_tanaka",
    content: `As a Japanese native, I can't speak to learning kanji as a foreigner, but I can share how WE learn them:\n\n- In school, we learn kanji by writing them repeatedly (書き取り)\n- We learn them in context with vocabulary, not in isolation\n- Radicals (部首) are important — they help you guess meaning and reading\n\nMy recommendation for foreigners based on what I've seen work:\n\n1. **Learn radicals first** — all three methods agree on this\n2. **WaniKani** is great if you want structure and don't mind paying\n3. **RTK + Anki** is great if you're self-motivated and want it free\n4. **Don't skip writing practice** — writing helps memory even if you'll mostly type\n\nFor JLPT N2, you need ~1,000 kanji. At 5 new kanji/day with reviews, that's about 7 months. But the key is **consistent daily review** — 15 minutes every day beats 2 hours once a week.`,
    isAccepted: false,
    isVerified: true,
    verifiedByUsername: "yuki_tanaka",
    verifierIsNative: true,
  },
  {
    postIndex: 34,
    authorUsername: "wei_chen",
    content: `As a Chinese speaker who already knew the kanji/hanzi characters, my perspective is different. But I've helped many friends learn kanji and here's what I observed:\n\n**RTK pros:**\n- Fastest way to recognize kanji meanings\n- Creative mnemonics stick\n- Free (the book)\n\n**RTK cons:**\n- You learn MEANINGS but not READINGS\n- You can't read Japanese text after finishing RTK alone\n- Some mnemonics are weird and hard to remember\n\n**WaniKani pros:**\n- Teaches reading + meaning together\n- Built-in SRS, no setup needed\n- Great community and mnemonics\n\n**WaniKani cons:**\n- Costs money (~$9/month)\n- Locked progression (can't skip what you know)\n- Takes about 1-2 years to finish all 60 levels\n\n**My recommendation:** If you know 200 kanji already, use **Anki with a pre-made JLPT deck** (like the "Nihongo Shark" deck). It's the most efficient because you can customize the order and skip what you already know. Pair it with reading native material (NHK Easy News) as soon as possible.`,
    isAccepted: false,
  },
];

// ─── Votes ───────────────────────────────────────────────────────────────────

interface VoteSeed {
  voterUsername: string;
  targetType: "post" | "answer";
  targetIndex: number; // index into POSTS or ANSWERS array
  value: 1 | -1;
}

const VOTES: VoteSeed[] = [
  // Upvotes on popular posts
  { voterUsername: "yuki_tanaka", targetType: "post", targetIndex: 0, value: 1 },
  { voterUsername: "wei_chen", targetType: "post", targetIndex: 0, value: 1 },
  { voterUsername: "soo_jin", targetType: "post", targetIndex: 0, value: 1 },
  { voterUsername: "carlos_garcia", targetType: "post", targetIndex: 0, value: 1 },
  { voterUsername: "sakura_ito", targetType: "post", targetIndex: 0, value: 1 },

  { voterUsername: "mike_johnson", targetType: "post", targetIndex: 4, value: 1 },
  { voterUsername: "yuki_tanaka", targetType: "post", targetIndex: 4, value: 1 },
  { voterUsername: "carlos_garcia", targetType: "post", targetIndex: 4, value: 1 },
  { voterUsername: "sakura_ito", targetType: "post", targetIndex: 4, value: 1 },

  { voterUsername: "mike_johnson", targetType: "post", targetIndex: 18, value: 1 },
  { voterUsername: "yuki_tanaka", targetType: "post", targetIndex: 18, value: 1 },
  { voterUsername: "soo_jin", targetType: "post", targetIndex: 18, value: 1 },

  { voterUsername: "admin", targetType: "post", targetIndex: 23, value: 1 },
  { voterUsername: "mike_johnson", targetType: "post", targetIndex: 23, value: 1 },
  { voterUsername: "yuki_tanaka", targetType: "post", targetIndex: 23, value: 1 },
  { voterUsername: "wei_chen", targetType: "post", targetIndex: 23, value: 1 },
  { voterUsername: "raj_patel", targetType: "post", targetIndex: 23, value: 1 },
  { voterUsername: "thanh_pham", targetType: "post", targetIndex: 23, value: 1 },

  { voterUsername: "admin", targetType: "post", targetIndex: 24, value: 1 },
  { voterUsername: "mike_johnson", targetType: "post", targetIndex: 24, value: 1 },
  { voterUsername: "soo_jin", targetType: "post", targetIndex: 24, value: 1 },
  { voterUsername: "carlos_garcia", targetType: "post", targetIndex: 24, value: 1 },
  { voterUsername: "wei_chen", targetType: "post", targetIndex: 24, value: 1 },

  { voterUsername: "mike_johnson", targetType: "post", targetIndex: 32, value: 1 },
  { voterUsername: "thanh_pham", targetType: "post", targetIndex: 32, value: 1 },
  { voterUsername: "mod_linh", targetType: "post", targetIndex: 32, value: 1 },

  { voterUsername: "raj_patel", targetType: "post", targetIndex: 34, value: 1 },
  { voterUsername: "sakura_ito", targetType: "post", targetIndex: 34, value: 1 },
  { voterUsername: "wei_chen", targetType: "post", targetIndex: 34, value: 1 },
  { voterUsername: "yuki_tanaka", targetType: "post", targetIndex: 34, value: 1 },

  // Downvote on the closed homework post
  { voterUsername: "yuki_tanaka", targetType: "post", targetIndex: 26, value: -1 },
  { voterUsername: "admin", targetType: "post", targetIndex: 26, value: -1 },
  { voterUsername: "soo_jin", targetType: "post", targetIndex: 26, value: -1 },

  // Upvotes on popular answers
  { voterUsername: "mike_johnson", targetType: "answer", targetIndex: 0, value: 1 },
  { voterUsername: "wei_chen", targetType: "answer", targetIndex: 0, value: 1 },
  { voterUsername: "soo_jin", targetType: "answer", targetIndex: 0, value: 1 },
  { voterUsername: "admin", targetType: "answer", targetIndex: 0, value: 1 },
  { voterUsername: "raj_patel", targetType: "answer", targetIndex: 0, value: 1 },
  { voterUsername: "sakura_ito", targetType: "answer", targetIndex: 0, value: 1 },

  { voterUsername: "mike_johnson", targetType: "answer", targetIndex: 1, value: 1 },
  { voterUsername: "soo_jin", targetType: "answer", targetIndex: 1, value: 1 },

  { voterUsername: "thanh_pham", targetType: "answer", targetIndex: 2, value: 1 },
  { voterUsername: "carlos_garcia", targetType: "answer", targetIndex: 2, value: 1 },
  { voterUsername: "yuki_tanaka", targetType: "answer", targetIndex: 2, value: 1 },
  { voterUsername: "sakura_ito", targetType: "answer", targetIndex: 2, value: 1 },
  { voterUsername: "admin", targetType: "answer", targetIndex: 2, value: 1 },

  { voterUsername: "thanh_pham", targetType: "answer", targetIndex: 3, value: 1 },
  { voterUsername: "mike_johnson", targetType: "answer", targetIndex: 3, value: 1 },

  { voterUsername: "mike_johnson", targetType: "answer", targetIndex: 4, value: 1 },
  { voterUsername: "soo_jin", targetType: "answer", targetIndex: 4, value: 1 },
  { voterUsername: "admin", targetType: "answer", targetIndex: 4, value: 1 },

  { voterUsername: "raj_patel", targetType: "answer", targetIndex: 5, value: 1 },
  { voterUsername: "soo_jin", targetType: "answer", targetIndex: 5, value: 1 },
  { voterUsername: "admin", targetType: "answer", targetIndex: 5, value: 1 },
  { voterUsername: "mike_johnson", targetType: "answer", targetIndex: 5, value: 1 },

  { voterUsername: "yuki_tanaka", targetType: "answer", targetIndex: 6, value: 1 },
  { voterUsername: "admin", targetType: "answer", targetIndex: 6, value: 1 },
  { voterUsername: "carlos_garcia", targetType: "answer", targetIndex: 6, value: 1 },
  { voterUsername: "soo_jin", targetType: "answer", targetIndex: 6, value: 1 },
  { voterUsername: "thanh_pham", targetType: "answer", targetIndex: 6, value: 1 },

  { voterUsername: "sakura_ito", targetType: "answer", targetIndex: 8, value: 1 },
  { voterUsername: "admin", targetType: "answer", targetIndex: 8, value: 1 },
  { voterUsername: "soo_jin", targetType: "answer", targetIndex: 8, value: 1 },
  { voterUsername: "carlos_garcia", targetType: "answer", targetIndex: 8, value: 1 },

  { voterUsername: "mike_johnson", targetType: "answer", targetIndex: 9, value: 1 },
  { voterUsername: "yuki_tanaka", targetType: "answer", targetIndex: 9, value: 1 },
  { voterUsername: "admin", targetType: "answer", targetIndex: 9, value: 1 },

  { voterUsername: "wei_chen", targetType: "answer", targetIndex: 10, value: 1 },
  { voterUsername: "soo_jin", targetType: "answer", targetIndex: 10, value: 1 },
  { voterUsername: "mike_johnson", targetType: "answer", targetIndex: 10, value: 1 },

  { voterUsername: "admin", targetType: "answer", targetIndex: 11, value: 1 },
  { voterUsername: "thanh_pham", targetType: "answer", targetIndex: 11, value: 1 },
  { voterUsername: "yuki_tanaka", targetType: "answer", targetIndex: 11, value: 1 },

  { voterUsername: "marie_dupont", targetType: "answer", targetIndex: 14, value: 1 },
  { voterUsername: "carlos_garcia", targetType: "answer", targetIndex: 14, value: 1 },

  { voterUsername: "mike_johnson", targetType: "answer", targetIndex: 17, value: 1 },
  { voterUsername: "soo_jin", targetType: "answer", targetIndex: 17, value: 1 },
  { voterUsername: "raj_patel", targetType: "answer", targetIndex: 17, value: 1 },

  { voterUsername: "mike_johnson", targetType: "answer", targetIndex: 18, value: 1 },
  { voterUsername: "raj_patel", targetType: "answer", targetIndex: 18, value: 1 },
];

// ─── Reputation Events ──────────────────────────────────────────────────────

interface ReputationSeed {
  username: string;
  event: string;
  change: number;
  relatedPostIndex?: number;
  relatedAnswerIndex?: number;
}

const REPUTATION_EVENTS: ReputationSeed[] = [
  // yuki_tanaka gains rep from popular answers
  { username: "yuki_tanaka", event: "answer_upvoted", change: 10, relatedAnswerIndex: 0 },
  { username: "yuki_tanaka", event: "answer_upvoted", change: 10, relatedAnswerIndex: 0 },
  { username: "yuki_tanaka", event: "answer_upvoted", change: 10, relatedAnswerIndex: 0 },
  { username: "yuki_tanaka", event: "answer_accepted", change: 15, relatedAnswerIndex: 0 },
  { username: "yuki_tanaka", event: "answer_upvoted", change: 10, relatedAnswerIndex: 4 },
  { username: "yuki_tanaka", event: "answer_accepted", change: 15, relatedAnswerIndex: 4 },
  { username: "yuki_tanaka", event: "answer_upvoted", change: 10, relatedAnswerIndex: 9 },
  { username: "yuki_tanaka", event: "answer_accepted", change: 15, relatedAnswerIndex: 9 },
  { username: "yuki_tanaka", event: "answer_upvoted", change: 10, relatedAnswerIndex: 10 },
  { username: "yuki_tanaka", event: "answer_accepted", change: 15, relatedAnswerIndex: 10 },

  // mike_johnson gains rep
  { username: "mike_johnson", event: "answer_upvoted", change: 10, relatedAnswerIndex: 2 },
  { username: "mike_johnson", event: "answer_upvoted", change: 10, relatedAnswerIndex: 2 },
  { username: "mike_johnson", event: "answer_accepted", change: 15, relatedAnswerIndex: 2 },
  { username: "mike_johnson", event: "answer_upvoted", change: 10, relatedAnswerIndex: 6 },
  { username: "mike_johnson", event: "answer_accepted", change: 15, relatedAnswerIndex: 6 },
  { username: "mike_johnson", event: "answer_upvoted", change: 10, relatedAnswerIndex: 8 },
  { username: "mike_johnson", event: "answer_accepted", change: 15, relatedAnswerIndex: 8 },
  { username: "mike_johnson", event: "post_upvoted", change: 5, relatedPostIndex: 0 },

  // soo_jin gains rep
  { username: "soo_jin", event: "answer_upvoted", change: 10, relatedAnswerIndex: 5 },
  { username: "soo_jin", event: "answer_upvoted", change: 10, relatedAnswerIndex: 5 },
  { username: "soo_jin", event: "answer_accepted", change: 15, relatedAnswerIndex: 5 },
  { username: "soo_jin", event: "post_upvoted", change: 5, relatedPostIndex: 23 },
  { username: "soo_jin", event: "post_upvoted", change: 5, relatedPostIndex: 23 },

  // wei_chen gains rep
  { username: "wei_chen", event: "answer_upvoted", change: 10, relatedAnswerIndex: 1 },
  { username: "wei_chen", event: "post_upvoted", change: 5, relatedPostIndex: 18 },
  { username: "wei_chen", event: "post_upvoted", change: 5, relatedPostIndex: 18 },
  { username: "wei_chen", event: "answer_upvoted", change: 10, relatedAnswerIndex: 18 },

  // admin gains rep
  { username: "admin", event: "answer_upvoted", change: 10, relatedAnswerIndex: 8 },
  { username: "admin", event: "answer_accepted", change: 15, relatedAnswerIndex: 8 },
  { username: "admin", event: "answer_upvoted", change: 10, relatedAnswerIndex: 13 },

  // mod_linh gains rep
  { username: "mod_linh", event: "answer_upvoted", change: 10, relatedAnswerIndex: 11 },
  { username: "mod_linh", event: "answer_accepted", change: 15, relatedAnswerIndex: 11 },

  // carlos_garcia gains rep
  { username: "carlos_garcia", event: "answer_upvoted", change: 10, relatedAnswerIndex: 14 },
  { username: "carlos_garcia", event: "post_upvoted", change: 5, relatedPostIndex: 5 },

  // marie_dupont gains rep
  { username: "marie_dupont", event: "answer_upvoted", change: 10, relatedAnswerIndex: 12 },
];

// ─── Seed Function ───────────────────────────────────────────────────────────

async function seed(): Promise<void> {
  const ds = new DataSource({
    type: "postgres",
    host: process.env.DATABASE_HOST || "localhost",
    port: parseInt(process.env.DATABASE_PORT || "5432", 10),
    username: process.env.DATABASE_USERNAME || "postgres",
    password: process.env.DATABASE_PASSWORD || "postgres",
    database: process.env.DATABASE_NAME || "speak_stack",
    entities: [__dirname + "/**/*.entity{.ts,.js}"],
    namingStrategy: new SnakeNamingStrategy(),
    synchronize: true,
  });

  await ds.initialize();
  console.log("Connected to database\n");

  const languageRepo = ds.getRepository(Language);
  const tagRepo = ds.getRepository(Tag);
  const userRepo = ds.getRepository(User);
  const postRepo = ds.getRepository(Post);
  const answerRepo = ds.getRepository(Answer);
  const postVoteRepo = ds.getRepository(PostVote);
  const answerVoteRepo = ds.getRepository(AnswerVote);
  const reputationRepo = ds.getRepository(ReputationHistory);
  const userLanguageRepo = ds.getRepository(UserLanguage);
  const levelRepo = ds.getRepository(Level);
  const badgeRepo = ds.getRepository(Badge);

  // ── Seeding Levels ─────────────────────────────────────────────────────
  console.log("── Seeding Levels ──");
  for (const lvl of LEVELS) {
    const existing = await levelRepo.findOne({ where: { name: lvl.name } });
    if (existing) continue;
    await levelRepo.save(levelRepo.create(lvl));
    console.log(`  + level: ${lvl.name} (${lvl.minReputation}+ rep)`);
  }
  console.log(`Levels seeded\n`);

  // ── Seeding Badges ─────────────────────────────────────────────────────
  console.log("── Seeding Badges ──");
  for (const b of BADGES) {
    const existing = await badgeRepo.findOne({ where: { slug: b.slug } });
    if (existing) continue;
    await badgeRepo.save(badgeRepo.create(b));
    console.log(`  + badge: ${b.name}`);
  }
  console.log(`Badges seeded\n`);

  // ── 1. Languages ────────────────────────────────────────────────────────
  console.log("── Seeding Languages ──");
  const languageMap = new Map<string, Language>();
  for (const lang of LANGUAGES) {
    const existing = await languageRepo.findOne({ where: { code: lang.code } });
    if (existing) {
      languageMap.set(lang.code, existing);
      continue;
    }
    const saved = await languageRepo.save(languageRepo.create(lang));
    languageMap.set(lang.code, saved);
    console.log(`  + language: ${lang.code} (${lang.name})`);
  }
  console.log(`Languages: ${languageMap.size} total\n`);

  // ── 2. Tags ─────────────────────────────────────────────────────────────
  console.log("── Seeding Tags ──");
  const allTags = [...GLOBAL_TAGS, ...LANGUAGE_TAGS];
  const tagMap = new Map<string, Tag>();
  let tagsCreated = 0;
  for (const tag of allTags) {
    const existing = await tagRepo.findOne({ where: { slug: tag.slug } });
    if (existing) {
      tagMap.set(tag.slug, existing);
      continue;
    }
    const entity = tagRepo.create({
      name: tag.name,
      slug: tag.slug,
      description: tag.description,
      color: tag.color,
      languageId: tag.languageCode
        ? (languageMap.get(tag.languageCode)?.id ?? null)
        : null,
    });
    const saved = await tagRepo.save(entity);
    tagMap.set(tag.slug, saved);
    console.log(
      `  + tag: ${tag.slug}${tag.languageCode ? " [" + tag.languageCode + "]" : " [global]"}`,
    );
    tagsCreated++;
  }
  console.log(
    `Tags: ${tagsCreated} created, ${allTags.length - tagsCreated} already existed\n`,
  );

  // ── 3. Users ────────────────────────────────────────────────────────────
  console.log("── Seeding Users ──");
  const defaultPasswordHash = await Bun.password.hash("Password123!", { algorithm: "bcrypt", cost: 10 });
  const userMap = new Map<string, User>();
  let usersCreated = 0;
  for (const u of USERS) {
    const existing = await userRepo.findOne({ where: { username: u.username } });
    if (existing) {
      userMap.set(u.username, existing);
      continue;
    }
    const saved = await userRepo.save(
      userRepo.create({
        username: u.username,
        email: u.email,
        passwordHash: defaultPasswordHash,
        displayName: u.displayName,
        role: u.role,
        reputation: u.reputation,
        avatarUrl: u.avatarUrl,
      }),
    );
    userMap.set(u.username, saved);
    console.log(`  + user: ${u.username} (${u.role})`);
    usersCreated++;
  }
  console.log(`Users: ${usersCreated} created, ${USERS.length - usersCreated} already existed\n`);

  // ── 4. User Languages ──────────────────────────────────────────────────
  console.log("── Seeding User Languages ──");
  let ulCreated = 0;
  for (const ul of USER_LANGUAGES) {
    const user = userMap.get(ul.username);
    const language = languageMap.get(ul.languageCode);
    if (!user || !language) continue;

    const existing = await userLanguageRepo.findOne({
      where: { userId: user.id, languageId: language.id },
    });
    if (existing) continue;

    await userLanguageRepo.save(
      userLanguageRepo.create({
        userId: user.id,
        languageId: language.id,
        relation: ul.relation,
        proficiency: ul.proficiency,
      }),
    );
    console.log(`  + ${ul.username}: ${ul.languageCode} (${ul.relation}/${ul.proficiency ?? "n/a"})`);
    ulCreated++;
  }
  console.log(`User Languages: ${ulCreated} created\n`);

  // ── 5. Posts ─────────────────────────────────────────────────────────────
  console.log("── Seeding Posts ──");
  const postEntities: Post[] = [];
  let postsCreated = 0;
  for (const p of POSTS) {
    const author = userMap.get(p.authorUsername);
    const targetLanguage = languageMap.get(p.targetLanguageCode);
    if (!author || !targetLanguage) {
      postEntities.push(null as any);
      continue;
    }

    // Check if post already exists by title + author
    const existing = await postRepo.findOne({
      where: { title: p.title, authorId: author.id },
    });
    if (existing) {
      postEntities.push(existing);
      continue;
    }

    const closedBy = p.closedByUsername ? userMap.get(p.closedByUsername) : null;
    const tags = p.tagSlugs
      .map((slug) => tagMap.get(slug))
      .filter(Boolean) as Tag[];

    const post = postRepo.create({
      authorId: author.id,
      type: p.type,
      status: p.status,
      title: p.title,
      content: p.content,
      targetLanguageId: targetLanguage.id,
      isDeleted: p.isDeleted ?? false,
      isClosed: p.isClosed ?? false,
      closedReason: p.closedReason ?? null,
      closedById: closedBy?.id ?? null,
      viewCount: p.viewCount ?? 0,
      tags,
    });

    const saved = await postRepo.save(post);
    postEntities.push(saved);
    console.log(`  + post: "${p.title.substring(0, 50)}..." [${p.type}]`);
    postsCreated++;

    // Update author's postsCount
    await userRepo.increment({ id: author.id }, "postsCount", 1);
  }
  console.log(`Posts: ${postsCreated} created\n`);

  // ── 6. Answers ──────────────────────────────────────────────────────────
  console.log("── Seeding Answers ──");
  const answerEntities: Answer[] = [];
  let answersCreated = 0;
  for (const a of ANSWERS) {
    const post = postEntities[a.postIndex];
    const author = userMap.get(a.authorUsername);
    if (!post || !author) {
      answerEntities.push(null as any);
      continue;
    }

    // Check if answer already exists
    const existing = await answerRepo.findOne({
      where: { postId: post.id, authorId: author.id },
    });
    if (existing) {
      answerEntities.push(existing);
      continue;
    }

    const verifiedBy = a.verifiedByUsername
      ? userMap.get(a.verifiedByUsername)
      : null;

    const answer = answerRepo.create({
      postId: post.id,
      authorId: author.id,
      content: a.content,
      isAccepted: a.isAccepted ?? false,
      isVerified: a.isVerified ?? false,
      verifiedById: verifiedBy?.id ?? null,
      verifiedAt: a.isVerified ? new Date() : null,
      verifierIsNative: a.verifierIsNative ?? false,
      isDeleted: a.isDeleted ?? false,
    });

    const saved = await answerRepo.save(answer);
    answerEntities.push(saved);
    console.log(`  + answer on "${POSTS[a.postIndex].title.substring(0, 40)}..." by ${a.authorUsername}`);
    answersCreated++;

    // Update post's answerCount
    await postRepo.increment({ id: post.id }, "answerCount", 1);
    // Update author's answersCount
    await userRepo.increment({ id: author.id }, "answersCount", 1);

    // If accepted, update post's acceptedAnswerId and status
    if (a.isAccepted) {
      await postRepo.update(post.id, {
        acceptedAnswerId: saved.id,
        status: PostStatus.ANSWERED,
      });
      await userRepo.increment({ id: author.id }, "acceptedAnswersCount", 1);
    }
  }
  console.log(`Answers: ${answersCreated} created\n`);

  // ── 7. Votes ────────────────────────────────────────────────────────────
  console.log("── Seeding Votes ──");
  let votesCreated = 0;
  for (const v of VOTES) {
    const voter = userMap.get(v.voterUsername);
    if (!voter) continue;

    if (v.targetType === "post") {
      const post = postEntities[v.targetIndex];
      if (!post) continue;

      const existing = await postVoteRepo.findOne({
        where: { userId: voter.id, postId: post.id },
      });
      if (existing) continue;

      await postVoteRepo.save(
        postVoteRepo.create({
          userId: voter.id,
          postId: post.id,
          value: v.value,
        }),
      );

      // Update counts
      if (v.value === 1) {
        await postRepo.increment({ id: post.id }, "upvoteCount", 1);
        await postRepo.increment({ id: post.id }, "score", 1);
      } else {
        await postRepo.increment({ id: post.id }, "downvoteCount", 1);
        await postRepo.decrement({ id: post.id }, "score", 1);
      }
    } else {
      const answer = answerEntities[v.targetIndex];
      if (!answer) continue;

      const existing = await answerVoteRepo.findOne({
        where: { userId: voter.id, answerId: answer.id },
      });
      if (existing) continue;

      await answerVoteRepo.save(
        answerVoteRepo.create({
          userId: voter.id,
          answerId: answer.id,
          value: v.value,
        }),
      );

      // Update counts
      if (v.value === 1) {
        await answerRepo.increment({ id: answer.id }, "upvoteCount", 1);
        await answerRepo.increment({ id: answer.id }, "score", 1);
      } else {
        await answerRepo.increment({ id: answer.id }, "downvoteCount", 1);
        await answerRepo.decrement({ id: answer.id }, "score", 1);
      }
    }
    votesCreated++;
  }
  console.log(`Votes: ${votesCreated} created\n`);

  // ── 8. Reputation History ───────────────────────────────────────────────
  console.log("── Seeding Reputation History ──");
  let repCreated = 0;
  for (const r of REPUTATION_EVENTS) {
    const user = userMap.get(r.username);
    if (!user) continue;

    await reputationRepo.save(
      reputationRepo.create({
        userId: user.id,
        event: r.event,
        change: r.change,
        relatedPostId:
          r.relatedPostIndex !== undefined
            ? postEntities[r.relatedPostIndex]?.id ?? null
            : null,
        relatedAnswerId:
          r.relatedAnswerIndex !== undefined
            ? answerEntities[r.relatedAnswerIndex]?.id ?? null
            : null,
      }),
    );
    repCreated++;
  }
  console.log(`Reputation events: ${repCreated} created\n`);

  // ── Summary ─────────────────────────────────────────────────────────────
  console.log("═══════════════════════════════════");
  console.log("  Seed complete!");
  console.log(`  Languages:        ${languageMap.size}`);
  console.log(`  Tags:             ${tagMap.size}`);
  console.log(`  Users:            ${userMap.size}`);
  console.log(`  User Languages:   ${ulCreated}`);
  console.log(`  Posts:            ${postEntities.filter(Boolean).length}`);
  console.log(`  Answers:          ${answerEntities.filter(Boolean).length}`);
  console.log(`  Votes:            ${votesCreated}`);
  console.log(`  Reputation:       ${repCreated}`);
  console.log("═══════════════════════════════════");

  await ds.destroy();
}

seed().catch((err) => {
  console.error("Seed failed:", err);
  process.exit(1);
});
