// Static checks that catch the mistakes a UI5 runtime only reports in the browser console:
//  1. every manifest.json parses and its sap.app.id matches the namespace used in index.html and the launchpad
//  2. every {i18n>key} used in views, fragments and the manifest exists in i18n.properties (and no key is unused)
//  3. metadata.xml and annotations.xml are well-formed, and annotation targets/actions point at real metadata
//  4. every mock data file belongs to an entity set and only uses properties declared in metadata.xml
// Run: npm run check
import { readFileSync, readdirSync, existsSync, statSync } from "node:fs";
import { join, relative } from "node:path";
import { fileURLToPath } from "node:url";

const root = fileURLToPath(new URL("..", import.meta.url));
const appsDir = join(root, "apps");
const problems = [];
const problem = (file, msg) => problems.push(`${relative(root, file)}: ${msg}`);

function walk(dir) {
	return readdirSync(dir).flatMap((name) => {
		const p = join(dir, name);
		return statSync(p).isDirectory() ? walk(p) : [p];
	});
}

function wellFormed(file, xml) {
	// Small structural check: tags balance and no stray "&". Enough to catch broken hand edits.
	const stack = [];
	// attribute values may contain ">" (binding paths like {i18n>key}), so match quoted values as a whole
	const re = /<(\/?)([A-Za-z_][\w:.-]*)((?:\s+[\w:.-]+\s*=\s*(?:"[^"]*"|'[^']*'))*)\s*(\/?)>/g;
	const body = xml.replace(/<\?[\s\S]*?\?>/g, "").replace(/<!--[\s\S]*?-->/g, "");
	let m;
	while ((m = re.exec(body))) {
		const [, closing, name, , selfClosing] = m;
		if (selfClosing) continue;
		if (closing) {
			const open = stack.pop();
			if (open !== name) return problem(file, `</${name}> closes <${open}>`);
		} else {
			stack.push(name);
		}
	}
	if (stack.length) problem(file, `unclosed <${stack.pop()}>`);
	if (/&(?!amp;|lt;|gt;|quot;|apos;|#\d+;)/.test(body)) problem(file, "unescaped &");
}

function parseMetadata(xml) {
	const namespace = /<Schema[^>]*Namespace="([^"]+)"/.exec(xml)[1];
	const container = /<EntityContainer[^>]*Name="([^"]+)"/.exec(xml)[1];
	const types = {};
	for (const [, name, body] of xml.matchAll(/<EntityType Name="([^"]+)"[^>]*>([\s\S]*?)<\/EntityType>/g)) {
		types[name] = [...body.matchAll(/<Property Name="([^"]+)"/g)].map((p) => p[1]);
	}
	const sets = {};
	for (const [, name, type] of xml.matchAll(/<EntitySet Name="([^"]+)" EntityType="[^".]+\.([^"]+)"/g)) sets[name] = type;
	const functions = [...xml.matchAll(/<FunctionImport Name="([^"]+)"/g)].map((f) => f[1]);
	return { namespace, container, types, sets, functions };
}

for (const app of readdirSync(appsDir)) {
	const webapp = join(appsDir, app, "webapp");
	if (!existsSync(join(webapp, "manifest.json"))) {
		problem(webapp, "no manifest.json");
		continue;
	}

	// 1. manifest and namespace
	const manifestFile = join(webapp, "manifest.json");
	let manifest;
	try {
		manifest = JSON.parse(readFileSync(manifestFile, "utf8"));
	} catch (e) {
		problem(manifestFile, `invalid JSON: ${e.message}`);
		continue;
	}
	const id = manifest["sap.app"].id;
	const index = readFileSync(join(webapp, "index.html"), "utf8");
	if (!index.includes(`"${id}": "./"`)) problem(join(webapp, "index.html"), `resource root for ${id} missing`);
	const launchpad = readFileSync(join(root, "launchpad", "index.html"), "utf8");
	if (!launchpad.includes(`"${id}"`)) problem(join(root, "launchpad", "index.html"), `no resource root for ${id}`);
	const sandbox = readFileSync(join(root, "appconfig", "fioriSandboxConfig.json"), "utf8");
	if (!sandbox.includes(`SAPUI5.Component=${id}`)) problem(join(root, "appconfig", "fioriSandboxConfig.json"), `no inbound for ${id}`);

	// 2. i18n keys
	const i18nFile = join(webapp, "i18n", "i18n.properties");
	const keys = new Set(readFileSync(i18nFile, "utf8").split(/\r?\n/).filter((l) => /^[\w.]+=/.test(l)).map((l) => l.split("=")[0]));
	const files = walk(webapp).filter((f) => /\.(xml|js|json)$/.test(f) && !f.includes("localService") && !f.includes(`${"test"}`));
	const used = new Set();
	for (const f of files) {
		const text = readFileSync(f, "utf8");
		for (const [, key] of text.matchAll(/i18n>(\w+)/g)) used.add(key);
		for (const [, key] of text.matchAll(/\{\{(\w+)\}\}/g)) used.add(key);
		for (const [, key] of text.matchAll(/getText\(\s*"(\w+)"(?!\s*\+)/g)) used.add(key);
		for (const [, key] of text.matchAll(/getText\(\s*bApprove \? "(\w+)" : "(\w+)"/g)) used.add(key);
		for (const [, a, b] of text.matchAll(/\? "(\w+)" : "(\w+)"\)/g)) [a, b].forEach((k) => keys.has(k) && used.add(k));
		if (f.endsWith(".xml")) wellFormed(f, text);
	}
	// keys built at runtime, e.g. "status" + code
	for (const k of keys) if (/^status[A-Z]$/.test(k) && files.some((f) => readFileSync(f, "utf8").includes('"status" +'))) used.add(k);
	for (const k of used) if (!keys.has(k)) problem(i18nFile, `missing key ${k}`);
	for (const k of keys) if (!used.has(k)) problem(i18nFile, `unused key ${k}`);

	// 3. metadata and annotations
	const metadataFile = join(webapp, "localService", "metadata.xml");
	const metadataXml = readFileSync(metadataFile, "utf8");
	wellFormed(metadataFile, metadataXml);
	const md = parseMetadata(metadataXml);
	const annotationsFile = join(webapp, "annotations", "annotations.xml");
	if (existsSync(annotationsFile)) {
		const xml = readFileSync(annotationsFile, "utf8");
		wellFormed(annotationsFile, xml);
		const alias = new RegExp(`Namespace="${md.namespace}" Alias="([^"]+)"`).exec(xml)?.[1];
		if (!alias) problem(annotationsFile, `no alias for ${md.namespace}`);
		else if (`${md.namespace}.`.includes(`${alias}.`)) problem(annotationsFile, `alias "${alias}" is a suffix of the namespace; UI5 would rewrite qualified names`);
		for (const [, target] of xml.matchAll(/<Annotations Target="([^"]+)"/g)) {
			const [, type, prop] = /^[^.]+\.([^/]+)(?:\/(.+))?$/.exec(target) || [];
			if (!md.types[type]) problem(annotationsFile, `target ${target}: no entity type ${type}`);
			else if (prop && !md.types[type].includes(prop)) problem(annotationsFile, `target ${target}: no property ${prop}`);
		}
		for (const [, action] of xml.matchAll(/Property="Action" String="([^"]+)"/g)) {
			const expected = `${md.namespace}.${md.container}/`;
			if (!action.startsWith(expected)) problem(annotationsFile, `action ${action} should start with ${expected}`);
			else if (!md.functions.includes(action.slice(expected.length))) problem(annotationsFile, `action ${action}: no such function import`);
		}
	}

	// 4. mock data
	const mockDir = join(webapp, "localService", "mockdata");
	for (const file of readdirSync(mockDir)) {
		const set = file.replace(/\.json$/, "");
		const type = md.sets[set];
		const full = join(mockDir, file);
		if (!type) {
			problem(full, `no entity set ${set} in metadata`);
			continue;
		}
		const rows = JSON.parse(readFileSync(full, "utf8"));
		const allowed = new Set(md.types[type]);
		const unknown = new Set(rows.flatMap((r) => Object.keys(r).filter((k) => !allowed.has(k))));
		if (unknown.size) problem(full, `properties not in ${type}: ${[...unknown].join(", ")}`);
	}

	console.log(`checked ${app} (${id})`);
}

if (problems.length) {
	console.error(`\n${problems.length} problem(s):\n  ${problems.join("\n  ")}`);
	process.exit(1);
}
console.log("\nAll apps consistent.");
