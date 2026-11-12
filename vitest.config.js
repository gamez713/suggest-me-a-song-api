import { defineConfig } from "vitest/config";

export default defineConfig({
    test: {
        env: {
            DB_NAME: "suggest_me_a_song_test",
            ADMIN_API_KEY: "test_admin_key",
            TOKEN_ENCRYPTION_KEY: "a".repeat(64),
            SPOTIFY_CLIENT_ID: "test_client_id",
            SPOTIFY_CLIENT_SECRET: "test_client_secret",
        },
        setupFiles: ["./tests/setup.ts"],
        fileParallelism: false,
        maxWorkers: 1,
    },
});
