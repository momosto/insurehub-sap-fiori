import js from "@eslint/js";
import globals from "globals";

// UI5 apps are AMD modules (sap.ui.define) running in the browser; tools/ is Node.
export default [
	{ ignores: ["node_modules/**", "dist/**", "report/**"] },
	js.configs.recommended,
	{
		files: ["apps/**/*.js", "launchpad/**/*.js"],
		languageOptions: {
			ecmaVersion: 2022,
			sourceType: "script",
			globals: { ...globals.browser, sap: "readonly", QUnit: "readonly", opaTest: "readonly" }
		},
		rules: {
			"no-unused-vars": ["error", { args: "none", caughtErrors: "none" }],
			"no-var": "off",
			eqeqeq: "error",
			"no-console": "error",
			"strict": ["error", "function"]
		}
	},
	{
		files: ["tools/**/*.mjs", "eslint.config.mjs"],
		languageOptions: { ecmaVersion: 2022, sourceType: "module", globals: globals.node }
	},
	{
		files: ["tools/**/*.cjs"],
		languageOptions: { ecmaVersion: 2022, sourceType: "commonjs", globals: globals.node }
	}
];
