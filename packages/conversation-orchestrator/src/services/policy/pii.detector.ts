export class PIIDetector {
  private patterns = {
    EMAIL: /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g,
    PHONE: /(?<![\d.])(?![-.])(?:\+?([1-9]\d{0,2})[-. (]*)?\(?(\d{3})\)?[-. ]*(\d{3})[-. ]*(\d{4})(?: *x(\d+))?/g,
    SSN: /\b\d{3}-\d{2}-\d{4}\b/g,
    // VISA, MasterCard, Amex, Discover (Simple check)
    CREDIT_CARD: /\b(?:\d{4}[- ]?){3}\d{4}\b/g 
  };

  /**
   * Tokenizes PII from the given text and stores mapping in a vault.
   * @param text Input text
   * @param vault Map to store token -> rawValue mapping
   * @returns De-identified text
   */
  public tokenize(text: string, vault: Map<string, string>): string {
    let tokenized = text;
    let counter = vault.size + 1;

    for (const [type, pattern] of Object.entries(this.patterns)) {
      tokenized = tokenized.replace(pattern, (match) => {
        // Find existing token for this value if it exists in this session
        let existingToken = Array.from(vault.entries()).find(([_, v]) => v === match)?.[0];
        if (existingToken) return existingToken;

        const token = `[${type}_${counter++}]`;
        vault.set(token, match);
        return token;
      });
    }

    return tokenized;
  }

  /**
   * Replaces tokens in the text back with their original values from the vault.
   * @param text Tokenized text
   * @param vault Mapping vault
   * @returns Re-identified text
   */
  public detokenize(text: string, vault: Map<string, string>): string {
    let result = text;
    for (const [token, original] of vault.entries()) {
      // Use escape for regex if token contains special chars, but ours are [TYPE_N]
      const escapedToken = token.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      result = result.replace(new RegExp(escapedToken, 'g'), original);
    }
    return result;
  }

  public redact(text: string): string {
    let redacted = text;
    // ... existing redact code (keep for backward compatibility or simple use)
    redacted = redacted.replace(this.patterns.EMAIL, '[EMAIL_REDACTED]');
    redacted = redacted.replace(this.patterns.SSN, '[SSN_REDACTED]');
    redacted = redacted.replace(this.patterns.CREDIT_CARD, '[CREDIT_CARD_REDACTED]');
    redacted = redacted.replace(this.patterns.PHONE, (match) => {
      if (match.length < 10) return match; 
      return '[PHONE_REDACTED]';
    });
    return redacted;
  }
}
