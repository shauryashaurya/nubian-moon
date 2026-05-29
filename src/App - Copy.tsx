import { useCallback, useRef, useState } from "react";
import Banner from "./components/Banner";
import Controls from "./components/Controls";
import RenderPanel from "./components/RenderPanel";
import { render as renderLiteralOrPhonetic } from "./lib/mapping";
import { renderMdC, type Group } from "./lib/mdc";
import { PRESETS } from "./lib/presets";
import { downloadImage } from "./lib/exportImage";
import { BUNDLED_FONT, REMOTE_FONTS, loadFont } from "./lib/fontLoader";
import type { AppState, FontOption } from "./types";

const INITIAL: AppState = {
	inputText: "",
	hasRendered: false,
	cartouche: false,
	mode: "literal",
	layout: "horizontal-ltr",
	preset: "Gold",
	style: { ...PRESETS.Gold },
};

export default function App() {
	const [state, setState] = useState<AppState>(INITIAL);
	const [fonts, setFonts] = useState<FontOption[]>([
		BUNDLED_FONT,
		...REMOTE_FONTS,
	]);
	const [isExplanationOpen, setIsExplanationOpen] = useState(false);
	const renderRef = useRef<HTMLDivElement>(null);

	const update = useCallback((patch: Partial<AppState>) => {
		setState((s) => ({ ...s, ...patch }));
	}, []);

	function doRender() {
		setState((s) => ({ ...s, hasRendered: true }));
	}

	async function onLoadFont(font: FontOption): Promise<void> {
		await loadFont(font);
		setFonts((list) =>
			list.map((f) =>
				f.family === font.family && f.label === font.label
					? { ...f, loaded: true }
					: f,
			),
		);
	}

	async function onAddCustomFont(family: string, url: string): Promise<void> {
		const next: FontOption = {
			family,
			label: family + " (custom)",
			source: "user-face",
			url,
			loaded: false,
		};
		await loadFont(next);
		next.loaded = true;
		setFonts((list) => [...list, next]);
		update({ style: { ...state.style, fontFamily: family } });
	}

	function onSelectFont(family: string) {
		update({ style: { ...state.style, fontFamily: family } });
	}

	async function onDownload(format: "png" | "jpg") {
		if (!renderRef.current) return;
		const safe = (state.inputText || "hieroglyph")
			.replace(/[^a-z0-9]+/gi, "_")
			.slice(0, 24);
		try {
			await downloadImage(renderRef.current, format, `nubian_moon_${safe}`);
		} catch (err) {
			console.error("export failed", err);
			alert("Image export failed. See console.");
		}
	}

	// Derive rendered output from inputs. No stored "rendered" state needed:
	// re-deriving on every render keeps mode/cartouche/text changes reactive,
	// while the hasRendered flag gates the panel until the user clicks once.
	const show = state.hasRendered && state.inputText.trim().length > 0;
	const text: string =
		show && state.mode !== "mdc"
			? renderLiteralOrPhonetic(state.inputText, state.mode)
			: "";
	const groups: Group[] =
		show && state.mode === "mdc" ? renderMdC(state.inputText) : [];

	const explanationPanel = show ? (
		<div
			className="explanation-panel"
			style={{
				marginTop: "1.5rem",
				padding: "1rem",
				background: "rgba(0,0,0,0.05)",
				borderRadius: "8px",
				maxWidth: "800px",
				marginInline: "auto",
			}}
		>
			{/* Collapsible Header */}
			<div
				style={{
					display: "flex",
					justifyContent: "space-between",
					alignItems: "center",
					cursor: "pointer",
				}}
				onClick={() => setIsExplanationOpen(!isExplanationOpen)}
			>
				<h4 style={{ margin: 0 }}>
					Translation Explanation ({state.mode} mode)
				</h4>
				<button
					type="button"
					style={{
						background: "none",
						border: "none",
						fontSize: "1.2rem",
						cursor: "pointer",
						color: "inherit",
					}}
				>
					{isExplanationOpen ? "▼" : "▶"}
				</button>
			</div>

			{/* Dynamic Content Body */}
			{isExplanationOpen && (
				<div
					style={{
						marginTop: "1rem",
						paddingTop: "1rem",
						borderTop: "1px solid rgba(0,0,0,0.1)",
					}}
				>
					{state.mode === "literal" && (
						<>
							<p
								style={{
									fontSize: "0.9rem",
									lineHeight: "1.4",
									margin: "0 0 10px 0",
								}}
							>
								<strong>Basic Mapping:</strong> Each character in your input is
								replaced one-to-one with a corresponding hieroglyph.
								Non-alphanumeric characters are ignored.
							</p>
							<p
								style={{
									fontSize: "0.9rem",
									lineHeight: "1.4",
									margin: 0,
									color: "#555",
								}}
							>
								<em>Analysis of your input:</em> You typed{" "}
								<strong>"{state.inputText}"</strong>. The literal engine parsed
								this character-by-character to generate{" "}
								<strong>{Array.from(text).length}</strong> hieroglyph(s).
							</p>
						</>
					)}

					{state.mode === "phonetic" && (
						<>
							<p
								style={{
									fontSize: "0.9rem",
									lineHeight: "1.4",
									margin: "0 0 10px 0",
								}}
							>
								<strong>Basic Mapping:</strong> Multi-letter English sounds
								(digraphs like <em>sh</em>, <em>th</em>, <em>kh</em>) are
								detected first and mapped to their single phonetic hieroglyph.
							</p>
							<p
								style={{
									fontSize: "0.9rem",
									lineHeight: "1.4",
									margin: 0,
									color: "#555",
								}}
							>
								<em>Analysis of your input:</em> You typed{" "}
								<strong>"{state.inputText}"</strong>. The engine scanned for
								digraphs and single letters to produce{" "}
								<strong>{Array.from(text).length}</strong> hieroglyph(s).
								{Array.from(text).length <
								state.inputText.replace(/\s+/g, "").length
									? " Notice how a multi-letter sound in your text was condensed into a single sign!"
									: ""}
							</p>
						</>
					)}

					{state.mode === "mdc" && (
						<>
							<p
								style={{
									fontSize: "0.9rem",
									lineHeight: "1.4",
									margin: "0 0 10px 0",
								}}
							>
								<strong>Basic Mapping:</strong> The MdC pipeline maps English
								text &rarr; Egyptological transliteration &rarr; Gardiner
								uniliteral codes &rarr; Hieroglyphs. Note that Egyptian had no
								'l', so it is substituted with 'r'.
							</p>
							<p
								style={{
									fontSize: "0.9rem",
									lineHeight: "1.4",
									margin: 0,
									color: "#555",
								}}
							>
								<em>Analysis of your input:</em> You typed{" "}
								<strong>"{state.inputText}"</strong>. This was broken down into{" "}
								<strong>
									{groups.filter((g) => g.type === "quadrat").length}
								</strong>{" "}
								hieroglyph blocks (quadrats) and{" "}
								<strong>
									{groups.filter((g) => g.type === "space").length}
								</strong>{" "}
								spaces.
								<br />
								<br />
								{state.inputText.includes("|")
									? "using the '|' character to cluster your signs into blocks!"
									: "see if adding the pipe '|' character inside your words (e.g. 'c|l|e|o|p|a|t|r|a') to group signs visually into square blocks helps you understand the transliteration better..."}
							</p>
						</>
					)}
				</div>
			)}
		</div>
	) : null;

	return (
		<div className="app">
			<Banner />
			<main className="layout">
				<Controls
					state={state}
					onChange={update}
					onRender={doRender}
					fonts={fonts}
					onSelectFont={onSelectFont}
					onLoadFont={onLoadFont}
					onAddCustomFont={onAddCustomFont}
				/>
				<section className="stage">
					<div className="render-area">
						<RenderPanel
							ref={renderRef}
							mode={state.mode}
							text={text}
							groups={groups}
							cartouche={state.cartouche}
							layout={state.layout}
							style={state.style}
						/>
					</div>
					{explanationPanel}
					<div className="download-row">
						<button
							onClick={() => onDownload("png")}
							disabled={!show}
						>
							Download PNG
						</button>
						<button
							onClick={() => onDownload("jpg")}
							disabled={!show}
						>
							Download JPG
						</button>
						<span className="dl-note">max 800px wide</span>
					</div>
				</section>
			</main>
		</div>
	);
}
