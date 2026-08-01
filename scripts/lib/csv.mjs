/**
 * Parseur CSV minimal, conforme RFC 4180.
 *
 * Découper sur les retours à la ligne ne suffit pas : un champ entre guillemets
 * peut en contenir, ce qui arrive dès qu'un utilisateur saisit du texte libre
 * dans description ou notes. Le fichier est donc parcouru caractère par
 * caractère.
 *
 * Chaque cellule conserve l'information « était-elle entre guillemets ? ».
 * C'est ce qui permet de distinguer un NULL Postgres — exporté sans guillemets,
 * parfois sous la forme littérale « null » par le tableau de bord Supabase —
 * d'une chaîne vide, exportée sous la forme "".
 */

/**
 * @typedef {{ value: string, quoted: boolean }} Cell
 */

/**
 * @param {string} text
 * @returns {{ columns: string[], rows: Cell[][] }}
 */
export function parseCsv(text) {
	const clean = text.replace(/^﻿/, '');

	/** @type {Cell[][]} */
	const rows = [];
	/** @type {Cell[]} */
	let row = [];
	let field = '';
	let quoted = false;
	let inQuotes = false;
	let i = 0;

	const pushField = () => {
		row.push({ value: field, quoted });
		field = '';
		quoted = false;
	};

	const pushRow = () => {
		pushField();
		// Une ligne vide en fin de fichier ne doit pas produire d'enregistrement.
		if (row.length > 1 || row[0].value !== '' || row[0].quoted) rows.push(row);
		row = [];
	};

	while (i < clean.length) {
		const char = clean[i];

		if (inQuotes) {
			if (char === '"') {
				if (clean[i + 1] === '"') {
					field += '"';
					i += 2;
					continue;
				}
				inQuotes = false;
				i++;
				continue;
			}
			field += char;
			i++;
			continue;
		}

		if (char === '"') {
			inQuotes = true;
			quoted = true;
			i++;
			continue;
		}

		if (char === ',') {
			pushField();
			i++;
			continue;
		}

		if (char === '\r') {
			// CRLF ou CR seul
			if (clean[i + 1] === '\n') i++;
			pushRow();
			i++;
			continue;
		}

		if (char === '\n') {
			pushRow();
			i++;
			continue;
		}

		field += char;
		i++;
	}

	// Dernière ligne sans saut final
	if (field !== '' || quoted || row.length > 0) pushRow();

	if (rows.length === 0) return { columns: [], rows: [] };

	const columns = rows[0].map((cell) => cell.value.trim().toLowerCase());
	return { columns, rows: rows.slice(1) };
}

/**
 * Valeur d'une cellule, NULL compris.
 *
 * Le tableau de bord Supabase écrit les NULL sous la forme « null » sans
 * guillemets. Une cellule entre guillemets est toujours rendue telle quelle,
 * ce qui préserve une vraie chaîne "null" comme une chaîne vide "".
 *
 * @param {Cell | undefined} cell
 * @returns {string | null}
 */
export function cellValue(cell) {
	if (!cell) return null;
	if (cell.quoted) return cell.value;

	const trimmed = cell.value.trim();
	if (trimmed === '' || trimmed.toLowerCase() === 'null') return null;
	return trimmed;
}

/**
 * Transforme les lignes en objets { colonne: valeur | null }.
 * @param {{ columns: string[], rows: Cell[][] }} parsed
 * @returns {Record<string, string | null>[]}
 */
export function toRecords(parsed) {
	return parsed.rows.map((row) => {
		/** @type {Record<string, string | null>} */
		const record = {};
		parsed.columns.forEach((name, index) => {
			record[name] = cellValue(row[index]);
		});
		return record;
	});
}

/**
 * Normalise un horodatage Postgres (« 2026-03-02 18:23:36.501902+00 ») en ISO 8601.
 * @param {string | null} value
 * @returns {string | null}
 */
export function timestamp(value) {
	if (!value) return null;
	const iso = value.replace(' ', 'T').replace(/\+00(:00)?$/, 'Z');
	const date = new Date(iso);
	return Number.isNaN(date.getTime()) ? null : date.toISOString();
}
