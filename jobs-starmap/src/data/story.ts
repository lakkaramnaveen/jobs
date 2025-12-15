export type StoryNode = {
  id: string;
  year: number;
  dateLabel?: string;
  title: string;
  subtitle: string;

  kid: string; // short + simple
  deep: string; // richer detail

  // Optional media (use Wikimedia where possible for licensing clarity)
  image?: {
    url: string;
    alt: string;
    credit: string; // short attribution
  };

  // Sources as plain URLs (kept as strings for your UI)
  sources: { label: string; url: string }[];
};

export const STORY: StoryNode[] = [
  {
    id: "birth",
    year: 1955,
    dateLabel: "Feb 24, 1955",
    title: "A Star Is Born",
    subtitle: "San Francisco → adopted and raised in Silicon Valley",
    kid: "Steve Jobs was born in San Francisco and was adopted as a baby. He grew up in California, right where computers were starting to boom.",
    deep: "Steve Jobs was born February 24, 1955, in San Francisco. He was adopted and raised in the Bay Area, which later became the heart of Silicon Valley.",
    image: {
      url: "https://commons.wikimedia.org/wiki/File:Steve_Jobs_Headshot_2010.JPG",
      alt: "Steve Jobs holding an iPhone at WWDC",
      credit: "Matthew Yohe (CC BY-SA) via Wikimedia Commons",
    },
    sources: [
      {
        label: "Britannica: Steve Jobs",
        url: "https://www.britannica.com/biography/Steve-Jobs",
      },
    ],
  },

  {
    id: "homestead-woz",
    year: 1971,
    dateLabel: "1971",
    title: "Meeting a Co-Pilot",
    subtitle: "Steve meets Steve Wozniak",
    kid: "Steve met Steve Wozniak. Together, they could build things other people only imagined.",
    deep: "Jobs met Steve Wozniak through mutual connections while they were young; their friendship and technical partnership became the spark for Apple.",
    sources: [
      {
        label: "Computer History Museum: Jobs & Woz meet",
        url: "https://computerhistory.org/blog/steve-jobs-and-steve-wozniak-meet/",
      },
    ],
  },

  {
    id: "reed",
    year: 1972,
    dateLabel: "1972",
    title: "Curiosity Mode",
    subtitle: "Reed College (and leaving the usual path)",
    kid: "Steve tried college, but he didn’t want the normal route. He chased what fascinated him.",
    deep: "Jobs attended Reed College in Oregon. His unconventional choices—learning by curiosity rather than checklists—became part of his style.",
    sources: [
      {
        label: "Reed College: Steve Jobs at Reed",
        url: "https://www.reed.edu/reed-magazine/articles/2011/steve-jobs-1955-2011.html",
      },
      {
        label: "Stanford: 2005 Commencement remarks (prepared text)",
        url: "https://news.stanford.edu/stories/2005/06/steve-jobs-commencement-address-prepared-text",
      },
    ],
  },

  {
    id: "atari-india",
    year: 1974,
    dateLabel: "1974",
    title: "Level Up: Real World",
    subtitle: "Atari + searching for meaning",
    kid: "Steve worked, learned fast, and went exploring for big ideas about life.",
    deep: "Jobs worked at Atari and pursued experiences that shaped his worldview—mixing technology with art, simplicity, and focus.",
    sources: [
      {
        label: "Britannica: Steve Jobs",
        url: "https://www.britannica.com/biography/Steve-Jobs",
      },
    ],
  },

  {
    id: "apple-founded",
    year: 1976,
    dateLabel: "Apr 1, 1976",
    title: "Apple Ignites",
    subtitle: "Apple is founded",
    kid: "Steve and Woz started Apple. They wanted computers to be for regular people, not just big companies.",
    deep: "Apple was founded April 1, 1976 by Steve Jobs, Steve Wozniak, and Ronald Wayne—one of the defining inflection points in personal computing.",
    sources: [
      {
        label: "Britannica: Steve Jobs",
        url: "https://www.britannica.com/biography/Steve-Jobs",
      },
      {
        label: "Wikipedia overview (cross-check dates)",
        url: "https://en.wikipedia.org/wiki/Apple_Computer",
      },
    ],
  },

  {
    id: "apple-1",
    year: 1976,
    dateLabel: "1976",
    title: "Apple I",
    subtitle: "A handmade computer becomes a real product",
    kid: "The Apple I was like a ‘starter rocket’. It proved they could actually sell a computer.",
    deep: "Apple I was one of Apple’s first products—an early personal computer that helped move the company from hobby project to real business.",
    image: {
      url: "https://commons.wikimedia.org/wiki/File:Apple_I_Computer.jpg",
      alt: "Apple I computer on display",
      credit: "Ed Uthman (CC BY-SA) via Wikimedia Commons",
    },
    sources: [
      {
        label: "Britannica: Steve Jobs",
        url: "https://www.britannica.com/biography/Steve-Jobs",
      },
      {
        label: "Wikimedia Commons: Apple I image",
        url: "https://commons.wikimedia.org/wiki/File:Apple_I_Computer.jpg",
      },
    ],
  },

  {
    id: "mac",
    year: 1984,
    dateLabel: "Jan 1984",
    title: "Macintosh Moment",
    subtitle: "Computers become friendly",
    kid: "The Macintosh helped make computers feel simpler and more human.",
    deep: "The Macintosh launch pushed graphical user interfaces into the mainstream and made design a core part of personal computing products.",
    sources: [
      {
        label: "Britannica: Steve Jobs",
        url: "https://www.britannica.com/biography/Steve-Jobs",
      },
    ],
  },

  {
    id: "exit-apple",
    year: 1985,
    dateLabel: "1985",
    title: "Ejected Into Space",
    subtitle: "Leaving Apple (a painful pivot)",
    kid: "Steve left Apple. It looked like a loss—until it became fuel for the next chapter.",
    deep: "Jobs left Apple in 1985, an event often described as a major setback that later became a catalyst for his next ventures.",
    sources: [
      {
        label: "Britannica: Steve Jobs",
        url: "https://www.britannica.com/biography/Steve-Jobs",
      },
      {
        label: "Stanford: 2005 Commencement prepared text",
        url: "https://news.stanford.edu/stories/2005/06/steve-jobs-commencement-address-prepared-text",
      },
    ],
  },

  {
    id: "next",
    year: 1985,
    dateLabel: "1985",
    title: "NeXT",
    subtitle: "Building the future OS (quietly)",
    kid: "Steve started NeXT to build super-advanced computers and software.",
    deep: "NeXT built computers and an operating system lineage that later became foundational to Apple’s modern platforms after Apple acquired NeXT.",
    image: {
      url: "https://commons.wikimedia.org/wiki/File:NEXT_Cube-IMG_7157.jpg",
      alt: "NeXTcube workstation (Musée Bolo, EPFL)",
      credit: "Rama & Musée Bolo (CC BY-SA) via Wikimedia Commons",
    },
    sources: [
      {
        label: "Wikipedia: NeXT (overview)",
        url: "https://en.wikipedia.org/wiki/NeXT",
      },
      {
        label: "Wikimedia Commons: NeXT cube image",
        url: "https://commons.wikimedia.org/wiki/File:NEXT_Cube-IMG_7157.jpg",
      },
      {
        label: "Apple acquires NeXT (historical overview)",
        url: "https://en.wikipedia.org/wiki/NeXT#Acquisition_by_Apple",
      },
    ],
  },

  {
    id: "pixar",
    year: 1986,
    dateLabel: "1986",
    title: "Pixar",
    subtitle: "Storytelling meets technology",
    kid: "Steve helped Pixar grow into a studio that made animated movies feel magical.",
    deep: "Jobs purchased The Graphics Group and it became Pixar—helping accelerate computer animation into a new era.",
    sources: [
      { label: "Pixar: The Story", url: "https://www.pixar.com/the-story" },
    ],
  },

  {
    id: "return",
    year: 1997,
    dateLabel: "1997",
    title: "Return to Apple",
    subtitle: "NeXT brings him back",
    kid: "Apple brought Steve back. He helped focus the company again.",
    deep: "After Apple’s acquisition of NeXT, Jobs returned and soon led Apple through a major turnaround.",
    sources: [
      {
        label: "Apple acquires NeXT (overview)",
        url: "https://en.wikipedia.org/wiki/Apple_Inc.#1997%E2%80%932007:_Return_to_profitability",
      },
      {
        label: "Britannica: Steve Jobs",
        url: "https://www.britannica.com/biography/Steve-Jobs",
      },
    ],
  },

  {
    id: "imac",
    year: 1998,
    dateLabel: "1998",
    title: "iMac",
    subtitle: "A colorful computer that people actually wanted",
    kid: "The iMac made computers feel fun and friendly—like a gadget from the future.",
    deep: "The iMac era marked a major shift in Apple’s product design direction and helped reignite mainstream interest in Apple.",
    sources: [
      {
        label: "Britannica: Steve Jobs",
        url: "https://www.britannica.com/biography/Steve-Jobs",
      },
    ],
  },

  {
    id: "ipod",
    year: 2001,
    dateLabel: "Oct 23, 2001",
    title: "iPod",
    subtitle: "1,000 songs in your pocket",
    kid: "Your music could travel with you. That changed how people listened to songs forever.",
    deep: "Apple introduced iPod in 2001, a major milestone in Apple’s consumer electronics strategy.",
    sources: [
      {
        label: "Apple Press Release: iPod",
        url: "https://www.apple.com/newsroom/2001/10/23Apple-Introduces-iPod/",
      },
    ],
  },

  {
    id: "iphone",
    year: 2007,
    dateLabel: "Jan 9, 2007",
    title: "iPhone",
    subtitle: "A phone that became a pocket computer",
    kid: "The iPhone wasn’t just a phone. It was a tiny computer you could carry everywhere.",
    deep: "Apple unveiled iPhone in 2007, merging phone, iPod, and internet communicator into one device.",
    image: {
      url: "https://commons.wikimedia.org/wiki/File:IPhone_First_Generation_8GB_(3677961514).jpg",
      alt: "First generation iPhone",
      credit: "Wikimedia Commons (see file page for license details)",
    },
    sources: [
      {
        label: "Apple Press Release: iPhone",
        url: "https://www.apple.com/newsroom/2007/01/09Apple-Reinvents-the-Phone-with-iPhone/",
      },
      {
        label: "Wikimedia Commons: iPhone image",
        url: "https://commons.wikimedia.org/wiki/File:IPhone_First_Generation_8GB_(3677961514).jpg",
      },
    ],
  },

  {
    id: "ipad",
    year: 2010,
    dateLabel: "2010",
    title: "iPad",
    subtitle: "A new kind of computer",
    kid: "The iPad made computing feel like touching and moving ideas with your hands.",
    deep: "Apple introduced iPad in 2010, extending Apple’s approach to mobile computing into a larger format.",
    sources: [
      {
        label: "Britannica: Steve Jobs",
        url: "https://www.britannica.com/biography/Steve-Jobs",
      },
    ],
  },

  {
    id: "resign",
    year: 2011,
    dateLabel: "Aug 24, 2011",
    title: "Passing the Torch",
    subtitle: "Resigning as CEO",
    kid: "Steve stepped down as CEO. He helped set Apple up for the future.",
    deep: "Jobs resigned as CEO in August 2011 and recommended Tim Cook as his successor.",
    sources: [
      {
        label: "Apple Press Release: Resignation",
        url: "https://www.apple.com/newsroom/2011/08/24Steve-Jobs-Resigns-as-CEO-of-Apple/",
      },
    ],
  },

  {
    id: "death",
    year: 2011,
    dateLabel: "Oct 5, 2011",
    title: "The Final Star",
    subtitle: "Steve Jobs dies at age 56",
    kid: "Steve Jobs died in 2011. His ideas kept traveling—like light from a star.",
    deep: "Steve Jobs died October 5, 2011, at age 56. Apple published a statement recognizing his impact.",
    sources: [
      {
        label: "Apple: Steve Jobs (1955–2011)",
        url: "https://www.apple.com/newsroom/2011/10/05Steve-Jobs-1955-2011/",
      },
    ],
  },
];
