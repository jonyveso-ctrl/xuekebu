document.addEventListener('DOMContentLoaded', () => {
    const svg = document.getElementById('tree-loader');
    const namespace = "http://www.w3.org/2000/svg";
    const tl = gsap.timeline();

    // --- STAGE 1: The 15-Point Geometric Tree ---
    const phase1_points = [
        { x: 100, y: 190 }, { x: 100, y: 150 }, { x: 100, y: 110 }, // Trunk
        { x: 70, y: 80 }, { x: 50, y: 50 }, { x: 40, y: 20 }, { x: 60, y: 30 }, // Left
        { x: 130, y: 80 }, { x: 150, y: 50 }, { x: 140, y: 20 }, { x: 160, y: 30 }, // Right
        { x: 100, y: 70 }, { x: 100, y: 40 }, { x: 90, y: 10 }, { x: 110, y: 20 }  // Top
    ];
    const phase1_connections = [
        [0, 1], [1, 2], [2, 3], [2, 7], [2, 11], [3, 4], [4, 5], [4, 6],
        [7, 8], [8, 9], [8, 10], [11, 12], [12, 13], [12, 14]
    ];

    // --- STAGE 2 & 3 DATA: The Final Lush Tree ---
    // Paths to morph the initial lines into
    const morphTargets = [
        "M100,190 C98,170 102,160 100,150", "M100,150 C100,130 98,120 100,110",
        "M100,110 C85,100 75,90 70,80", "M100,110 C115,100 125,90 130,80",
        "M100,110 C100,95 100,80 100,70", "M70,80 C60,70 55,60 50,50",
        "M50,50 C45,40 40,30 40,20", "M50,50 C55,45 60,40 60,30",
        "M130,80 C140,70 145,60 150,50", "M150,50 C145,40 140,30 140,20",
        "M150,50 C155,45 160,40 160,30", "M100,70 C100,60 100,50 100,40",
        "M100,40 C95,30 90,20 90,10", "M100,40 C105,30 110,25 110,20"
    ];
    // New branches for the lush tree
    const newBranchPaths = [
        "M100,190 C90,160 80,140 70,120 C60,100 50,80 40,60",
        "M100,190 C110,160 120,140 130,120 C140,100 150,80 160,60",
        "M98,140 C80,130 70,110 60,90", "M102,140 C120,130 130,110 140,90",
        "M60,90 C50,70 45,50 40,30", "M140,90 C150,70 155,50 160,30"
    ];
    // Nodes for the final tree
    const finalNodes = Array.from({ length: 80 }, () => ({
        x: Math.random() * 180 + 10,
        y: Math.random() * 120 + 10, // Concentrated in the canopy
        r: Math.random() * 1.5 + 0.5
    }));

    // --- ANIMATION EXECUTION ---

    // STAGE 1: Draw the geometric tree
    const initialPaths = [];
    phase1_connections.forEach((conn, i) => {
        const p1 = phase1_points[conn[0]];
        const p2 = phase1_points[conn[1]];
        const path = document.createElementNS(namespace, 'path');
        const lineD = `M${p1.x},${p1.y} L${p2.x},${p2.y}`;
        path.setAttribute('d', lineD);
        path.setAttribute('class', 'line');
        const length = path.getTotalLength();
        path.style.strokeDasharray = length;
        path.style.strokeDashoffset = length;
        svg.appendChild(path);
        initialPaths.push(path);
        tl.to(path, { strokeDashoffset: 0, duration: 0.2, ease: "linear" }, i * 0.1);
    });

    phase1_points.forEach((p, i) => {
        const dot = document.createElementNS(namespace, 'circle');
        dot.setAttribute('id', `p1-dot-${i}`);
        dot.setAttribute('cx', p.x);
        dot.setAttribute('cy', p.y);
        dot.setAttribute('r', 2.5);
        dot.setAttribute('class', 'dot');
        svg.appendChild(dot);
        tl.from(dot, { opacity: 0, scale: 0, duration: 0.3 }, i * 0.1);
    });

    // STAGE 2: Morph into main branches
    tl.add("morph", "+=0.8");
    tl.to("[id^=p1-dot-]", { opacity: 0, duration: 0.5 }, "morph");
    initialPaths.forEach((path, i) => {
        tl.to(path, { attr: { d: morphTargets[i] }, duration: 1.5, ease: "power2.inOut" }, "morph");
    });

    // STAGE 3: Grow new branches and nodes
    newBranchPaths.forEach((pathD, i) => {
        const path = document.createElementNS(namespace, 'path');
        path.setAttribute('d', pathD);
        path.setAttribute('class', 'line');
        const length = path.getTotalLength();
        path.style.strokeDasharray = length;
        path.style.strokeDashoffset = length;
        svg.appendChild(path);
        tl.to(path, { strokeDashoffset: 0, duration: 1.0, ease: "power1.out" }, "morph+=0.5");
    });

    finalNodes.forEach((p, i) => {
        const dot = document.createElementNS(namespace, 'circle');
        dot.setAttribute('cx', p.x);
        dot.setAttribute('cy', p.y);
        dot.setAttribute('r', p.r);
        dot.setAttribute('class', 'dot');
        svg.appendChild(dot);
        tl.from(dot, { opacity: 0, scale: 0, duration: 0.4, ease: "power2.out" }, "morph+=1.0");
    });

    // Animate decorative line
    tl.to(".decorative-line", { scaleX: 1, duration: 1.0, ease: "power2.out" }, "morph+=0.8");

    // Add a call to redirect at the very end of the timeline
    tl.call(() => {
        setTimeout(() => {
            window.location.href = 'index.html';
        }, 1000); // Wait 1 second after animation completes
    }, null, "+=0.5"); // Start this call 0.5s after the last animation begins
});