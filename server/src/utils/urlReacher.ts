import axios from "axios";

export async function urlReacher(url: string): Promise<boolean> {
  try {
    // Use HEAD for a lightweight check; fallback to GET if needed
    const response = await axios.head(url, { timeout: 5000 });
    // Consider 2xx and 3xx as reachable
    return response.status >= 200 && response.status < 400;
  } catch (error) {
    return false;
  }
}
