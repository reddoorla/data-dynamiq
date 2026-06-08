import js from "@eslint/js";
import ts from "typescript-eslint";
import svelte from "eslint-plugin-svelte";
import prettier from "eslint-config-prettier";
import globals from "globals";
import svelteConfig from "./svelte.config.js";

export default [
	js.configs.recommended,
	...ts.configs.recommended,
	...svelte.configs.recommended,
	prettier,
	...svelte.configs.prettier,
	{
		languageOptions: {
			globals: {
				...globals.browser,
				...globals.node,
			},
		},
		rules: {
			"@typescript-eslint/no-unused-vars": [
				"error",
				{
					argsIgnorePattern: "^_",
					varsIgnorePattern: "^_",
					caughtErrorsIgnorePattern: "^_",
				},
			],
			// Noisy rules pre-disabled for the Svelte 4 -> 5 migration; revisit once
			// the codemod + hand-clean pass (Commits 3-4) lands.
			"svelte/no-navigation-without-resolve": "off",
			"svelte/require-each-key": "off",
			"svelte/no-reactive-functions": "off",
			"svelte/no-useless-mustaches": "off",
			"svelte/no-at-html-tags": "off",
		},
	},
	{
		files: ["**/*.svelte", "**/*.svelte.js", "**/*.svelte.ts"],
		languageOptions: {
			parserOptions: {
				parser: ts.parser,
				svelteConfig,
			},
		},
	},
	{
		files: ["**/*.d.ts"],
		rules: {
			"no-var": "off",
			"@typescript-eslint/no-unused-vars": "off",
		},
	},
	{
		ignores: [
			"build/",
			".svelte-kit/",
			".netlify/",
			"node_modules/",
			"static/",
			"customtypes/",
			"src/lib/slices/**/index.js",
		],
	},
];
