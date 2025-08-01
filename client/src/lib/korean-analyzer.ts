// Korean morphological analysis utilities
export class KoreanAnalyzer {
  // Korean particles (조사) that should not be made into blanks
  private static readonly PARTICLES = [
    '은', '는', '이', '가', '을', '를', '에', '에서', '으로', '로', 
    '와', '과', '의', '도', '만', '까지', '부터', '에게', '한테',
    '께', '께서', '에게서', '한테서', '로부터', '보다', '처럼', '같이'
  ];

  // Check if a word ends with a particle
  static endsWithParticle(word: string): boolean {
    return this.PARTICLES.some(particle => word.endsWith(particle));
  }

  // Extract the root word by removing particles
  static extractRoot(word: string): string {
    for (const particle of this.PARTICLES) {
      if (word.endsWith(particle)) {
        return word.slice(0, -particle.length);
      }
    }
    return word;
  }

  // Determine if a word should be a blank based on difficulty
  static shouldMakeBlank(word: string, difficulty: 'beginner' | 'intermediate' | 'advanced'): boolean {
    // Skip particles and very short words
    if (this.endsWithParticle(word) || word.length < 2) {
      return false;
    }

    // Check if it's a functional word (common words that provide grammatical function)
    const functionalWords = ['있다', '없다', '되다', '하다', '이다', '아니다'];
    const isFunctional = functionalWords.some(fw => word.includes(fw));

    switch (difficulty) {
      case 'beginner':
        // Only blank main content words, avoid functional words
        return !isFunctional && Math.random() < 0.25;
      
      case 'intermediate':
        // Blank most content words, some functional words
        return !isFunctional ? Math.random() < 0.6 : Math.random() < 0.3;
      
      case 'advanced':
        // Blank almost everything except particles
        return Math.random() < 0.95;
      
      default:
        return false;
    }
  }

  // Analyze text and suggest blanks
  static analyzeText(text: string, difficulty: 'beginner' | 'intermediate' | 'advanced') {
    const words = text.split(/\s+/);
    const suggestions = [];
    
    for (let i = 0; i < words.length; i++) {
      const word = words[i];
      if (this.shouldMakeBlank(word, difficulty)) {
        suggestions.push({
          index: i,
          word,
          root: this.extractRoot(word),
          difficulty: this.classifyDifficulty(word)
        });
      }
    }
    
    return suggestions;
  }

  // Classify word difficulty for educational purposes
  private static classifyDifficulty(word: string): 'basic' | 'intermediate' | 'advanced' {
    // Simple heuristic based on word characteristics
    if (word.length <= 2) return 'basic';
    if (word.length <= 4) return 'intermediate';
    return 'advanced';
  }

  // Generate hints for a word
  static generateHint(word: string): string {
    const hints = [];
    
    // First character hint
    if (word.length > 1) {
      hints.push(`첫 글자: ${word[0]}`);
    }
    
    // Length hint
    hints.push(`글자 수: ${word.length}자`);
    
    // Particle hint
    if (this.endsWithParticle(word)) {
      const particle = this.PARTICLES.find(p => word.endsWith(p));
      hints.push(`조사: ${particle}`);
    }
    
    return hints.join(', ');
  }
}
