// import bannerSmall from "../assets/banner-small.jpg";
// import bannerMedium from "../assets/banner-medium.jpg";
// import bannerLarge from "../assets/banner-large.jpg";
import bannerImg from "../assets/banner-small.png";

// export default function Banner() {
//   return (
//     <header className="banner">
//       <div className="banner-placeholder">[ banner placeholder &mdash; 150px ]</div>
//     </header>
//   );
// }

export default function Banner() {
	return (
		<header
			className="banner"
			style={{ display: "flex", justifyContent: "center" }}
		>
			<img
				src={bannerImg}
				alt="A Nubian Moon"
				style={{
					maxHeight: "300px", // Capped at 150px tall
					maxWidth: "100%", // Prevents overflowing the screen
					width: "auto", // Scales width naturally
					objectFit: "contain", // Guarantees proportions never warp
				}}
			/>
		</header>
	);
}
