// utils/chromeAI.js
export function detectLanguageChrome(text) {
    return new Promise((resolve, reject) => {
      chrome.ai.languageDetection.detect({ text }, (response) => {
        if (chrome.runtime.lastError || response.error) {
          reject(chrome.runtime.lastError || response.error);
        } else {
          // Assuming the response returns an object with a "language" property
          resolve(response.language);
        }
      });
    });
  }
  
  export function summarizeTextChrome(text) {
    return new Promise((resolve, reject) => {
      chrome.ai.summarizer.summarize({ text }, (response) => {
        if (chrome.runtime.lastError || response.error) {
          reject(chrome.runtime.lastError || response.error);
        } else {
          // Assuming the response returns an object with a "summary" property
          resolve(response.summary);
        }
      });
    });
  }
  
  export function translateTextChrome(text, targetLanguage) {
    return new Promise((resolve, reject) => {
      chrome.ai.translator.translate({ text, targetLanguage }, (response) => {
        if (chrome.runtime.lastError || response.error) {
          reject(chrome.runtime.lastError || response.error);
        } else {
          // Assuming the response returns an object with a "translation" property
          resolve(response.translation);
        }
      });
    });
  }
  