        const canvas = document.getElementById('simCanvas');
        const ctx = canvas.getContext('2d');
        const container = document.getElementById('canvas-container');

        // UI Controls & References
        const btnStart = document.getElementById('btn-start');
        const btnReset = document.getElementById('btn-reset');
        const btnOsMode = document.getElementById('btn-os-mode');
        const selRoute = document.getElementById('sel-route');
        const selObstacle = document.getElementById('sel-obstacle');
        const chkDir = document.getElementById('chk-dir');

        const btnToggleP1 = document.getElementById('btn-toggle-p1');
        const btnToggleP2 = document.getElementById('btn-toggle-p2');
        const btnToggleP3 = document.getElementById('btn-toggle-p3');

        const txtP1Status = document.getElementById('txt-p1-status');
        const txtP2Status = document.getElementById('txt-p2-status');
        const txtP3Status = document.getElementById('txt-p3-status');

        // Modern DMI Elements
        const dmiSpeed = document.getElementById('dmi-speed');
        const dmiTargetSpeed = document.getElementById('dmi-target-speed');
        const dmiMa = document.getElementById('dmi-ma');
        const dmiMaTarget = document.getElementById('dmi-ma-target');
        const dmiMaBar = document.getElementById('dmi-ma-bar');
        const dmiRouteName = document.getElementById('dmi-route-name');
        const dmiTin = document.getElementById('dmi-tin');
        const dmiTag = document.getElementById('dmi-tag');
        const dmiAbsLoc = document.getElementById('dmi-abs-loc');
        const dmiPointsStatus = document.getElementById('dmi-points-status');
        const dmiActiveSig = document.getElementById('dmi-active-sig');
        const dmiModeBadge = document.getElementById('dmi-mode-badge');
        const dmiDir = document.getElementById('dmi-dir');

        // RDSO Modal Elements
        const rdsoRegE = document.getElementById('rdso-reg-e');
        const rdsoRegF = document.getElementById('rdso-reg-f');
        const rdsoRegG = document.getElementById('rdso-reg-g');
        const rdsoRegH = document.getElementById('rdso-reg-h');
        const rdsoRegI = document.getElementById('rdso-reg-i');
        const rdsoRegL = document.getElementById('rdso-reg-l');

        const dmiCanvas = document.getElementById('dmiCanvas');
        const dmiCtx = dmiCanvas ? dmiCanvas.getContext('2d') : null;

        const tocRow0 = document.getElementById('toc-row-0');
        const tocRow1 = document.getElementById('toc-row-1');
        const tocRow2 = document.getElementById('toc-row-2');
        const tocRow3 = document.getElementById('toc-row-3');

        const tocS1dAspect = document.getElementById('toc-s1d-aspect');
        const tocS1Aspect = document.getElementById('toc-s1-aspect');
        const tocS1LoopAspect = document.getElementById('toc-s1-loop-aspect');
        const tocS3Aspect = document.getElementById('toc-s3-aspect');

        // Interlocking Points State
        let points = {
            P1: "NORMAL",
            P2: "NORMAL",
            P3: "NORMAL",
            P4: "NORMAL"
        };

        // Manual Signal State
        let signalState = {
            "S1D": "GREEN",
            "S1": "GREEN",
            "S5": "GREEN",
            "S3": "GREEN",
            "S6": "GREEN"
        };
        let actualSignalState = { ...signalState };

        // Simulation Loop State
        let isRunning = false;
        let animationId;
        let isOsModeActive = false;
        let isLightMode = false;
        let isTripped = false;
        let tagScanPulse = 0;

        // Track Circuits (TINs)
        const tins = [
            { id: "N-60", name: "DN Appr Blk", line: "DN_MAIN", xStart: 0.0, xEnd: 0.15, occupied: false },
            { id: "N-62", name: "DN Distant", line: "DN_MAIN", xStart: 0.15, xEnd: 0.30, occupied: false },
            { id: "N-64", name: "DN Main Home", line: "DN_MAIN", xStart: 0.30, xEnd: 0.60, occupied: false },
            { id: "N-65", name: "DN Loop Line", line: "DN_LOOP", xStart: 0.37, xEnd: 0.60, occupied: false },
            { id: "N-66", name: "DN Main Overlap", line: "DN_MAIN", xStart: 0.60, xEnd: 0.85, occupied: false },
            { id: "N-67", name: "DN Loop Overlap", line: "DN_LOOP", xStart: 0.60, xEnd: 0.80, occupied: false },
            { id: "N-90", name: "DN Adv Block", line: "DN_MAIN", xStart: 0.85, xEnd: 1.0, occupied: false }
        ];

        // RFID Tags proportionally spaced with non-overlapping X-positions
        const rfidTags = [
            { id: "G-1", pos: 0.10, line: "DN_MAIN", label: "Gate Tag LC-1", dist: 0, absLocKm: 124.400 },
            { id: "S-666", pos: 0.16, line: "DN_MAIN", label: "Foot Tag S1D", dist: 50, absLocKm: 124.640 },
            { id: "N-668", pos: 0.23, line: "DN_MAIN", label: "Approach Tag", dist: 350, absLocKm: 124.920 },
            { id: "S-514", pos: 0.31, line: "DN_MAIN", label: "Foot Tag S1", dist: 800, absLocKm: 125.240 },
            { id: "T-518", pos: 0.335, line: "P1_TURN", label: "Turnout Tag P1", dist: 1100, absLocKm: 125.340 },
            { id: "T-530", pos: 0.335, line: "P4_TURN", label: "Turnout Tag P4", dist: 1100, absLocKm: 125.340 },
            { id: "S-525", pos: 0.61, line: "DN_LOOP", label: "Foot Tag S5", dist: 1800, absLocKm: 126.440 },
            { id: "S-524", pos: 0.61, line: "DN_MAIN", label: "Foot Tag S3", dist: 1800, absLocKm: 126.440 },
            { id: "T-522", pos: 0.665, line: "P2_TURN", label: "Turnout Tag P2", dist: 1850, absLocKm: 126.660 },
            { id: "T-540", pos: 0.665, line: "P3_TURN", label: "Turnout Tag P3", dist: 1850, absLocKm: 126.660 },
            { id: "S-528", pos: 0.86, line: "DN_MAIN", label: "Foot Tag S6", dist: 2400, absLocKm: 127.440 },
            { id: "G-2", pos: 0.92, line: "DN_MAIN", label: "Gate Tag LC-2", dist: 2600, absLocKm: 127.680 }
        ];

        // KAVACH Train Object
        const train = {
            x: 0.02, 
            length: 0.06,
            speedKm: 0,
            maxSpeedKm: 130,
            targetSpeedKm: 130,
            accel: 0.18,
            decel: 0.5,
            route: "DN_MAIN",
            isUpDirection: false,
            lastScannedTag: { id: "--", pos: 0.0, absLocKm: 124.000 },
            currentTin: tins[0],
            mode: "FS",
            movementAuthorityMeters: 3200,
            whistleTimer: 0,
            targetStopX: 1.0
        };

        // Obstacle Object
        const obstacle = {
            pos: 1.5,
            line: "DN_MAIN",
            length: 0.05
        };

        function resize() {
            const rect = container.getBoundingClientRect();
            const dpr = window.devicePixelRatio || 1;
            canvas.width = rect.width * dpr;
            canvas.height = rect.height * dpr;
            ctx.scale(dpr, dpr);
            draw();
        }

        window.addEventListener('resize', resize);

        selRoute.addEventListener('change', () => {
            const selectedRoute = selRoute.value;
            train.route = selectedRoute;

            if (selectedRoute === "DN_LOOP") { points.P1 = "REVERSE"; points.P2 = "REVERSE"; }
            else if (selectedRoute === "DN_MAIN") { points.P1 = "NORMAL"; points.P2 = "NORMAL"; }
            else if (selectedRoute === "UP_LOOP") { points.P3 = "REVERSE"; points.P4 = "REVERSE"; }
            else { points.P3 = "NORMAL"; points.P4 = "NORMAL"; }
            updatePointButtonsUI();
        });

        btnToggleP1.addEventListener('click', () => { points.P1 = points.P1 === "NORMAL" ? "REVERSE" : "NORMAL"; updatePointButtonsUI(); });
        btnToggleP2.addEventListener('click', () => { points.P2 = points.P2 === "NORMAL" ? "REVERSE" : "NORMAL"; updatePointButtonsUI(); });
        btnToggleP3.addEventListener('click', () => { points.P3 = points.P3 === "NORMAL" ? "REVERSE" : "NORMAL"; points.P4 = points.P3; updatePointButtonsUI(); });

        function updatePointButtonsUI() {
            txtP1Status.innerText = points.P1.substring(0,1);
            txtP1Status.className = points.P1 === "NORMAL" ? "font-bold text-emerald-400" : "font-bold text-amber-400";
            txtP2Status.innerText = points.P2.substring(0,1);
            txtP2Status.className = points.P2 === "NORMAL" ? "font-bold text-emerald-400" : "font-bold text-amber-400";
            txtP3Status.innerText = points.P3.substring(0,1);
            txtP3Status.className = points.P3 === "NORMAL" ? "font-bold text-emerald-400" : "font-bold text-amber-400";
        }

        function updateLogic() {
            if (isTripped) return;

            train.isUpDirection = chkDir.checked;
            train.route = selRoute.value;

            // 1. Evaluate Obstacle Position
            const obsMode = selObstacle.value;
            if (obsMode === 'block') { obstacle.pos = 0.90; obstacle.line = "DN_MAIN"; }
            else if (obsMode === 'dn_main_starter') { obstacle.pos = 0.55; obstacle.line = "DN_MAIN"; }
            else if (obsMode === 'dn_loop') { obstacle.pos = 0.55; obstacle.line = "DN_LOOP"; }
            else obstacle.pos = 1.5;

            // 2. TIN Track Circuit Occupancy (Separating Obstacle vs Train presence)
            const trainNose = train.x + train.length;
            const trainTail = train.x;

            tins.forEach(tin => {
                tin.occupiedByObstacle = false;
                tin.occupiedByTrain = false;
                if (obstacle.pos < 1.0 && obstacle.line === tin.line && (obstacle.pos + obstacle.length) > tin.xStart && obstacle.pos < tin.xEnd) {
                    tin.occupiedByObstacle = true;
                }
                if ((train.route === tin.line || (tin.line === "DN_MAIN" && train.x < 0.30)) && trainNose > tin.xStart && trainTail < tin.xEnd) {
                    tin.occupiedByTrain = true;
                }
                
                // Overlap Locking Logic (Logical only, not visual occupancy)
                tin.lockedAsOverlap = false;
                if (train.route === "DN_LOOP") {
                    if (points.P2 === "NORMAL" && tin.id === "N-67") tin.lockedAsOverlap = true;
                    if (points.P2 === "REVERSE" && tin.id === "N-66") tin.lockedAsOverlap = true;
                } else if (train.route === "DN_MAIN") {
                    if (tin.id === "N-66") tin.lockedAsOverlap = true;
                }
                
                tin.occupied = tin.occupiedByObstacle || tin.occupiedByTrain;
            });

            // Dynamic Train Physical Routing at P1 Turnout
            if (train.x >= 0.28 && train.x <= 0.30) {
                train.route = points.P1 === "REVERSE" ? "DN_LOOP" : "DN_MAIN";
                document.getElementById('sel-route').value = train.route;
            }


            // 3. Manual Signal State Override (with Cascade Enforcement)
            const aspectValue = (a) => {
                if (a === "GREEN") return 3;
                if (a === "DOUBLE YELLOW") return 2;
                if (a === "YELLOW") return 1;
                return 0; // RED
            };
            const aspectName = (v) => {
                if (v >= 3) return "GREEN";
                if (v === 2) return "DOUBLE YELLOW";
                if (v === 1) return "YELLOW";
                return "RED";
            };

            let s6AspectVal = aspectValue(signalState["S6"]);
            
            // Starters (S3, S5) lead to Adv Starter (S6)
            let s3Max = s6AspectVal + 1;
            let s5Max = (points.P2 === "REVERSE") ? (s6AspectVal + 1) : 0; // If buffer stop, strictly RED
            let s3AspectVal = Math.min(aspectValue(signalState["S3"]), s3Max);
            let s5AspectVal = Math.min(aspectValue(signalState["S5"]), s5Max);

            // Home (S1) leads to Starters (S3 or S5)
            let nextSigForS1 = (points.P1 === "REVERSE") ? s5AspectVal : s3AspectVal;
            let s1Max = nextSigForS1 + 1;
            // Route Indicator rule: If taking turnout (Loop), Home signal max is YELLOW
            if (points.P1 === "REVERSE") s1Max = Math.min(s1Max, 1);
            let s1AspectVal = Math.min(aspectValue(signalState["S1"]), s1Max);

            // Distant (S1D) leads to Home (S1)
            let s1dMax = s1AspectVal + 1;
            let s1dAspectVal = Math.min(aspectValue(signalState["S1D"]), s1dMax);

            actualSignalState["S1D"] = aspectName(s1dAspectVal);
            actualSignalState["S1"] = aspectName(s1AspectVal);
            actualSignalState["S5"] = aspectName(s5AspectVal);
            actualSignalState["S3"] = aspectName(s3AspectVal);
            actualSignalState["S6"] = aspectName(s6AspectVal);

            // 4. Onboard Tag Scanning & Active TIN
            tins.forEach(tin => {
                if (trainNose >= tin.xStart && trainNose < tin.xEnd) {
                    if (tin.line === train.route || tin.line === "DN_MAIN") train.currentTin = tin;
                }
            });

            rfidTags.forEach(tag => {
                const antennaPos = train.x + train.length * 0.8;
                if (Math.abs(antennaPos - tag.pos) < 0.015) {
                    if (train.lastScannedTag !== tag) {
                        train.lastScannedTag = tag;
                        tagScanPulse = 1.0; // Trigger visual pulse effect
                        if (tag.id.startsWith("G-")) {
                            train.whistleTimer = 200; // Whistle for 200 frames
                        }
                    }
                }
            });
            if (tagScanPulse > 0) tagScanPulse = Math.max(0, tagScanPulse - 0.05);
            if (train.whistleTimer > 0) train.whistleTimer--;

            // 5. KAVACH Permanent Speed Restriction (PSR) & MA Calculation
            let psrLimit = 130;
            if (train.route === "DN_LOOP" || (train.x >= 0.35 && train.x <= 0.77 && points.P1 === "REVERSE")) {
                psrLimit = 30; // 30 km/h PSR on turnouts & loop line
            }

            if (isOsModeActive) {
                train.mode = "OS";
                train.targetSpeedKm = 15;
                train.movementAuthorityMeters = 300;
                train.targetStopX = train.x + (300 / 4000);
            } else {
                train.mode = "FS";
                let stopX = 1.0;
                let maTargetName = "Line Clear";

                // Evaluate signals ahead of the train to determine MA
                if (trainNose <= 0.15) {
                    if (actualSignalState["S1D"] === "RED") { stopX = 0.15; maTargetName = "Signal S1D"; }
                    else if (actualSignalState["S1D"] === "YELLOW") { stopX = 0.30; maTargetName = "Signal S1 (Home)"; }
                    else if (actualSignalState["S1D"] === "DOUBLE YELLOW") { stopX = 0.60; maTargetName = "Signal S3/S5 (Starter)"; }
                }
                if (stopX === 1.0 && trainNose <= 0.30) {
                    if (actualSignalState["S1"] === "RED") { stopX = 0.30; maTargetName = "Signal S1 (Home)"; }
                    else if (actualSignalState["S1"] === "YELLOW") { stopX = 0.60; maTargetName = "Signal S3/S5 (Starter)"; }
                }
                if (stopX === 1.0 && trainNose <= 0.60) {
                    if (train.route === "DN_MAIN" && actualSignalState["S3"] === "RED") { stopX = 0.60; maTargetName = "Signal S3 (Starter)"; }
                    else if (train.route === "DN_MAIN" && actualSignalState["S3"] === "YELLOW") { stopX = 0.85; maTargetName = "Signal S6 (Adv Starter)"; }
                    else if (train.route === "DN_LOOP" && actualSignalState["S5"] === "RED") { stopX = 0.60; maTargetName = "Signal S5 (Loop Starter)"; }
                    else if (train.route === "DN_LOOP" && actualSignalState["S5"] === "YELLOW") { stopX = 0.85; maTargetName = "Signal S6 (Adv Starter)"; }
                }
                if (stopX === 1.0 && trainNose <= 0.85) {
                    if (actualSignalState["S6"] === "RED") { stopX = 0.85; maTargetName = "Signal S6 (Adv Starter)"; }
                    else if (actualSignalState["S6"] === "YELLOW") { stopX = 1.0; maTargetName = "Block Section"; }
                }

                // Obstacle Check
                if (obstacle.pos < 1.0 && obstacle.line === train.route && trainNose <= obstacle.pos && obstacle.pos < stopX) { 
                    stopX = obstacle.pos; 
                    maTargetName = "Obstacle Ahead"; 
                }

                // KAVACH Track End / Buffer Stop Protection (ATP Override)
                if (train.route === "DN_LOOP" && points.P2 === "NORMAL" && trainNose <= 0.80 && stopX > 0.80) {
                    stopX = 0.80;
                    maTargetName = "Buffer Stop (Track End)";
                }

                const distToStopNorm = Math.max(0, stopX - trainNose);
                train.movementAuthorityMeters = Math.round(distToStopNorm * 4000);
                train.targetStopX = stopX;

                // KAVACH Braking Curve
                // Increased to 0.20 (800 meters) so it starts slowing down earlier (e.g., as soon as it passes S1D)
                const brakingDistNorm = 0.20; 

                // If approaching a YELLOW signal (meaning MA ends at the *next* signal), 
                // we should also limit the speed at the YELLOW signal itself to simulate Caution.
                let effectivePsr = psrLimit;
                
                // If the signal *immediately* ahead is YELLOW, cap speed to 60 km/h (Caution approach)
                if (stopX === 0.30 && actualSignalState["S1D"] === "YELLOW" && trainNose <= 0.15) effectivePsr = Math.min(effectivePsr, 60);
                if (stopX === 0.60 && actualSignalState["S1"] === "YELLOW" && trainNose > 0.15 && trainNose <= 0.30) effectivePsr = Math.min(effectivePsr, 60);
                if (stopX === 0.85 && (actualSignalState["S3"] === "YELLOW" || actualSignalState["S5"] === "YELLOW") && trainNose > 0.30 && trainNose <= 0.60) effectivePsr = Math.min(effectivePsr, 60);

                if (distToStopNorm < brakingDistNorm) {
                    const factor = distToStopNorm / brakingDistNorm;
                    train.targetSpeedKm = Math.min(effectivePsr, Math.max(0, Math.round(effectivePsr * factor)));
                } else {
                    train.targetSpeedKm = effectivePsr;
                }

                if (train.speedKm > train.targetSpeedKm + 2) {
                    train.speedKm = Math.max(0, train.speedKm - (train.decel * 1.6));
                }
            }

            // Move Train
            if (isRunning) {
                if (train.speedKm < train.targetSpeedKm) train.speedKm = Math.min(train.targetSpeedKm, train.speedKm + train.accel);
                else if (train.speedKm > train.targetSpeedKm) train.speedKm = Math.max(train.targetSpeedKm, train.speedKm - train.decel);

                const dirMultiplier = train.isUpDirection ? -1 : 1;
                train.x += dirMultiplier * (train.speedKm / 130) * 0.0010;
            } else {
                train.speedKm = Math.max(0, train.speedKm - train.decel);
            }

            // 6. SPAD & Collision Trip Checks
            let tripReason = null;
            if (!isOsModeActive) {
                if (actualSignalState["S1"] === "RED" && trainNose > 0.30 && trainNose < 0.33) tripReason = "SPAD at Signal S1 (Home)!";
                else if (train.route === "DN_MAIN" && actualSignalState["S3"] === "RED" && trainNose > 0.60 && trainNose < 0.63) tripReason = "SPAD at Signal S3 (Starter)!";
                else if (train.route === "DN_LOOP" && actualSignalState["S5"] === "RED" && trainNose > 0.60 && trainNose < 0.63) tripReason = "SPAD at Signal S5 (Loop Starter)!";
                else if (actualSignalState["S6"] === "RED" && trainNose > 0.85 && trainNose < 0.88) tripReason = "SPAD at Signal S6 (Adv Starter)!";
            }
            if (obstacle.pos < 1.0 && obstacle.line === train.route && trainNose >= obstacle.pos && trainTail <= obstacle.pos + obstacle.length) {
                tripReason = "COLLISION DETECTED!";
            }

            if (tripReason) {
                isTripped = true;
                isRunning = false;
                train.speedKm = 0;
                train.mode = "TRIP";
                train.targetSpeedKm = 0;
                btnStart.innerHTML = `<svg class="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20"><path d="M4 4l12 6-12 6V4z"/></svg><span>System Tripped</span>`;
                btnStart.className = "px-4 py-2 bg-red-700 text-white rounded-lg font-bold text-xs shadow-lg flex items-center gap-2 cursor-not-allowed opacity-80";
            }

            if (train.x > 1.08) train.x = -0.08;
            if (train.x < -0.08) train.x = 1.08;

            updateUI(actualSignalState["S1D"], actualSignalState["S1"], actualSignalState["S5"], actualSignalState["S3"]);
        }

        function updateUI(s1dAspect, s1Aspect, s5LoopAspect, s3Aspect) {
            // Calculate Absolute Location
            const antennaPos = train.x + train.length * 0.8;
            const distanceSinceLastTagKm = (antennaPos - train.lastScannedTag.pos) * 4.0;
            const absoluteLocationKm = train.lastScannedTag.absLocKm + distanceSinceLastTagKm;

            // --- 1. Update Modern DMI ---
            if (dmiSpeed) dmiSpeed.innerText = String(Math.round(train.speedKm)).padStart(2, '0');
            if (dmiTargetSpeed) dmiTargetSpeed.innerText = train.targetSpeedKm;
            if (dmiMa) dmiMa.innerText = train.movementAuthorityMeters + " m";
            
            if (dmiMaBar) {
                const maPercent = Math.min(100, (train.movementAuthorityMeters / 4000) * 100);
                dmiMaBar.style.width = maPercent + "%";
                dmiMaBar.className = maPercent < 20 ? "bg-red-500 h-full transition-all duration-300 w-full" : (maPercent < 50 ? "bg-amber-500 h-full transition-all duration-300 w-full" : "bg-emerald-500 h-full transition-all duration-300 w-full");
            }

            if (dmiRouteName) dmiRouteName.innerText = train.route.replace('_', ' ');
            if (dmiTin) dmiTin.innerText = train.currentTin ? train.currentTin.id : "N/A";
            if (dmiTag) dmiTag.innerText = train.lastScannedTag.id;
            if (dmiAbsLoc) dmiAbsLoc.innerText = absoluteLocationKm.toFixed(3) + " km";
            if (dmiPointsStatus) dmiPointsStatus.innerText = `P1:${points.P1.substring(0,1)}, P2:${points.P2.substring(0,1)}`;

            let activeSigStr = "S1D (" + s1dAspect + ")";
            if (train.x >= 0.15 && train.x < 0.35) activeSigStr = "S1 (" + s1Aspect + ")";
            else if (train.x >= 0.35 && train.x < 0.70) activeSigStr = train.route === "DN_LOOP" ? "S5 (" + s5LoopAspect + ")" : "S3 (" + s3Aspect + ")";
            if (dmiActiveSig) dmiActiveSig.innerText = activeSigStr;

            if (dmiModeBadge) {
                if (train.mode === "TRIP") {
                    dmiModeBadge.innerText = "TRIP (SPAD/COLLISION)";
                    dmiModeBadge.className = "px-2.5 py-1 rounded text-xs font-black bg-red-600 text-white animate-pulse border border-red-400 text-center w-full block font-digital";
                } else if (train.mode === "OS") {
                    dmiModeBadge.innerText = "ON-SIGHT (OS)";
                    dmiModeBadge.className = "px-2.5 py-1 rounded text-xs font-black bg-amber-500/20 text-amber-400 border border-amber-500/40 text-center w-full block font-digital";
                } else {
                    dmiModeBadge.innerText = train.route === "DN_LOOP" ? "FULL SUPERVISION (30 PSR)" : "FULL SUPERVISION (FS)";
                    dmiModeBadge.className = train.route === "DN_LOOP" 
                        ? "px-2.5 py-1 rounded text-xs font-black bg-amber-500/20 text-amber-300 border border-amber-500/40 text-center w-full block font-digital"
                        : "px-2.5 py-1 rounded text-xs font-black bg-blue-500/20 text-blue-400 border border-blue-500/40 text-center w-full block font-digital";
                }
            }

            if (dmiDir) dmiDir.innerText = train.isUpDirection ? "UP (Right -> Left)" : "DN (Left -> Right)";


            // --- 2. Update Authentic RDSO DMI Modal ---
            if (dmiCtx && rdsoRegE) {
                rdsoRegE.innerText = "DC 0.00";
                rdsoRegF.innerText = "TL 000 m"; 

                if (train.mode === "TRIP") rdsoRegG.innerText = "Trip Mode";
                else if (train.mode === "OS") rdsoRegG.innerText = "On Sight Mode";
                else rdsoRegG.innerText = "Full Supervision Mode";

                if (train.mode === "TRIP") {
                    rdsoRegH.innerText = "Train Tripped, Select P_Trip";
                    rdsoRegH.style.color = "white";
                } else if (train.route === "DN_LOOP") {
                    rdsoRegH.innerText = "TurnOut in 0000m with Speed Limit 30kmph";
                    rdsoRegH.style.color = "white";
                } else {
                    rdsoRegH.innerText = "System Self Test Success";
                    rdsoRegH.style.color = "white";
                }

                rdsoRegI.innerText = train.mode === "TRIP" ? "Brake Applied-SPAD detected" : "";
                rdsoRegL.innerHTML = `<div>Tid-${train.lastScannedTag.id.replace('T-', '').replace('R-', '')}, Dir-${train.isUpDirection ? 'R' : 'N'}</div><div>T Dist-000</div>`;

                drawDMI(s1dAspect, s1Aspect, s5LoopAspect, s3Aspect);
            }

            const styleAspect = (elem, aspect) => {
                elem.innerText = aspect;
                elem.className = aspect === "GREEN" ? "text-emerald-400 font-bold" : 
                                 (aspect === "RED" ? "text-red-400 font-bold" : 
                                 (aspect === "DOUBLE YELLOW" ? "text-amber-300 font-bold" : "text-amber-500 font-bold"));
            };

            styleAspect(tocS1dAspect, s1dAspect);
            styleAspect(tocS1Aspect, s1Aspect);
            styleAspect(tocS1LoopAspect, s1Aspect === "RED" ? "RED" : "YELLOW");
            styleAspect(tocS3Aspect, s3Aspect);

            [tocRow0, tocRow1, tocRow2, tocRow3].forEach(row => row.className = "opacity-60");
            if (train.x < 0.35) tocRow0.className = "toc-highlight";
            else if (train.route === "DN_MAIN" && train.x < 0.70) tocRow1.className = "toc-highlight";
            else if (train.route === "DN_LOOP" && train.x < 0.70) tocRow2.className = "toc-highlight";
            else tocRow3.className = "toc-highlight";
        }

        function drawDMI(s1dAspect, s1Aspect, s5LoopAspect, s3Aspect) {
            dmiCtx.clearRect(0, 0, 800, 600);

            // REGION B: Speedometer (365x388) at Center
            // Dial center around X=274 (92 + 182.5), Y=194
            const cx = 274;
            const cy = 194;
            
            dmiCtx.strokeStyle = "white";
            dmiCtx.lineWidth = 2;
            
            // Outer dial (diameter 314) -> Radius = 157
            dmiCtx.beginPath();
            dmiCtx.arc(cx, cy, 157, 0, Math.PI * 2);
            dmiCtx.stroke();
            
            // Current speed text (Region B1)
            dmiCtx.fillStyle = "white";
            dmiCtx.font = "bold 20px sans-serif";
            dmiCtx.textAlign = "center";
            dmiCtx.fillText(Math.round(train.speedKm), cx, cy + 8);

            // Draw a simple pointer
            dmiCtx.save();
            dmiCtx.translate(cx, cy);
            // Angle range: -149 to +149 degrees. 0 = -149, 250 = +149
            // Let's approximate: speed 0 -> -149 deg, speed 125 -> 0 deg, speed 250 -> +149 deg
            const speedRatio = Math.min(train.speedKm / 250, 1.0);
            const angleDeg = -149 + (speedRatio * 298);
            const angleRad = (angleDeg - 90) * (Math.PI / 180); // -90 because 0 deg is UP in spec
            dmiCtx.rotate(angleRad);
            dmiCtx.fillStyle = "white";
            dmiCtx.beginPath();
            dmiCtx.moveTo(-5, 0);
            dmiCtx.lineTo(5, 0);
            dmiCtx.lineTo(0, -145);
            dmiCtx.fill();
            dmiCtx.restore();

            // REGION C: Movement Authority (112x388) at X=457
            dmiCtx.fillStyle = "white";
            dmiCtx.font = "16px sans-serif";
            dmiCtx.textAlign = "left";
            dmiCtx.fillText("Mov. Authority", 464, 25);
            
            dmiCtx.fillStyle = "#008bce"; // Light Blue
            dmiCtx.fillRect(490, 50, 35, 300); // Simple bar for now

            dmiCtx.fillStyle = "white";
            dmiCtx.font = "bold 18px sans-serif";
            dmiCtx.fillText(String(Math.floor(train.movementAuthorityMeters)).padStart(5, '0') + "m", 477, 375);

            // REGION D: Signal Aspect (228x419) at X=569
            // Get Active Signal Aspect
            let activeSigStr = "S1D";
            let activeAspect = s1dAspect;
            if (train.x >= 0.15 && train.x < 0.35) { activeSigStr = "S1"; activeAspect = s1Aspect; }
            else if (train.x >= 0.35 && train.x < 0.70) {
                if (train.route === "DN_LOOP") { activeSigStr = "S5"; activeAspect = s5LoopAspect; }
                else { activeSigStr = "S3"; activeAspect = s3Aspect; }
            }

            dmiCtx.fillStyle = "white";
            dmiCtx.font = "bold 18px sans-serif";
            dmiCtx.fillText("Down Home", 650, 390); // Simple placeholder
            dmiCtx.fillText(String(Math.floor(train.movementAuthorityMeters)) + " m", 650, 370);

            // Draw 4 Aspect circles
            const sx = 680;
            const sy = 120;
            const aspectColors = ["#eab308", "#22c55e", "#eab308", "#ef4444"];
            for (let i = 0; i < 4; i++) {
                dmiCtx.strokeStyle = "white";
                dmiCtx.lineWidth = 2;
                dmiCtx.beginPath();
                dmiCtx.arc(sx, sy + (i * 40), 15, 0, Math.PI * 2);
                dmiCtx.stroke();
            }

            // Fill active aspect
            let fillIdx = 3; // RED default
            if (activeAspect === "GREEN") fillIdx = 1;
            if (activeAspect === "DOUBLE YELLOW") fillIdx = 0;
            if (activeAspect === "YELLOW") fillIdx = 2;
            
            dmiCtx.fillStyle = aspectColors[fillIdx];
            dmiCtx.beginPath();
            dmiCtx.arc(sx, sy + (fillIdx * 40), 13, 0, Math.PI * 2);
            dmiCtx.fill();

            // REGION J: RF Signal (133x67) at X=667, Y=0
            dmiCtx.fillStyle = "white";
            dmiCtx.font = "bold 18px sans-serif";
            dmiCtx.fillText("RF", 680, 30);
            for(let i=0; i<4; i++) {
                dmiCtx.fillRect(720 + i*12, 35 - i*8, 6, 10 + i*8); // Antenna bars
            }

            // REGION M: Tag Diagram (94x129) at X=706, Y=358
            dmiCtx.strokeStyle = "white";
            dmiCtx.lineWidth = 1;
            dmiCtx.strokeRect(706, 358, 94, 129);
            // Draw a track line and a tag block
            dmiCtx.beginPath(); dmiCtx.moveTo(753, 358); dmiCtx.lineTo(753, 487); dmiCtx.stroke();
            dmiCtx.fillStyle = "#22c55e"; // Green past tag
            dmiCtx.fillRect(740, 420, 26, 10);
        }

        function draw() {
            const containerRect = container.getBoundingClientRect();
            const w = containerRect.width;
            const h = containerRect.height;

            ctx.clearRect(0, 0, w, h);

            // 4 Main Corridors (DN/UP)
            const yDnLoop = 90;  // Line 1: Down Loop Line
            const yDnMain = 170; // Line 2: Down Main Line
            const yUpMain = 260; // Line 3: Up Main Line
            const yUpLoop = 350; // Line 4: Up Loop Line

            // Background & High-Contrast Vertical Grid Lines
            // CSS handles container background now, so we can make canvas transparent or match it
            ctx.fillStyle = isLightMode ? '#f1f5f9' : '#030712';
            ctx.fillRect(0, 0, w, h);

            ctx.strokeStyle = isLightMode ? '#cbd5e1' : '#0f172a'; ctx.lineWidth = 1;
            for (let x = 0; x < w; x += 35) {
                ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, h); ctx.stroke();
            }

            // Screenshot-Style High-Contrast Track Renderer with Per-TIN Occupancy
            const drawRichTrack = (yPos, trackLineId, xStartNorm = 0.0, xEndNorm = 1.0) => {
                const pxStart = xStartNorm * w;
                const pxEnd = xEndNorm * w;
                

                // 1. Draw Base Grey Track (Unoccupied)
                ctx.lineWidth = 10;
                ctx.strokeStyle = '#64748b'; 
                ctx.shadowBlur = 0;
                ctx.beginPath();
                ctx.moveTo(pxStart, yPos);
                ctx.lineTo(pxEnd, yPos);
                ctx.stroke();

                // Inner track highlight (Base)
                ctx.lineWidth = 2;
                ctx.strokeStyle = '#94a3b8';
                ctx.beginPath();
                ctx.moveTo(pxStart, yPos);
                ctx.lineTo(pxEnd, yPos);
                ctx.stroke();

                // 2. Overlay Occupied TIN Segments
                const lineTins = tins.filter(t => t.line === trackLineId);
                lineTins.forEach(tin => {
                    if (tin.occupied) {
                        // Clamp TIN coordinates to track boundaries
                        const tStart = Math.max(xStartNorm, tin.xStart) * w;
                        const tEnd = Math.min(xEndNorm, tin.xEnd) * w;
                        
                        if (tEnd > tStart) {
                            ctx.lineWidth = 10;
                            ctx.strokeStyle = '#ef4444'; 
                            ctx.shadowColor = '#ef4444';
                            ctx.shadowBlur = 10;
                            ctx.beginPath();
                            ctx.moveTo(tStart, yPos);
                            ctx.lineTo(tEnd, yPos);
                            ctx.stroke();
                            
                            ctx.shadowBlur = 0;
                            ctx.lineWidth = 2;
                            ctx.strokeStyle = '#fca5a5';
                            ctx.beginPath();
                            ctx.moveTo(tStart, yPos);
                            ctx.lineTo(tEnd, yPos);
                            ctx.stroke();
                        }
                    }
                });
            };

            // Friction Buffer Stop / End Gate Renderer
            const drawBufferStop = (xNorm, yPos) => {
                const bX = xNorm * w;
                ctx.fillStyle = '#dc2626'; ctx.fillRect(bX - 3, yPos - 12, 6, 24);
                ctx.fillStyle = '#ffffff'; ctx.fillRect(bX - 4, yPos - 9, 8, 18);
                ctx.fillStyle = '#dc2626';
                ctx.fillRect(bX - 3, yPos - 8, 6, 4);
                ctx.fillRect(bX - 3, yPos + 0, 6, 4);
                ctx.fillRect(bX - 3, yPos + 8, 6, 4);
                ctx.beginPath(); ctx.arc(bX, yPos - 14, 2.5, 0, Math.PI * 2);
                ctx.fillStyle = '#ef4444'; ctx.fill();
            };

            // Level Crossing (LC) Gates
            const drawLCGate = (xNorm, label) => {
                const lcX = xNorm * w;
                // Road (Grey strip)
                ctx.fillStyle = '#1e293b'; 
                ctx.fillRect(lcX - 15, yDnMain - 30, 30, yUpMain - yDnMain + 60);
                
                // Boom Barriers (Yellow/Black striped)
                const boomWidth = 26;
                const drawBoom = (yPos) => {
                    ctx.fillStyle = '#eab308'; 
                    ctx.fillRect(lcX - 13, yPos, boomWidth, 3);
                    ctx.fillStyle = '#000000';
                    for (let i = 0; i < boomWidth; i += 4) ctx.fillRect(lcX - 13 + i, yPos, 2, 3);
                    ctx.fillStyle = '#64748b';
                    ctx.fillRect(lcX - 15, yPos - 2, 4, 7);
                };
                drawBoom(yDnMain - 20); 
                drawBoom(yUpMain + 17); 
                
                // Label
                ctx.fillStyle = '#f8fafc';
                ctx.font = 'bold 8px monospace';
                ctx.textAlign = 'center';
                ctx.fillText(label, lcX, yUpMain + 35);
            };
            drawLCGate(0.10, "LC-1", yDnMain, yUpMain);
            drawLCGate(0.92, "LC-2", yDnMain, yUpMain);

            // Draw Tracks (Per TIN Occupancy)
            drawRichTrack(yDnLoop, "DN_LOOP", 0.20, 0.80);
            drawRichTrack(yDnMain, "DN_MAIN", 0.0, 1.0);
            drawRichTrack(yUpMain, "UP_MAIN", 0.0, 1.0);
            drawRichTrack(yUpLoop, "UP_LOOP", 0.20, 0.80);
            
            // Track Numbers
            ctx.fillStyle = '#cbd5e1';
            ctx.font = 'bold 10px monospace';
            ctx.textAlign = 'left';
            ctx.fillText("Line 4 (DN Loop)", 10, yDnLoop - 8);
            ctx.fillText("Line 3 (DN Main)", 10, yDnMain - 8);
            ctx.fillText("Line 2 (UP Main)", 10, yUpMain - 8);
            ctx.fillText("Line 1 (UP Loop)", 10, yUpLoop - 8);

            // Station Buildings
            const drawStation = (xNorm, yPos, label) => {
                const sX = xNorm * w;
                ctx.fillStyle = '#334155'; ctx.fillRect(sX - 40, yPos - 12, 80, 24);
                ctx.fillStyle = '#94a3b8';
                ctx.beginPath(); ctx.moveTo(sX - 45, yPos - 12); ctx.lineTo(sX + 45, yPos - 12);
                ctx.lineTo(sX + 40, yPos - 18); ctx.lineTo(sX - 40, yPos - 18); ctx.fill();
                ctx.fillStyle = '#0f172a';
                ctx.fillRect(sX - 10, yPos - 2, 20, 14); // Door
                ctx.fillRect(sX - 30, yPos - 6, 12, 10); // Window 1
                ctx.fillRect(sX + 18, yPos - 6, 12, 10); // Window 2
                ctx.fillStyle = '#ffffff'; ctx.fillRect(sX - 25, yPos - 32, 50, 12);
                ctx.fillStyle = '#0f172a'; ctx.font = 'bold 9px sans-serif';
                ctx.textAlign = 'center'; ctx.fillText(label, sX, yPos - 23);
            };
            drawStation(0.50, yDnLoop - 50, "DN STATION");
            drawStation(0.50, yUpLoop + 50, "UP STATION");


            drawBufferStop(0.20, yDnLoop);
            drawBufferStop(0.80, yDnLoop);
            drawBufferStop(0.20, yUpLoop);
            drawBufferStop(0.80, yUpLoop);

            // Insulated Joint Markers (Orange Vertical Bars)
            const drawInsulatedJoint = (xNorm, yPos) => {
                const jX = xNorm * w;
                ctx.fillStyle = '#f97316';
                ctx.fillRect(jX - 2, yPos - 12, 4, 24);
            };

            drawInsulatedJoint(0.15, yDnMain);
            drawInsulatedJoint(0.30, yDnMain);
            drawInsulatedJoint(0.60, yDnMain);
            drawInsulatedJoint(0.60, yDnLoop);
            drawInsulatedJoint(0.85, yDnMain);

            // TIN Block Labels (Exact Screenshot Design: Placed DIRECTLY BELOW the track line)
            const drawTinLabel = (xNorm, yPos, tinId, nameStr) => {
                const tX = xNorm * w;
                ctx.fillStyle = '#ffffff';
                ctx.font = 'bold 11px monospace';
                ctx.textAlign = 'center';
                ctx.fillText(tinId, tX, yPos + 22);

                ctx.fillStyle = '#94a3b8';
                ctx.font = '9px monospace';
                ctx.fillText(nameStr, tX, yPos + 32);
            };

            drawTinLabel(0.08, yDnMain, "N-60", "Blk 0 (Appr)");
            drawTinLabel(0.22, yDnMain, "N-62", "Blk 1 (Distant)");
            drawTinLabel(0.45, yDnMain, "N-64", "Blk 2 (Route)");
            drawTinLabel(0.45, yDnLoop, "N-65", "DN Loop Line");
            drawTinLabel(0.75, yDnMain, "N-66", "Blk 3");
            drawTinLabel(0.75, yDnLoop, "N-67", "Loop");
            drawTinLabel(0.92, yDnMain, "N-90", "Blk 4 (Block)");

            // Real Curved Track Turnout Renderer
            const drawRichTurnout = (x1Norm, y1, x2Norm, y2, pointState, label) => {
                const px1 = x1Norm * w;
                const px2 = x2Norm * w;
                const isReverse = pointState === "REVERSE";

                const cpX = px1 + (px2 - px1) * 0.5;

                // Thick solid turnout line
                ctx.lineWidth = 10;
                ctx.strokeStyle = isReverse ? '#eab308' : '#334155';
                if (isReverse) { ctx.shadowColor = '#eab308'; ctx.shadowBlur = 8; }
                
                ctx.beginPath(); 
                ctx.moveTo(px1, y1);
                ctx.bezierCurveTo(cpX, y1, cpX, y2, px2, y2);
                ctx.stroke();
                ctx.shadowBlur = 0;
                
                // Inner highlight
                ctx.lineWidth = 2;
                ctx.strokeStyle = isReverse ? '#fef08a' : '#475569';
                ctx.beginPath();
                ctx.moveTo(px1, y1);
                ctx.bezierCurveTo(cpX, y1, cpX, y2, px2, y2);
                ctx.stroke();

                // Realistic Point Machine Box at the toe (px1)
                const pmY = y2 > y1 ? y1 - 18 : y1 + 10;
                
                // Siemens Style Blue Box
                ctx.fillStyle = '#1e3a8a';
                ctx.fillRect(px1 + 10, pmY, 20, 8);
                ctx.fillStyle = '#0f172a';
                ctx.fillRect(px1 + 12, pmY - 2, 16, 12);
                ctx.strokeStyle = '#475569';
                ctx.strokeRect(px1 + 12, pmY - 2, 16, 12);
                
                // Connecting Rods
                ctx.strokeStyle = '#94a3b8'; ctx.lineWidth = 1.5;
                ctx.beginPath();
                ctx.moveTo(px1 + 20, y2 > y1 ? pmY + 8 : pmY);
                ctx.lineTo(px1 + 20, y1);
                ctx.stroke();

                // Status Indicator
                ctx.fillStyle = isReverse ? '#eab308' : '#10b981';
                ctx.fillRect(px1 + 14, pmY + 2, 12, 4);

                ctx.fillStyle = '#ffffff';
                ctx.font = 'bold 8px monospace'; ctx.textAlign = 'center';
                ctx.fillText(`${label}:${pointState.substring(0,1)}`, px1 + 20, y2 > y1 ? pmY - 5 : pmY + 18);
            };

            drawRichTurnout(0.30, yDnMain, 0.37, yDnLoop, points.P1, "P1");
            drawRichTurnout(0.63, yDnLoop, 0.70, yDnMain, points.P2, "P2");
            drawRichTurnout(0.70, yUpMain, 0.63, yUpLoop, points.P3, "P3");
            drawRichTurnout(0.37, yUpLoop, 0.30, yUpMain, points.P4, "P4");

            // RFID Tags (Exact Screenshot Design: Yellow Box on Rail, Tag ID Directly Above)
            rfidTags.forEach(tag => {
                const tagX = tag.pos * w;
                let tagY = yDnMain;
                if (tag.line === "DN_LOOP") tagY = yDnLoop;
                else if (tag.line === "UP_MAIN") tagY = yUpMain;
                else if (tag.line === "UP_LOOP") tagY = yUpLoop;
                else if (tag.line === "P1_TURN") tagY = yDnMain + 0.5 * (yDnLoop - yDnMain);
                else if (tag.line === "P2_TURN") tagY = yDnLoop + 0.5 * (yDnMain - yDnLoop);
                else if (tag.line === "P3_TURN") tagY = yUpMain + 0.5 * (yUpLoop - yUpMain);
                else if (tag.line === "P4_TURN") tagY = yUpLoop + 0.5 * (yUpMain - yUpLoop);
                const isScanned = train.lastScannedTag && train.lastScannedTag.id === tag.id && tagScanPulse > 0;

                // Yellow RFID Transponder Block on Track Rail
                ctx.fillStyle = isScanned ? '#00f0ff' : '#eab308';
                ctx.fillRect(tagX - 4, tagY - 2, 8, 4);

                // Tag ID Label directly below the track to avoid signal poles
                // For turnout tags, shift them further down to avoid the diagonal track line
                let labelY = tagY + 12;
                if (tag.line.includes("TURN")) labelY = tagY + 20;

                ctx.fillStyle = isScanned ? '#00f0ff' : '#fef08a';
                ctx.font = 'bold 9px monospace';
                ctx.textAlign = 'center';
                ctx.fillText(tag.id, tagX, labelY);
            });

            // Signals (Exact Screenshot Design: Sleek Box, Glowing Aspect LEDs, Title Directly Above)
            const drawRichSignal = (xPos, yPos, label, aspect, hasJunctionIndicator, isJunctionOn, hasCallingOn, isCallingOn) => {
                const sigX = xPos * w;
                const postH = 32;

                // Signal Pole
                ctx.fillStyle = '#475569'; ctx.fillRect(sigX - 1.5, yPos - postH, 3, postH);
                ctx.fillStyle = '#0f172a'; ctx.fillRect(sigX - 7, yPos - postH - 28, 14, 28);
                ctx.strokeStyle = '#64748b'; ctx.lineWidth = 1; ctx.strokeRect(sigX - 7, yPos - postH - 28, 14, 28);

                const isGreen = aspect === "GREEN";
                const isYellow = aspect === "YELLOW";
                const isDoubleYellow = aspect === "DOUBLE YELLOW";
                const isRed = aspect === "RED";

                const drawLight = (yOff, color, isOn) => {
                    ctx.beginPath();
                    ctx.arc(sigX, yPos - postH - yOff, 2.5, 0, Math.PI * 2);
                    ctx.fillStyle = isOn ? color : (isLightMode ? '#cbd5e1' : '#090d16');
                    if (isOn) { ctx.shadowColor = color; ctx.shadowBlur = 8; }
                    ctx.fill(); ctx.shadowBlur = 0;
                };

                drawLight(22, '#22c55e', isGreen);
                drawLight(15, '#eab308', (isYellow || isDoubleYellow));
                drawLight(8,  '#ef4444', isRed);
                drawLight(2,  '#eab308', isDoubleYellow);

                if (hasJunctionIndicator) {
                    // Realistic Route Indicator (Feathers)
                    // The loop track diverges to the right, so it should angle UP and RIGHT (positive rotation)
                    ctx.save();
                    ctx.translate(sigX, yPos - postH - 32);
                    ctx.rotate(Math.PI / 6); // Angled feathers pointing UP and RIGHT
                    ctx.fillStyle = '#0f172a';
                    ctx.fillRect(-2, -18, 5, 20);
                    ctx.strokeStyle = '#475569'; ctx.lineWidth = 0.5; ctx.strokeRect(-2, -18, 5, 20);

                    const routeLit = isJunctionOn && isYellow; // Route indicator lits only with yellow sign
                    for (let i = 0; i < 4; i++) {
                        ctx.beginPath();
                        ctx.arc(0.5, -15 + (i * 4.5), 1.2, 0, Math.PI * 2);
                        ctx.fillStyle = routeLit ? '#ffffff' : (isLightMode ? '#94a3b8' : '#334155');
                        if (routeLit) { ctx.shadowColor = (isLightMode ? '#334155' : '#ffffff'); ctx.shadowBlur = 6; }
                        ctx.fill(); ctx.shadowBlur = 0;
                    }
                    ctx.restore();
                }

                if (hasCallingOn) {
                    // Calling On Signal Head
                    ctx.fillStyle = '#0f172a';
                    ctx.fillRect(sigX - 4, yPos - postH + 4, 8, 14);
                    ctx.strokeStyle = '#64748b'; ctx.lineWidth = 1; ctx.strokeRect(sigX - 4, yPos - postH + 4, 8, 14);
                    
                    // Miniature C light
                    ctx.beginPath();
                    ctx.arc(sigX, yPos - postH + 14, 2, 0, Math.PI * 2);
                    const callLit = isCallingOn && isRed; // Calling on lits only with red sign
                    ctx.fillStyle = callLit ? '#fef08a' : (isLightMode ? '#cbd5e1' : '#090d16');
                    if (callLit) { ctx.shadowColor = '#fef08a'; ctx.shadowBlur = 6; }
                    ctx.fill(); ctx.shadowBlur = 0;

                    // Marker C
                    ctx.fillStyle = '#ffffff';
                    ctx.font = 'bold 5px sans-serif';
                    ctx.textAlign = 'center';
                    ctx.fillText('C', sigX, yPos - postH + 9);
                }

                // Signal Title Label to the LEFT of the Signal Head
                ctx.fillStyle = '#ffffff';
                ctx.font = 'bold 9px sans-serif';
                ctx.textAlign = 'right';
                ctx.fillText(label, sigX - 12, yPos - postH - 10);
            };

            const isRouteLoop = points.P1 === "REVERSE";
            const isS1CallingOn = signalState["S1"] === "CALLING_ON";

            drawRichSignal(0.15, yDnMain, "S1D (Distant)", actualSignalState["S1D"], false, false, false, false);
            drawRichSignal(0.30, yDnMain, "S1 (Home)", actualSignalState["S1"], true, isRouteLoop, true, isS1CallingOn);
            drawRichSignal(0.60, yDnLoop, "S5 (Loop Start)", actualSignalState["S5"], false, false, false, false);
            drawRichSignal(0.60, yDnMain, "S3 (Starter)", actualSignalState["S3"], false, false, false, false);
            drawRichSignal(0.85, yDnMain, "S6 (Adv Start)", actualSignalState["S6"], false, false, false, false);

            // Draw Obstacle Vehicle
            if (obstacle.pos < 1.0) {
                const obsX = obstacle.pos * w;
                const obsW = obstacle.length * w;
                const obsY = obstacle.line === "DN_LOOP" ? yDnLoop : (obstacle.line === "UP_MAIN" ? yUpMain : yDnMain);
                
                ctx.fillStyle = '#dc2626';
                ctx.beginPath(); ctx.roundRect(obsX, obsY - 9, obsW, 18, 3); ctx.fill();
                ctx.fillStyle = '#ffffff';
                ctx.font = 'bold 8px sans-serif';
                ctx.textAlign = 'center';
                ctx.fillText("OBSTACLE", obsX + obsW/2, obsY + 3);
            }

            // Draw KAVACH Locomotive with Cab, LED Headlight & Antenna
            let trainY = yDnMain;
            if (train.route === "DN_LOOP") {
                if (train.x < 0.30) trainY = yDnMain;
                else if (train.x >= 0.30 && train.x <= 0.37) {
                    const t = (train.x - 0.30) / 0.07;
                    trainY = yDnMain + t * (yDnLoop - yDnMain);
                } else if (train.x > 0.37 && train.x < 0.63) {
                    trainY = yDnLoop;
                } else if (train.x >= 0.63 && train.x <= 0.70) {
                    if (points.P2 === "REVERSE") {
                        const t = (train.x - 0.63) / 0.07;
                        trainY = yDnLoop + t * (yDnMain - yDnLoop);
                    } else {
                        trainY = yDnLoop;
                    }
                } else {
                    trainY = points.P2 === "REVERSE" ? yDnMain : yDnLoop;
                }
            } else if (train.route === "UP_MAIN" || train.route === "UP_LOOP") {
                trainY = train.route === "UP_LOOP" ? yUpLoop : yUpMain;
            }

            const trX = train.x * w;
            const trW = train.length * w;

            // Draw Engine and Coaches
            const numCoaches = 4;
            const gap = trW * 0.04;
            const locoW = trW * 0.25;
            const coachW = (trW - locoW - (gap * numCoaches)) / numCoaches;
            
            for (let i = 0; i <= numCoaches; i++) {
                const isLoco = (i === 0);
                const segW = isLoco ? locoW : coachW;
                
                let segX;
                if (!train.isUpDirection) { // DN (Left -> Right)
                    let offsetFromFront = isLoco ? 0 : locoW + gap + (i - 1) * (coachW + gap);
                    segX = trX + trW - offsetFromFront - segW;
                } else { // UP (Right -> Left)
                    let offsetFromFront = isLoco ? 0 : locoW + gap + (i - 1) * (coachW + gap);
                    segX = trX + offsetFromFront;
                }
                
                const segGrad = ctx.createLinearGradient(segX, trainY - 12, segX, trainY + 12);
                if (isLoco) {
                    segGrad.addColorStop(0, train.route === "DN_LOOP" ? '#f59e0b' : '#3b82f6');
                    segGrad.addColorStop(1, train.route === "DN_LOOP" ? '#b45309' : '#1d4ed8');
                } else {
                    segGrad.addColorStop(0, '#94a3b8');
                    segGrad.addColorStop(1, '#475569');
                }
                
                ctx.fillStyle = segGrad;
                ctx.beginPath(); ctx.roundRect(segX, trainY - 10, segW, 20, 3); ctx.fill();
                ctx.strokeStyle = isLoco ? '#60a5fa' : '#cbd5e1'; 
                ctx.lineWidth = 1; ctx.stroke();
                
                if (isLoco) {
                    // Front Cab
                    const cabX = train.isUpDirection ? segX + 3 : segX + segW - 8;
                    ctx.fillStyle = '#38bdf8';
                    ctx.fillRect(cabX, trainY - 6, 5, 12);
                    
                    // Roof Antenna
                    const antX = train.isUpDirection ? segX + segW * 0.3 : segX + segW * 0.7;
                    ctx.strokeStyle = '#00f0ff'; ctx.lineWidth = 1.5; ctx.setLineDash([2, 2]);
                    ctx.beginPath(); ctx.moveTo(antX, trainY + 10); ctx.lineTo(antX, trainY + 18); ctx.stroke();
                    ctx.setLineDash([]);
                } else {
                    // Windows for coaches
                    ctx.fillStyle = '#0f172a';
                    const winW = 3;
                    const numWins = Math.floor(segW / 5) - 1;
                    for(let w_idx = 0; w_idx < numWins; w_idx++) {
                        ctx.fillRect(segX + 4 + w_idx * 5, trainY - 4, winW, 8);
                    }
                }
            }

            // Draw KAVACH Target Stop Location Marker (MA)
            if (!isTripped) {
                const maX = train.targetStopX * w;
                ctx.strokeStyle = '#3b82f6';
                ctx.lineWidth = 2;
                ctx.beginPath();
                ctx.moveTo(maX, trainY - 10);
                ctx.lineTo(maX, trainY + 10);
                ctx.stroke();
            }

            // --- AUTO WHISTLING VISUAL ---
            if (train.whistleTimer > 0) {
                ctx.fillStyle = `rgba(250, 204, 21, ${train.whistleTimer / 200})`;
                ctx.font = 'bold 10px sans-serif';
                ctx.textAlign = 'center';
                
                const waveFrame = Math.floor(Date.now() / 150) % 3;
                let waves = "🔊";
                if (waveFrame === 1) waves = "🔈";
                if (waveFrame === 2) waves = "🔉";
                
                ctx.fillText(`${waves} WHISTLE`, trX + trW/2, trainY - 30);
                
                // Draw arc sound waves emitting from the loco
                ctx.strokeStyle = `rgba(250, 204, 21, ${train.whistleTimer / 200})`;
                ctx.lineWidth = 2;
                ctx.beginPath();
                ctx.arc(trX + trW, trainY, 15 + (waveFrame * 5), -Math.PI/4, Math.PI/4);
                ctx.stroke();
            }

            // Emergency Trip Alert Overlay
            if (isTripped) {
                ctx.fillStyle = 'rgba(220, 38, 38, 0.92)';
                ctx.fillRect(w/2 - 160, h/2 - 30, 320, 60);
                ctx.strokeStyle = '#fca5a5'; ctx.lineWidth = 2;
                ctx.strokeRect(w/2 - 160, h/2 - 30, 320, 60);

                ctx.fillStyle = '#ffffff';
                ctx.font = 'bold 18px sans-serif';
                ctx.textAlign = 'center';
                ctx.fillText("KAVACH EMERGENCY TRIP", w/2, h/2 + 5);
            }
        }

        function animate() {
            updateLogic();
            draw();
            animationId = requestAnimationFrame(animate);
        }

        btnStart.addEventListener('click', () => {
            if (isTripped) return;
            isRunning = !isRunning;
            btnStart.innerHTML = isRunning 
                ? `<svg class="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20"><path d="M5 4h3v12H5V4zm7 0h3v12h-3V4z"/></svg><span>Pause Train</span>`
                : `<svg class="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20"><path d="M4 4l12 6-12 6V4z"/></svg><span>Start Train</span>`;
            btnStart.className = isRunning
                ? "px-4 py-2 bg-amber-600 hover:bg-amber-500 text-white rounded-lg font-bold text-xs transition-all shadow-lg flex items-center gap-2"
                : "px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg font-bold text-xs transition-all shadow-lg flex items-center gap-2";
        });

        btnReset.addEventListener('click', () => {
            train.x = 0.02;
            train.speedKm = 0;
            train.lastScannedTag = rfidTags[0];
            isOsModeActive = false;
            isRunning = false;
            isTripped = false;
            points.P1 = "NORMAL"; points.P2 = "NORMAL"; points.P3 = "NORMAL"; points.P4 = "NORMAL";
            selRoute.value = "DN_MAIN"; train.route = "DN_MAIN";
            updatePointButtonsUI();
            btnStart.innerHTML = `<svg class="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20"><path d="M4 4l12 6-12 6V4z"/></svg><span>Start Train</span>`;
            btnStart.className = "px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg font-bold text-xs transition-all shadow-lg flex items-center gap-2";
        });

        btnOsMode.addEventListener('click', () => {
            isOsModeActive = !isOsModeActive;
            btnOsMode.className = isOsModeActive
                ? "px-3 py-2 bg-red-600 hover:bg-red-500 text-white rounded-lg font-bold text-xs transition-all flex items-center gap-1 border border-red-400"
                : "px-3 py-2 bg-amber-600/90 hover:bg-amber-500 text-white rounded-lg font-bold text-xs transition-all flex items-center gap-1";
        });

        const btnThemeMode = document.getElementById('btn-theme-mode');
        if (btnThemeMode) {
            btnThemeMode.addEventListener('click', () => {
                isLightMode = !isLightMode;
                document.body.classList.toggle('light-theme', isLightMode);
                
                if (isLightMode) {
                    btnThemeMode.innerHTML = `<svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"></path></svg><span>Dark Theme</span>`;
                    btnThemeMode.className = "px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg font-bold text-xs transition-all flex items-center gap-1 dark-override-btn";
                } else {
                    btnThemeMode.innerHTML = `<svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"></path></svg><span>Light Theme</span>`;
                    btnThemeMode.className = "px-3 py-2 bg-slate-200 hover:bg-slate-300 text-slate-800 rounded-lg font-bold text-xs transition-all flex items-center gap-1 dark-override-btn";
                }
            });
        }

        // --- Manual Signal Canvas Interactions ---
        const signalContextMenu = document.getElementById('signalContextMenu');
        const signalMenuTitle = document.getElementById('signalMenuTitle');
        let activeContextMenuSignal = null;

        const getClickedSignal = (e) => {
            const rect = canvas.getBoundingClientRect();
            // Get raw pixel coordinates relative to the canvas drawing area
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            const w = rect.width;

            // Helper to check if click is within the bounding box of a drawn signal head
            const checkHit = (xNorm, yPos) => {
                const sigX = xNorm * w;
                const headTop = yPos - 68; // post is 40px up, head is another 28px up
                const headBottom = yPos - 38;
                const headLeft = sigX - 15; // wide tolerance
                const headRight = sigX + 15;
                return x >= headLeft && x <= headRight && y >= headTop - 10 && y <= headBottom + 10;
            };

            if (checkHit(0.15, 170)) return "S1D";
            if (checkHit(0.30, 170)) return "S1";
            if (checkHit(0.85, 170)) return "S6";
            if (checkHit(0.60, 90)) return "S5";
            if (checkHit(0.60, 170)) return "S3";

            return null;
        };

        const getClickedPointMachine = (e) => {
            const rect = canvas.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            const w = rect.width;

            const checkHit = (xNorm, yPos) => {
                const pmX = xNorm * w;
                // Generous bounding box for the point machine area (x: -10 to +40, y: -30 to +30)
                return x >= pmX - 10 && x <= pmX + 40 && y >= yPos - 30 && y <= yPos + 30;
            };

            if (checkHit(0.23, 170)) return "P1";
            if (checkHit(0.63, 90)) return "P2";
            if (checkHit(0.70, 250)) return "P3";
            if (checkHit(0.37, 330)) return "P4";

            return null;
        };

        const cycleAspect = (sig) => {
            const aspects = ["GREEN", "DOUBLE YELLOW", "YELLOW", "RED"];
            let idx = aspects.indexOf(signalState[sig]);
            signalState[sig] = aspects[(idx + 1) % aspects.length];
        };

        canvas.addEventListener('click', (e) => {
            signalContextMenu.classList.add('hidden'); // Hide menu if open
            
            const sig = getClickedSignal(e);
            if (sig) {
                cycleAspect(sig);
                return;
            }

            const pm = getClickedPointMachine(e);
            if (pm) {
                points[pm] = points[pm] === "NORMAL" ? "REVERSE" : "NORMAL";
                // If P3 is clicked, sync P4 (Crossover logic, as done in HTML buttons)
                if (pm === "P3") points.P4 = points.P3;
                if (pm === "P4") points.P3 = points.P4;
                updatePointButtonsUI();
            }
        });

        canvas.addEventListener('contextmenu', (e) => {
            e.preventDefault();
            const sig = getClickedSignal(e);
            if (sig) {
                activeContextMenuSignal = sig;
                signalMenuTitle.innerText = `SIGNAL ${sig}`;
                signalContextMenu.style.left = `${e.pageX}px`;
                signalContextMenu.style.top = `${e.pageY}px`;
                signalContextMenu.classList.remove('hidden');
            } else {
                signalContextMenu.classList.add('hidden');
            }
        });

        document.querySelectorAll('#signalContextMenu button').forEach(btn => {
            btn.addEventListener('click', (e) => {
                if (activeContextMenuSignal) {
                    signalState[activeContextMenuSignal] = e.target.getAttribute('data-aspect');
                }
                signalContextMenu.classList.add('hidden');
            });
        });

        // Hide context menu on outside click
        document.addEventListener('click', (e) => {
            if (!signalContextMenu.contains(e.target) && e.target !== canvas) {
                signalContextMenu.classList.add('hidden');
            }
        });

        window.onload = function() {
            resize();
            animate();
        };
