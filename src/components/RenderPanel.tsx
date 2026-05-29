import { forwardRef, type CSSProperties } from "react";
import type { LayoutDirection, RenderMode, StyleConfig } from "../types";
import type { Group } from "../lib/mdc";
import type { Quadrat } from "../lib/mdc";

interface Props {
	mode: RenderMode;
	text: string;
	groups: Group[];
	cartouche: boolean;
	layout: LayoutDirection;
	style: StyleConfig;
}

// CSS writing-mode + direction for each layout option. Vertical-RL is the
// traditional Egyptian reading order for columnar inscriptions.
// function layoutToCss(layout: LayoutDirection): CSSProperties {
// 	switch (layout) {
// 		case "horizontal-ltr":
// 			return { writingMode: "horizontal-tb", direction: "ltr" };
// 		case "horizontal-rtl":
// 			return { writingMode: "horizontal-tb", direction: "rtl" };
// 		case "vertical-rl":
// 			return { writingMode: "vertical-rl" };
// 		case "vertical-lr":
// 			return { writingMode: "vertical-lr" };
// 	}
// }
function layoutToCss(layout: LayoutDirection): CSSProperties {
	switch (layout) {
		case "horizontal-ltr":
			return { writingMode: "horizontal-tb", direction: "ltr" };
		case "horizontal-rtl":
			return { writingMode: "horizontal-tb", direction: "rtl" };
		case "vertical-rl":
			return { writingMode: "vertical-rl", textOrientation: "upright" };
		case "vertical-lr":
			return { writingMode: "vertical-lr", textOrientation: "upright" };
	}
}

// Cartouche: oblong loop drawn in CSS with a perpendicular tie-bar.
// Drawing it ourselves (rather than relying on the font glyphs at U+13282
// and U+13283) gives a consistent look across any hieroglyph font.
function Cartouche({
	vertical,
	color,
	strokeWidth,
	children,
}: {
	vertical: boolean;
	color: string;
	strokeWidth: number;
	children: React.ReactNode;
}) {
	const sw = Math.max(2, strokeWidth);
	return (
		<div className={`cartouche-wrap ${vertical ? "vertical" : "horizontal"}`}>
			<div
				className="cartouche-inner"
				style={{ borderColor: color, borderWidth: sw, borderStyle: "solid" }}
			>
				{children}
			</div>
			<span
				className="cartouche-tie"
				style={{ background: color, ["--tie-thickness" as string]: `${sw}px` }}
			/>
		</div>
	);
}

// Render one MdC quadrat. 1 sign: rendered full size.
// 2 signs: side by side at 0.75x.
// 3+ signs: 2-row flex wrap at 0.6x for a square-ish footprint.
// function QuadratView({
//   signs,
//   fontSize,
// }: {
//   signs: string[];
//   fontSize: number;
// }) {
//   if (signs.length === 1) {
//     return <span className="quadrat">{signs[0]}</span>;
//   }
//   const scale = signs.length === 2 ? 0.75 : 0.6;
//   const inner: CSSProperties = {
//     fontSize: `${fontSize * scale}px`,
//     lineHeight: 1,
//   };
//   if (signs.length === 2) {
//     return (
//       <span className="quadrat quadrat-2" style={inner}>
//         {signs.map((s, i) => <span key={i} className="quadrat-cell">{s}</span>)}
//       </span>
//     );
//   }
//   // 3 or 4 signs: 2x2 grid (last cell may be empty for 3 signs)
//   const cells: string[] = signs.length === 3 ? [signs[0], signs[1], signs[2], ''] : signs.slice(0, 4);
//   return (
//     <span className="quadrat quadrat-4" style={inner}>
//       {cells.map((s, i) => <span key={i} className="quadrat-cell">{s}</span>)}
//     </span>
//   );
// }
// function QuadratView({
// 	signs,
// 	fontSize,
// }: {
// 	signs: string[];
// 	fontSize: number;
// }) {
// 	if (signs.length === 1) {
// 		return <span className="quadrat">{signs[0]}</span>;
// 	}

// 	// Slightly adjust scale depending on how many signs are clustered
// 	const scale = signs.length === 2 ? 0.75 : 0.6;
// 	const inner: CSSProperties = {
// 		fontSize: `${fontSize * scale}px`,
// 		lineHeight: 1,
// 		display: "flex",
// 		flexWrap: "wrap",
// 		justifyContent: "center",
// 		alignItems: "center",
// 		width: signs.length > 2 ? `${fontSize}px` : "auto",
// 	};

// 	// FIX: Map all signs instead of aggressively truncating via signs.slice(0, 4)
// 	return (
// 		<span
// 			className={`quadrat quadrat-${signs.length}`}
// 			style={inner}
// 		>
// 			{signs.map((s, i) => (
// 				<span
// 					key={i}
// 					className="quadrat-cell"
// 				>
// 					{s}
// 				</span>
// 			))}
// 		</span>
// 	);
// }
// function QuadratView({
// 	signs,
// 	fontSize,
// }: {
// 	signs: string[];
// 	fontSize: number;
// }) {
// 	if (signs.length === 1) {
// 		return <span className="quadrat">{signs[0]}</span>;
// 	}

// 	const scale = signs.length === 2 ? 0.75 : 0.6;
// 	const inner: CSSProperties = {
// 		fontSize: `${fontSize * scale}px`,
// 		lineHeight: 1,
// 		display: "flex",
// 		flexWrap: "wrap",
// 		justifyContent: "center",
// 		alignItems: "center",
// 		// FIX: Map all signs instead of aggressively truncating via signs.slice(0, 4)
// 		width: signs.length > 2 ? `${fontSize}px` : "auto",
// 		// FIX: Lock the quadrat's internal flex direction to horizontal.
// 		// This prevents the 2x2 grid from breaking when the parent is vertical.
// 		writingMode: "horizontal-tb",
// 	};

// 	return (
// 		<span
// 			className={`quadrat quadrat-${signs.length}`}
// 			style={inner}
// 		>
// 			{signs.map((s, i) => (
// 				<span
// 					key={i}
// 					className="quadrat-cell"
// 				>
// 					{s}
// 				</span>
// 			))}
// 		</span>
// 	);
// }

function QuadratView({
	quadrat,
	fontSize,
}: {
	quadrat: Quadrat;
	fontSize: number;
}) {
	const { rows } = quadrat;
	const totalSigns = rows.reduce((acc, row) => acc + row.length, 0);

	// Single sign rendering
	if (totalSigns === 1 && rows[0].length === 1) {
		return <span className="quadrat">{rows[0][0]}</span>;
	}

	const scale = totalSigns > 1 ? 0.6 : 1;
	const inner: CSSProperties = {
		display: "flex",
		flexDirection: "column", // Read ':' operator (stack rows)
		alignItems: "center",
		justifyContent: "center",
		writingMode: "horizontal-tb", // Lock internal writing mode so it doesn't break in vertical layouts
	};

	return (
		<span
			className={`quadrat quadrat-${totalSigns}`}
			style={inner}
		>
			{rows.map((row, rIdx) => (
				<span
					key={rIdx}
					className="quadrat-row"
					style={{
						display: "flex",
						flexDirection: "row",
						justifyContent: "center",
					}}
				>
					{row.map((sign, cIdx) => (
						<span
							key={cIdx}
							className="quadrat-cell"
							style={{ fontSize: `${fontSize * scale}px`, lineHeight: 1 }}
						>
							{sign}
						</span>
					))}
				</span>
			))}
		</span>
	);
}

const RenderPanel = forwardRef<HTMLDivElement, Props>(function RenderPanel(
	{ mode, text, groups, cartouche, layout, style },
	ref,
) {
	const isVertical = layout.startsWith("vertical");
	const hasContent = mode === "mdc" ? groups.length > 0 : text.length > 0;

	const panelStyle: CSSProperties = {
		background: style.bgColor,
		padding: style.padding,
		borderColor: style.borderColor,
		borderWidth: style.borderWidth,
		borderStyle: "solid",
	};

	const textStyle: CSSProperties = {
		color: style.textColor,
		fontSize: style.fontSize,
		letterSpacing: style.letterSpacing,
		fontFamily: `'${style.fontFamily}', serif`,
		textShadow: `${style.shadowOffsetX}px ${style.shadowOffsetY}px ${style.shadowBlur}px ${style.shadowColor}`,
		...layoutToCss(layout),
	};

	const body = !hasContent ? (
		<div
			className="glyph-empty"
			style={{ color: style.textColor, opacity: 0.4 }}
		>
			Type something and press Hieroglyphize
		</div>
	) : mode === "mdc" ? (
		<div
			className="glyph-text glyph-mdc"
			style={textStyle}
		>
			{groups.map((g, i) => {
				if (g.type === "space")
					return (
						<span
							key={i}
							className="word-gap"
						>
							{" "}
						</span>
					);
				return (
					<QuadratView
						key={i}
						quadrat={g.quadrat}
						fontSize={style.fontSize}
					/>
				);
			})}
		</div>
	) : (
		<div
			className="glyph-text"
			style={textStyle}
		>
			{text}
		</div>
	);

	return (
		<div
			className="render-panel"
			ref={ref}
			style={panelStyle}
		>
			{cartouche && hasContent ? (
				<Cartouche
					vertical={isVertical}
					color={style.textColor}
					strokeWidth={Math.max(3, style.borderWidth + 2)}
				>
					{body}
				</Cartouche>
			) : (
				body
			)}
		</div>
	);
});

export default RenderPanel;
