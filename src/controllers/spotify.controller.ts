import type { Request, Response, NextFunction} from 'express';
import {
  exchangeSpotifyCodeForToken,
  getSpotifyAuthorizeUrl,
  validateSpotifyAuthState,
} from '../services/spotify.service.js';

// Redirects the user to Spotify's authorization page
export function loginHandler(_req: Request, res: Response, next: NextFunction) {
    try {
        const authorizeUrl = getSpotifyAuthorizeUrl();
        return res.redirect(authorizeUrl);
    } catch (error) {
        return next(error);
    }
}

// Processes Spotify's OAuth callback and exchanges the authorization code for tokens
export async function callbackHandler(req: Request, res: Response, next: NextFunction) {
    const { code, state } = req.query;

    if (!code || typeof code !== "string") {
        return res.status(400).json({ error: "Missing or invalid 'code' query parameter" });
    }

    if (!state || typeof state !== "string") {
        return res.status(400).json({ error: "Missing or invalid 'state' query parameter" });
    }

    if (!validateSpotifyAuthState(state)) {
        return res.status(400).json({ error: "Invalid OAuth state" });
    }

    try {
        await exchangeSpotifyCodeForToken(code);

        return res.status(200).json({
            message: "Spotify authorization successful",
        });
    } catch (error) {
        return next(error);
    }
}