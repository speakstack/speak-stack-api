import { DataSource } from "typeorm";
import { Language } from "./language/entities/language.entity";
import { Tag } from "./tag/entities/tag.entity";
import { User } from "./user/entities/user.entity";
import { Post } from "./post/entities/post.entity";
import { Answer } from "./answer/entities/answer.entity";
import { ReputationHistory } from "./reputation/entities/reputation-history.entity";
import { UserLanguage } from "./user-language/entities/user-language.entity";
import { SnakeNamingStrategy } from "./config/snake-naming.strategy";

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

async function seed(): Promise<void> {
  const ds = new DataSource({
    type: "postgres",
    host: "localhost",
    port: parseInt(process.env.DATABASE_PORT || "5432", 10),
    username: process.env.DATABASE_USERNAME || "postgres",
    password: process.env.DATABASE_PASSWORD || "postgres",
    database: process.env.DATABASE_NAME || "speak_stack",
    entities: [
      Language,
      Tag,
      User,
      Post,
      Answer,
      ReputationHistory,
      UserLanguage,
    ],
    namingStrategy: new SnakeNamingStrategy(),
    synchronize: true,
  });

  await ds.initialize();
  console.log("Connected to database");

  const languageRepo = ds.getRepository(Language);
  const tagRepo = ds.getRepository(Tag);

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
  console.log(`Languages: ${languageMap.size} total`);

  const allTags = [...GLOBAL_TAGS, ...LANGUAGE_TAGS];
  let created = 0;
  for (const tag of allTags) {
    const existing = await tagRepo.findOne({ where: { slug: tag.slug } });
    if (existing) continue;
    const entity = tagRepo.create({
      name: tag.name,
      slug: tag.slug,
      description: tag.description,
      color: tag.color,
      languageId: tag.languageCode
        ? (languageMap.get(tag.languageCode)?.id ?? null)
        : null,
    });
    await tagRepo.save(entity);
    console.log(
      `  + tag: ${tag.slug}${tag.languageCode ? " [" + tag.languageCode + "]" : " [global]"}`,
    );
    created++;
  }
  console.log(
    `Tags: ${created} created, ${allTags.length - created} already existed`,
  );

  await ds.destroy();
  console.log("Seed complete");
}

seed().catch((err) => {
  console.error("Seed failed:", err);
  process.exit(1);
});
