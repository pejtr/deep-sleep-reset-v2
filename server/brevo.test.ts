import { describe, it, expect } from "vitest";

describe("Brevo API key validation", () => {
  it("BREVO_API_KEY should be set in environment", () => {
    const key = process.env.BREVO_API_KEY;
    expect(key).toBeDefined();
    expect(key).not.toBe("");
    expect(key).not.toBe("your-brevo-api-key");
  });

  it("should connect to Brevo API successfully", async () => {
    const key = process.env.BREVO_API_KEY;
    if (!key || key.length < 10) {
      console.warn("Skipping Brevo API test — key not configured");
      return;
    }

    const response = await fetch("https://api.brevo.com/v3/account", {
      headers: {
        "api-key": key,
        "accept": "application/json",
      },
    });

    const data = await response.json() as { email?: string; code?: string };

    if (data.code === "unauthorized") {
      throw new Error("Brevo API key is invalid — please provide a valid key");
    }

    expect(response.status).toBe(200);
    expect(data.email).toBeDefined();
    console.log("Brevo connected:", data.email);
  }, 15000);
});
