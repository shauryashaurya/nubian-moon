import { useCallback, useRef, useState } from "react";
import Banner from "./components/Banner";
import Controls from "./components/Controls";
import RenderPanel from "./components/RenderPanel";
import { render as renderLiteralOrPhonetic } from "./lib/mapping";
import { renderMdC, type Group, type PipelineTrace } from "./lib/mdc";
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

	const show = state.hasRendered && state.inputText.trim().length > 0;
	const text: string =
		show && state.mode !== "mdc"
			? renderLiteralOrPhonetic(state.inputText, state.mode)
			: "";

	// Capture both groups and the pipeline trace
	const mdcData =
		show && state.mode === "mdc"
			? renderMdC(state.inputText)
			: { groups: [], trace: [] };
	const groups: Group[] = mdcData.groups;
	const trace: PipelineTrace[] = mdcData.trace;

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
			<div
				style={{
					display: "flex",
					justifyContent: "space-between",
					alignItems: "center",
					cursor: "pointer",
				}}
				onClick={() => setIsExplanationOpen(!isExplanationOpen)}
			>
				<h4 style={{ margin: 0 }}>Translation Pipeline ({state.mode} mode)</h4>
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

			{isExplanationOpen && (
				<div
					style={{
						marginTop: "1rem",
						paddingTop: "1rem",
						borderTop: "1px solid rgba(0,0,0,0.1)",
					}}
				>
					{state.mode !== "mdc" ? (
						<p
							style={{
								fontSize: "0.9rem",
								lineHeight: "1.4",
								margin: 0,
								color: "#555",
							}}
						>
							<em>Analysis of your input:</em> The engine scanned{" "}
							<strong>"{state.inputText}"</strong> to produce{" "}
							<strong>{Array.from(text).length}</strong> hieroglyph(s) directly
							from standard character mappings.
						</p>
					) : (
						<div style={{ fontSize: "0.9rem", color: "#333" }}>
							<p style={{ marginBottom: "12px" }}>
								<strong>How MdC processed your input:</strong>
							</p>

							<div style={{ display: "grid", gap: "8px" }}>
								{trace.map((step, idx) => (
									<div
										key={idx}
										style={{
											padding: "8px",
											background: "#fff",
											borderRadius: "4px",
											border: "1px solid #ddd",
										}}
									>
										<div
											style={{
												display: "flex",
												justifyContent: "space-between",
												marginBottom: "4px",
											}}
										>
											<strong>Word: "{step.english}"</strong>
											{step.isDictMatch ? (
												<span
													style={{
														color: "#2e7d32",
														fontSize: "0.8rem",
														fontWeight: "bold",
													}}
												>
													✓ Dictionary Match
												</span>
											) : (
												<span style={{ color: "#f57c00", fontSize: "0.8rem" }}>
													Heuristic Approximation
												</span>
											)}
										</div>

										<div
											style={{
												display: "flex",
												alignItems: "center",
												flexWrap: "wrap",
												gap: "8px",
												fontFamily: "monospace",
												fontSize: "0.85rem",
											}}
										>
											<span
												title="Transliteration (Egyptological Sounds)"
												style={{
													background: "#eee",
													padding: "2px 6px",
													borderRadius: "4px",
												}}
											>
												{step.translit}
											</span>
											<span>&rarr;</span>
											<span
												title="Gardiner Code layout (with structural operators)"
												style={{
													background: "#eee",
													padding: "2px 6px",
													borderRadius: "4px",
												}}
											>
												{step.gardiner}
											</span>
											<span>&rarr;</span>
											<span
												title="Final Unicode Output"
												style={{
													fontSize: "1.2rem",
													fontFamily: `'${state.style.fontFamily}', serif`,
												}}
											>
												{step.finalSigns}
											</span>
										</div>
									</div>
								))}
							</div>

							<p
								style={{
									marginTop: "12px",
									fontSize: "0.8rem",
									color: "#666",
									fontStyle: "italic",
								}}
							>
								Note: In Gardiner code, <code>*</code> places signs horizontally
								side-by-side, and <code>:</code> stacks them vertically.
							</p>
						</div>
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
