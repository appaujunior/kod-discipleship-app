/** The 50-verse memorization track, five levels of ten. Text is pulled from the KJV at render time. */
export interface MemoryVerse {
  id: number;
  level: 1 | 2 | 3 | 4 | 5;
  ref: string;
  /** Short handle shown in lists. */
  gist: string;
}

export const LEVELS: Record<MemoryVerse["level"], { name: string; theme: string }> = {
  1: { name: "Foundation", theme: "Who God is and who you are in Him" },
  2: { name: "Growth", theme: "Walking daily in the Word" },
  3: { name: "Strength", theme: "Standing when it gets hard" },
  4: { name: "Wisdom", theme: "Making decisions like a king" },
  5: { name: "Purpose", theme: "Living for something bigger" },
};

export const MEMORY_VERSES: MemoryVerse[] = [
  { id: 1, level: 1, ref: "Joshua 1:9", gist: "Be strong and of a good courage" },
  { id: 2, level: 1, ref: "Proverbs 3:5-6", gist: "Trust in the LORD with all thine heart" },
  { id: 3, level: 1, ref: "Philippians 4:13", gist: "I can do all things through Christ" },
  { id: 4, level: 1, ref: "Psalms 23:1", gist: "The LORD is my shepherd" },
  { id: 5, level: 1, ref: "Romans 12:2", gist: "Be transformed by the renewing of your mind" },
  { id: 6, level: 1, ref: "Matthew 6:33", gist: "Seek ye first the kingdom of God" },
  { id: 7, level: 1, ref: "Psalms 46:10", gist: "Be still, and know that I am God" },
  { id: 8, level: 1, ref: "Proverbs 4:23", gist: "Keep thy heart with all diligence" },
  { id: 9, level: 1, ref: "Isaiah 41:10", gist: "Fear thou not; for I am with thee" },
  { id: 10, level: 1, ref: "1 Peter 5:7", gist: "Casting all your care upon him" },
  { id: 11, level: 2, ref: "Psalms 119:105", gist: "Thy word is a lamp unto my feet" },
  { id: 12, level: 2, ref: "2 Timothy 3:16", gist: "All scripture is given by inspiration of God" },
  { id: 13, level: 2, ref: "James 1:22", gist: "Be ye doers of the word" },
  { id: 14, level: 2, ref: "Psalms 1:1-2", gist: "His delight is in the law of the LORD" },
  { id: 15, level: 2, ref: "Colossians 3:23", gist: "Do it heartily, as to the Lord" },
  { id: 16, level: 2, ref: "Galatians 5:22-23", gist: "The fruit of the Spirit" },
  { id: 17, level: 2, ref: "John 15:5", gist: "Without me ye can do nothing" },
  { id: 18, level: 2, ref: "Hebrews 4:12", gist: "The word of God is quick, and powerful" },
  { id: 19, level: 2, ref: "Matthew 4:4", gist: "Man shall not live by bread alone" },
  { id: 20, level: 2, ref: "2 Corinthians 5:17", gist: "If any man be in Christ, he is a new creature" },
  { id: 21, level: 3, ref: "Ephesians 6:10-11", gist: "Put on the whole armour of God" },
  { id: 22, level: 3, ref: "Isaiah 40:31", gist: "They that wait upon the LORD shall renew their strength" },
  { id: 23, level: 3, ref: "Romans 8:28", gist: "All things work together for good" },
  { id: 24, level: 3, ref: "James 1:2-3", gist: "Count it all joy" },
  { id: 25, level: 3, ref: "1 Corinthians 10:13", gist: "God is faithful, who will not suffer you to be tempted" },
  { id: 26, level: 3, ref: "Psalms 27:1", gist: "The LORD is my light and my salvation" },
  { id: 27, level: 3, ref: "2 Timothy 1:7", gist: "God hath not given us the spirit of fear" },
  { id: 28, level: 3, ref: "1 Corinthians 16:13", gist: "Quit you like men, be strong" },
  { id: 29, level: 3, ref: "Romans 8:37", gist: "More than conquerors" },
  { id: 30, level: 3, ref: "Psalms 34:17-18", gist: "The LORD is nigh unto them that are of a broken heart" },
  { id: 31, level: 4, ref: "James 1:5", gist: "If any of you lack wisdom, let him ask of God" },
  { id: 32, level: 4, ref: "Proverbs 9:10", gist: "The fear of the LORD is the beginning of wisdom" },
  { id: 33, level: 4, ref: "Proverbs 27:17", gist: "Iron sharpeneth iron" },
  { id: 34, level: 4, ref: "Proverbs 16:3", gist: "Commit thy works unto the LORD" },
  { id: 35, level: 4, ref: "Proverbs 22:7", gist: "The borrower is servant to the lender" },
  { id: 36, level: 4, ref: "Proverbs 13:20", gist: "He that walketh with wise men shall be wise" },
  { id: 37, level: 4, ref: "Proverbs 15:1", gist: "A soft answer turneth away wrath" },
  { id: 38, level: 4, ref: "Proverbs 21:5", gist: "The thoughts of the diligent tend only to plenteousness" },
  { id: 39, level: 4, ref: "Ecclesiastes 12:13", gist: "Fear God, and keep his commandments" },
  { id: 40, level: 4, ref: "Micah 6:8", gist: "Do justly, love mercy, walk humbly" },
  { id: 41, level: 5, ref: "Jeremiah 29:11", gist: "I know the thoughts that I think toward you" },
  { id: 42, level: 5, ref: "Ephesians 2:10", gist: "We are his workmanship" },
  { id: 43, level: 5, ref: "Matthew 5:14-16", gist: "Ye are the light of the world" },
  { id: 44, level: 5, ref: "Matthew 28:19-20", gist: "Go ye therefore, and teach all nations" },
  { id: 45, level: 5, ref: "Romans 12:1", gist: "Present your bodies a living sacrifice" },
  { id: 46, level: 5, ref: "1 Timothy 4:12", gist: "Let no man despise thy youth" },
  { id: 47, level: 5, ref: "Galatians 6:9", gist: "Let us not be weary in well doing" },
  { id: 48, level: 5, ref: "Genesis 4:9", gist: "Am I my brother's keeper?" },
  { id: 49, level: 5, ref: "Psalms 78:4", gist: "Shewing to the generation to come the praises of the LORD" },
  { id: 50, level: 5, ref: "Revelation 21:7", gist: "He that overcometh shall inherit all things" },
];

export function memoryVerseById(id: number): MemoryVerse | undefined {
  return MEMORY_VERSES.find((v) => v.id === id);
}
