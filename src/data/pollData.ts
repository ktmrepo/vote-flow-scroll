
export interface Poll {
  id: number;
  question: string;
  category: 'Politics' | 'Celebrity' | 'Scientists' | 'Geography';
  options: {
    id: string;
    text: string;
    votes: number;
  }[];
}

export const pollData: Poll[] = [
  // Politics
  {
    id: 1,
    question: "Which political system do you think is most effective?",
    category: "Politics",
    options: [
      { id: "a", text: "Democracy", votes: 245 },
      { id: "b", text: "Constitutional Republic", votes: 189 },
      { id: "c", text: "Parliamentary System", votes: 156 },
      { id: "d", text: "Federal System", votes: 98 }
    ]
  },
  {
    id: 2,
    question: "What's the most important quality in a political leader?",
    category: "Politics",
    options: [
      { id: "a", text: "Integrity", votes: 312 },
      { id: "b", text: "Experience", votes: 278 },
      { id: "c", text: "Vision", votes: 234 },
      { id: "d", text: "Communication Skills", votes: 156 }
    ]
  },
  {
    id: 3,
    question: "Which international organization has the most global influence?",
    category: "Politics",
    options: [
      { id: "a", text: "United Nations", votes: 298 },
      { id: "b", text: "World Bank", votes: 167 },
      { id: "c", text: "NATO", votes: 145 },
      { id: "d", text: "European Union", votes: 123 }
    ]
  },
  {
    id: 4,
    question: "What should be the top priority for governments?",
    category: "Politics",
    options: [
      { id: "a", text: "Economic Growth", votes: 267 },
      { id: "b", text: "Healthcare", votes: 298 },
      { id: "c", text: "Education", votes: 234 },
      { id: "d", text: "Environmental Protection", votes: 201 }
    ]
  },
  {
    id: 5,
    question: "Which voting system is most fair?",
    category: "Politics",
    options: [
      { id: "a", text: "First Past the Post", votes: 156 },
      { id: "b", text: "Proportional Representation", votes: 234 },
      { id: "c", text: "Ranked Choice Voting", votes: 189 },
      { id: "d", text: "Mixed Member Proportional", votes: 121 }
    ]
  },

  // Celebrity
  {
    id: 6,
    question: "Who is the most influential celebrity of the 21st century?",
    category: "Celebrity",
    options: [
      { id: "a", text: "Oprah Winfrey", votes: 289 },
      { id: "b", text: "Elon Musk", votes: 267 },
      { id: "c", text: "Taylor Swift", votes: 234 },
      { id: "d", text: "Dwayne Johnson", votes: 178 }
    ]
  },
  {
    id: 7,
    question: "Which celebrity has the best fashion sense?",
    category: "Celebrity",
    options: [
      { id: "a", text: "Zendaya", votes: 298 },
      { id: "b", text: "Ryan Gosling", votes: 189 },
      { id: "c", text: "Emma Stone", votes: 234 },
      { id: "d", text: "Michael B. Jordan", votes: 156 }
    ]
  },
  {
    id: 8,
    question: "Who gives the best award show speeches?",
    category: "Celebrity",
    options: [
      { id: "a", text: "Meryl Streep", votes: 267 },
      { id: "b", text: "Leonardo DiCaprio", votes: 234 },
      { id: "c", text: "Viola Davis", votes: 189 },
      { id: "d", text: "Matthew McConaughey", votes: 178 }
    ]
  },
  {
    id: 9,
    question: "Which celebrity would make the best talk show host?",
    category: "Celebrity",
    options: [
      { id: "a", text: "Ryan Reynolds", votes: 312 },
      { id: "b", text: "Jennifer Lawrence", votes: 245 },
      { id: "c", text: "Chris Evans", votes: 189 },
      { id: "d", text: "Margot Robbie", votes: 167 }
    ]
  },
  {
    id: 10,
    question: "Who has the most impressive social media presence?",
    category: "Celebrity",
    options: [
      { id: "a", text: "The Rock", votes: 289 },
      { id: "b", text: "Gordon Ramsay", votes: 234 },
      { id: "c", text: "Ryan Reynolds", votes: 267 },
      { id: "d", text: "Dolly Parton", votes: 198 }
    ]
  },

  // Scientists
  {
    id: 11,
    question: "Who is the most influential scientist in modern history?",
    category: "Scientists",
    options: [
      { id: "a", text: "Albert Einstein", votes: 345 },
      { id: "b", text: "Marie Curie", votes: 267 },
      { id: "c", text: "Stephen Hawking", votes: 234 },
      { id: "d", text: "Charles Darwin", votes: 189 }
    ]
  },
  {
    id: 12,
    question: "Which field of science will have the biggest impact on our future?",
    category: "Scientists",
    options: [
      { id: "a", text: "Artificial Intelligence", votes: 298 },
      { id: "b", text: "Biotechnology", votes: 267 },
      { id: "c", text: "Quantum Physics", votes: 189 },
      { id: "d", text: "Climate Science", votes: 234 }
    ]
  },
  {
    id: 13,
    question: "Who should be considered the father of modern computing?",
    category: "Scientists",
    options: [
      { id: "a", text: "Alan Turing", votes: 289 },
      { id: "b", text: "John von Neumann", votes: 178 },
      { id: "c", text: "Claude Shannon", votes: 145 },
      { id: "d", text: "Ada Lovelace", votes: 234 }
    ]
  },
  {
    id: 14,
    question: "Which scientific discovery changed the world the most?",
    category: "Scientists",
    options: [
      { id: "a", text: "DNA Structure", votes: 267 },
      { id: "b", text: "Electricity", votes: 298 },
      { id: "c", text: "Germ Theory", votes: 234 },
      { id: "d", text: "Theory of Relativity", votes: 189 }
    ]
  },
  {
    id: 15,
    question: "Who is the most inspiring contemporary scientist?",
    category: "Scientists",
    options: [
      { id: "a", text: "Neil deGrasse Tyson", votes: 278 },
      { id: "b", text: "Jane Goodall", votes: 289 },
      { id: "c", text: "Michio Kaku", votes: 167 },
      { id: "d", text: "Brian Cox", votes: 145 }
    ]
  },

  // Geography
  {
    id: 16,
    question: "Which is the most beautiful natural wonder?",
    category: "Geography",
    options: [
      { id: "a", text: "Northern Lights", votes: 298 },
      { id: "b", text: "Grand Canyon", votes: 234 },
      { id: "c", text: "Great Barrier Reef", votes: 267 },
      { id: "d", text: "Mount Everest", votes: 189 }
    ]
  },
  {
    id: 17,
    question: "Which continent has the most diverse wildlife?",
    category: "Geography",
    options: [
      { id: "a", text: "Africa", votes: 312 },
      { id: "b", text: "South America", votes: 234 },
      { id: "c", text: "Asia", votes: 189 },
      { id: "d", text: "Australia", votes: 156 }
    ]
  },
  {
    id: 18,
    question: "What's the most impressive man-made geographical feature?",
    category: "Geography",
    options: [
      { id: "a", text: "Panama Canal", votes: 234 },
      { id: "b", text: "Suez Canal", votes: 167 },
      { id: "c", text: "The Netherlands Dikes", votes: 289 },
      { id: "d", text: "Palm Islands Dubai", votes: 178 }
    ]
  },
  {
    id: 19,
    question: "Which ocean is the most important for global climate?",
    category: "Geography",
    options: [
      { id: "a", text: "Pacific Ocean", votes: 298 },
      { id: "b", text: "Atlantic Ocean", votes: 234 },
      { id: "c", text: "Indian Ocean", votes: 156 },
      { id: "d", text: "Arctic Ocean", votes: 189 }
    ]
  },
  {
    id: 20,
    question: "Which mountain range is the most geologically significant?",
    category: "Geography",
    options: [
      { id: "a", text: "Himalayas", votes: 289 },
      { id: "b", text: "Andes", votes: 234 },
      { id: "c", text: "Alps", votes: 167 },
      { id: "d", text: "Rocky Mountains", votes: 178 }
    ]
  }
];
