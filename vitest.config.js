import { defineConfig } from "vitest/config";

export default defineConfig({
    test: {
        env: {
            DB_NAME: "suggest_me_a_song_test",
        },
        setupFiles: ["./tests/setup.ts"],
        fileParallelism: false,
        maxWorkers: 1,
    },
});
