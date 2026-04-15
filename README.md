# Drop by Drop: The Jerry Can Challenge 💧

**Drop by Drop** is a zero-dependency, responsive web game designed as an interactive campus engagement prototype for **charity: water**. Players control a Jerry Can to catch clean water drops, avoid pollutants, and hit milestones to unlock real-world campus rewards (like cafeteria discounts), all while raising awareness for global clean water access.

![HTML5](https://img.shields.io/badge/HTML5-E34F26?style=for-the-badge&logo=html5&logoColor=white)
![CSS3](https://img.shields.io/badge/CSS3-1572B6?style=for-the-badge&logo=css3&logoColor=white)
![Vanilla JS](https://img.shields.io/badge/JavaScript-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black)

## ✨ Features

* **Custom Game Engine:** Built entirely in vanilla JavaScript using a highly optimized `requestAnimationFrame` game loop. No external frameworks or libraries.
* **Cross-Platform Input:** Seamlessly supports both keyboard controls (Arrow keys / WASD) for desktop and responsive touch-drag controls for mobile devices.
* **Dynamic Difficulty Scaling:** Features three distinct difficulty modes (Easy, Normal, Hard) that dynamically scale drop speed, spawn intervals, and pollutant probabilities.
* **AABB Collision Detection:** Implements Axis-Aligned Bounding Box collision math with built-in tolerances for a forgiving and fair player experience.
* **Robust Asset Management:** Gracefully handles missing assets. If an image or audio file fails to load, the game automatically defaults to pure CSS shapes and silent audio handling without crashing.
* **Responsive UI/UX:** A fully responsive layout utilizing CSS Custom Properties (variables) that shifts from a mobile-first column layout to a rich 3-column desktop view with contextual sidebars.
* **Interactive Feedback:** Features milestone toast notifications, animated screen flashes, floating score text, and SVG circle progress tracking.

## 🛠️ Technical Architecture

The game logic is separated into a clean, highly readable structure tailored for performance and maintainability:

* **`CONFIG` & `STATE` Objects:** Serves as the single source of truth. `CONFIG` handles immutable game rules and tuning, while `STATE` tracks the live game data (score, active entities, timestamps).
* **Frame-Rate Independent Movement:** Uses time-delta calculations to ensure consistent drop speeds and player movement regardless of the device's monitor refresh rate.
* **DOM Caching:** All required DOM elements are cached on initialization into a single `DOM` object to minimize query selector overhead during the active game loop.

## 🚀 Getting Started

Because this project is built entirely with vanilla web technologies, there are no build steps, package managers, or dependencies required.

1. **Clone the repository:**
   ```bash
   git clone [https://github.com/yourusername/drop-by-drop.git](https://github.com/yourusername/drop-by-drop.git)

    Open the game:
    Simply open index.html in any modern web browser to play locally.
    (Note: If testing locally from the file system, audio files may be blocked by some browsers' autoplay/CORS policies. For the full experience, host via Live Server or GitHub Pages).

🎮 How to Play

    Desktop: Use ← / → arrow keys or A / D to move the Jerry Can.

    Mobile/Tablet: Touch and drag anywhere on the game board to move the Jerry Can.

    Objective: Catch clean water drops (+1 pt) to fill the progress bar.

    Hazards: Avoid brown pollutant drops! Catching one subtracts 3 points and costs 1 life.

    Goal: Reach the target number of clean drops (varies by difficulty) before running out of lives to unlock your campus reward code!

🤝 Context & Credits

This project was developed as a conceptual interactive prototype. It demonstrates how lightweight web games can be utilized for non-profit engagement and digital campaigns.

Author: Elijah Bent

Disclaimer: This is an educational/portfolio concept and is not officially affiliated with charity: water. All donations and links within the game redirect to the official charitywater.org website.
