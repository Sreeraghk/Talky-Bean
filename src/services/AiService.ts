import { AI_CONFIG } from "../config/aiConfig";
import { DeveloperWhitelistService } from "./DeveloperWhitelistService";
import { CloudStatsService } from "./CloudStatsService";
import { ApiService, API_ENDPOINTS } from "./ApiService";

async function buildAuthHeaders(): Promise<Record<string, string>> {
  return ApiService.getAuthHeaders();
}

/**
 * Helpler function to aggregate input text to compute token estimates
 */
function extractTextFromContents(contents: any): string {
  if (!contents) return "";
  if (typeof contents === 'string') return contents;
  if (Array.isArray(contents)) {
    return contents.map((c: any) => {
      if (typeof c === 'string') return c;
      if (c.parts && Array.isArray(c.parts)) {
        return c.parts.map((p: any) => p.text || "").join(" ");
      }
      return "";
    }).join(" ");
  }
  return "";
}

/**
 * Robustly parses and outputs server or network error messages
 */
async function handleResponseError(response: Response): Promise<never> {
  let errorMsg = `HTTP ${response.status} Error`;
  let requiresAgeConfirmation = false;
  let errorCode: string | undefined = undefined;

  try {
    const contentType = response.headers.get("content-type") || "";
    const rawText = await response.text();

    if (contentType.includes("application/json") && !rawText.trim().startsWith("<")) {
      try {
        const errData = JSON.parse(rawText);
        requiresAgeConfirmation = !!errData?.requiresAgeConfirmation;
        errorCode = errData?.code;
        if (requiresAgeConfirmation && typeof window !== 'undefined') {
          window.dispatchEvent(new CustomEvent('talkybean_require_age_confirmation'));
        }
        if (errData?.error) {
          errorMsg = typeof errData.error === 'object' ? JSON.stringify(errData.error) : errData.error;
        }
      } catch {
        // Fallback below
      }
    } else {
      if (rawText && !rawText.trim().startsWith("<") && rawText.trim().length < 200) {
        errorMsg = `${response.status}: ${rawText.trim()}`;
      } else {
        errorMsg = response.status === 404
          ? "The AI endpoint could not be found. Please check backend connection."
          : response.status === 502 || response.status === 503 || response.status === 504
          ? "AI service is temporarily unavailable. Please retry in a few moments."
          : `HTTP ${response.status} Error`;
      }
    }
  } catch (e) {
    // Fallback to default message
  }

  const errorObj: any = new Error(errorMsg);
  errorObj.status = response.status;
  errorObj.requiresAgeConfirmation = requiresAgeConfirmation;
  errorObj.code = errorCode || (
    response.status === 401 ? 'UNAUTHORIZED' :
    response.status === 403 ? (requiresAgeConfirmation ? 'AGE_CONFIRMATION_REQUIRED' : 'FORBIDDEN') :
    response.status === 429 ? 'RATE_LIMITED' :
    response.status === 503 ? 'SERVICE_UNAVAILABLE' :
    'SERVER_ERROR'
  );
  throw errorObj;
}

/**
 * Centralized AI Service to manage model selection, initialization, and context caching.
 * This acts as the "Model Wrapper Class" to provide model abstraction.
 */
export class AiService {
  private static caches: Record<string, { name: string; expiry: number }> = {};

  /**
   * Helper to verify if the whitelist constraints are violated, and dynamically trigger token increment.
   */
  static async executeWithWhitelistTracking(promptText: string, fetchFn: () => Promise<string>): Promise<string> {
    const whitelist = DeveloperWhitelistService.getCurrentUserWhitelist();
    const isWhitelisted = whitelist && whitelist.allowed;
    
    if (isWhitelisted) {
      if (whitelist.tokenLimit !== null && whitelist.tokenUsed >= whitelist.tokenLimit) {
        throw new Error(`Your developer-allocated token cap of ${whitelist.tokenLimit.toLocaleString()} has been reached (Current usage: ${whitelist.tokenUsed.toLocaleString()}). Please contact Sreeragh (sreeraghk@gmail.com) to increase your limit.`);
      }
    }
    
    const responseText = await fetchFn();
    
    if (isWhitelisted && whitelist?.email) {
      const estimatedTokens = Math.ceil((promptText.length + responseText.length) / 4);
      DeveloperWhitelistService.incrementTokensUsed(whitelist.email, estimatedTokens).catch(err => {
        console.warn("[AiService] Whitelist token increment failed:", err);
      });
    }
    
    return responseText;
  }

  /**
   * Returns a secure client proxy that relays all content generation and dynamic chat
   * requests to our full-stack Express backend. This keeps the actual API keys securely hidden.
   */
  static getClient(): any {
    return {
      models: {
        generateContent: async (params: any) => {
          const promptText = extractTextFromContents(params.contents);
          const responseText = await AiService.executeWithWhitelistTracking(promptText, async () => {
            let response: Response;
            try {
              response = await fetch(ApiService.getEndpointUrl(API_ENDPOINTS.AI_GENERATE_CONTENT), {
                method: "POST",
                headers: await buildAuthHeaders(),
                credentials: "include",
                body: JSON.stringify(params)
              });
            } catch (networkErr: any) {
              const err: any = new Error(networkErr?.message || "Network request failed. Please check your internet connection.");
              err.status = 0;
              err.code = "NETWORK_ERROR";
              throw err;
            }

            // If token expired, attempt single refresh retry
            if (response.status === 401) {
              try {
                const refreshedHeaders = await ApiService.getAuthHeaders({}, true);
                if (refreshedHeaders['Authorization']) {
                  response = await fetch(ApiService.getEndpointUrl(API_ENDPOINTS.AI_GENERATE_CONTENT), {
                    method: "POST",
                    headers: refreshedHeaders,
                    credentials: "include",
                    body: JSON.stringify(params)
                  });
                }
              } catch (refreshErr) {
                console.warn("[AiService] Single token refresh retry failed:", refreshErr);
              }
            }

            if (!response.ok) {
              await handleResponseError(response);
            }

            const contentType = response.headers.get("content-type") || "";
            const rawBody = await response.text();

            if (rawBody.trim().startsWith("<") || (!contentType.includes("application/json") && !rawBody.trim().startsWith("{"))) {
              console.warn("[AiService] Server returned HTML or non-JSON content type:", contentType, rawBody.slice(0, 100));
              throw new Error("AI service is temporarily unavailable. Please retry in a few moments.");
            }

            let data: any;
            try {
              data = JSON.parse(rawBody);
            } catch (parseErr) {
              console.error("[AiService] Failed to parse JSON response:", parseErr, rawBody.slice(0, 100));
              throw new Error("The AI returned an unreadable response. Please retry.");
            }

            return data.text || "";
          });

          return {
            text: responseText
          };
        }
      },
      chats: {
        create: (params: any) => {
          // Maintaining client-side state of chat history to match GoogleGenAI design
          const currentHistory = [...(params.history || [])];
          return {
            sendMessage: async ({ message }: { message: string }) => {
              // Add current user prompt to session history
              currentHistory.push({
                role: "user",
                parts: [{ text: message }]
              });
 
              const promptText = extractTextFromContents(currentHistory);
              const responseText = await AiService.executeWithWhitelistTracking(promptText, async () => {
                const response = await fetch(ApiService.getEndpointUrl(API_ENDPOINTS.AI_GENERATE_CONTENT), {
                  method: "POST",
                  headers: await buildAuthHeaders(),
                  credentials: "include",
                  body: JSON.stringify({
                    model: params.model,
                    contents: currentHistory,
                    config: params.config
                  })
                });
                if (!response.ok) {
                  await handleResponseError(response);
                }

                const contentType = response.headers.get("content-type") || "";
                const rawBody = await response.text();

                if (rawBody.trim().startsWith("<") || (!contentType.includes("application/json") && !rawBody.trim().startsWith("{"))) {
                  console.warn("[AiService] Chat server returned HTML or non-JSON content type:", contentType, rawBody.slice(0, 100));
                  throw new Error("AI chat service is temporarily unavailable. Please retry in a moment.");
                }

                let data: any;
                try {
                  data = JSON.parse(rawBody);
                } catch (parseErr) {
                  console.error("[AiService] Failed to parse chat JSON response:", parseErr, rawBody.slice(0, 100));
                  throw new Error("The AI returned an unreadable response. Please retry.");
                }

                return data.text || "";
              });

              // Add model's response back to history
              currentHistory.push({
                role: "model",
                parts: [{ text: responseText }]
              });
 
              return {
                text: responseText,
                response: {
                  text: () => responseText
                }
              };
            },
            sendMessageStream: async ({ message }: { message: string }) => {
              // Pre-check whitelist token cap before initializing the stream
              const whitelist = DeveloperWhitelistService.getCurrentUserWhitelist();
              if (whitelist && whitelist.allowed) {
                if (whitelist.tokenLimit !== null && whitelist.tokenUsed >= whitelist.tokenLimit) {
                  throw new Error(`Your developer-allocated token cap of ${whitelist.tokenLimit.toLocaleString()} has been reached (Current usage: ${whitelist.tokenUsed.toLocaleString()}). Please contact Sreeragh (sreeraghk@gmail.com) to increase your limit.`);
                }
              }

              // Add current user prompt to session history
              currentHistory.push({
                role: "user",
                parts: [{ text: message }]
              });
 
              const response = await fetch(ApiService.getEndpointUrl(API_ENDPOINTS.AI_GENERATE_CONTENT_STREAM), {
                method: "POST",
                headers: await buildAuthHeaders(),
                credentials: "include",
                body: JSON.stringify({
                  model: params.model,
                  contents: currentHistory,
                  config: params.config
                })
              });
 
              if (!response.ok) {
                await handleResponseError(response);
              }
 
              const reader = response.body?.getReader();
              if (!reader) {
                throw new Error("Response body is not readable");
              }
 
              const decoder = new TextDecoder("utf-8");
              let buffer = "";
              let streamEnded = false;
              let responseText = "";
              const tokenQueue: string[] = [];
 
              const asyncIterable = {
                [Symbol.asyncIterator]() {
                  return {
                    async next() {
                      // 1. If we have tokens in the queue, yield the next one
                      if (tokenQueue.length > 0) {
                        const text = tokenQueue.shift()!;
                        responseText += text;
                        return {
                          done: false,
                          value: {
                            text,
                            response: {
                              text: () => responseText
                            }
                          }
                        };
                      }
 
                      // 2. If no tokens and stream has ended, we are done
                      if (streamEnded) {
                        return { done: true, value: undefined };
                      }
 
                      // 3. Keep reading from stream until we get a token or hit EOF
                      while (true) {
                        const { done, value } = await reader.read();
 
                        if (done) {
                          streamEnded = true;
                          // Parse whatever remains in the buffer
                          if (buffer) {
                            parseLines(buffer);
                            buffer = "";
                          }
                          // Add full response to history at the end
                          if (responseText) {
                            currentHistory.push({
                              role: "model",
                              parts: [{ text: responseText }]
                            });
                          }

                          // Trigger non-blocking quota update if whitelisted
                          const wl = DeveloperWhitelistService.getCurrentUserWhitelist();
                          if (wl && wl.allowed && wl.email && responseText) {
                            const pText = extractTextFromContents(currentHistory);
                            const estimatedTokens = Math.ceil((pText.length + responseText.length) / 4);
                            DeveloperWhitelistService.incrementTokensUsed(wl.email, estimatedTokens).catch(err => {
                              console.warn("[AiService] Whitelist streaming increment failed:", err);
                            });
                          }

                          if (tokenQueue.length > 0) {
                            const text = tokenQueue.shift()!;
                            responseText += text;
                            return {
                              done: false,
                              value: {
                                text,
                                response: {
                                  text: () => responseText
                                }
                              }
                            };
                          }
                          return { done: true, value: undefined };
                        }
 
                        // Append new chunk to buffer
                        buffer += decoder.decode(value, { stream: true });
                        
                        // Parse complete lines from the buffer
                        const lines = buffer.split("\n");
                        // Save the last incomplete line
                        buffer = lines.pop() || "";
 
                        for (const line of lines) {
                          parseLine(line);
                        }
 
                        // If we parsed one or more tokens, yield the first one
                        if (tokenQueue.length > 0) {
                          const text = tokenQueue.shift()!;
                          responseText += text;
                          return {
                            done: false,
                            value: {
                              text,
                              response: {
                                text: () => responseText
                              }
                            }
                          };
                        }
                      }
 
                      function parseLines(str: string) {
                        const lines = str.split("\n");
                        for (const line of lines) {
                          parseLine(line);
                        }
                      }
 
                      function parseLine(line: string) {
                        const trimmed = line.trim();
                        if (!trimmed) return;
                        if (trimmed.startsWith("data: ")) {
                          const dataStr = trimmed.slice(6).trim();
                          if (dataStr === "[DONE]") {
                            streamEnded = true;
                            return;
                          }
                          try {
                            const parsed = JSON.parse(dataStr);
                            if (parsed.error) {
                              throw new Error(parsed.error);
                            }
                            if (parsed.text) {
                              tokenQueue.push(parsed.text);
                            }
                          } catch (e: any) {
                            if (e.message && (e.message.includes("limit") || e.message.includes("quota") || e.message.includes("exceeded") || e.message.includes("You have run out"))) {
                              throw e;
                            }
                            console.error("[AiService] SSE parse error:", e.message || e);
                          }
                        }
                      }
                    }
                  };
                }
              };
 
              return asyncIterable;
            }
          };
        }
      }
    };
  }

  /**
   * Returns the name of the model to be used for general content generation.
   */
  static getModelName(): string {
    return AI_CONFIG.primaryModel;
  }

  /**
   * Caching disabled for simplicity and zero-latency loading.
   */
  static async getContextCache(_systemInstruction: string, _context: string): Promise<string | undefined> {
    return undefined;
  }

  private static async doGetContextCache(systemInstruction: string, context: string): Promise<string | undefined> {
    try {
      const config = AI_CONFIG;
      
      // Safer hash function instead of btoa (which fails on non-ASCII like German chars)
      const safeContent = `${systemInstruction}${context}`;
      let hash = 0;
      for (let i = 0; i < safeContent.length; i++) {
        const char = safeContent.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash |= 0; // Convert to 32bit integer
      }
      const cacheKey = Math.abs(hash).toString(36);
      
      // Check if we have a valid non-expired cache locally
      const existing = this.caches[cacheKey];
      if (existing && existing.expiry > Date.now()) {
        return existing.name;
      }

      const ai = this.getClient();
      const ttlSeconds = config.contextCacheTTLMinutes * 60;
      
      const cache = await ai.caches.create({
        model: this.getModelName(),
        config: {
          contents: [
            { role: 'user', parts: [{ text: `SYSTEM_CONTEXT: ${systemInstruction}\nSCENARIO: ${context}` }] }
          ],
          ttl: `${ttlSeconds}s`
        }
      });

      this.caches[cacheKey] = {
        name: cache.name,
        expiry: Date.now() + (ttlSeconds - 60) * 1000 // Buffer of 60s
      };

      console.log(`[AiService] New context cache created: ${cache.name}`);
      return cache.name;
    } catch (error) {
      console.warn("[AiService] Context caching failed or bypassed.", error);
      return undefined;
    }
  }
}
