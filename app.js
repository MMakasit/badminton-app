// app.js - เป็นเหมือนสมองของเว็บ คอยจัดการการกดปุ่มและสลับหน้า

document.addEventListener('DOMContentLoaded', () => {
    // 1. ดึง Element ของปุ่ม Navbar มาเก็บไว้
    const navHome = document.getElementById('nav-home');
    const navPlayers = document.getElementById('nav-players');

    // 2. ฟังก์ชันสำหรับสลับหน้า (ซ่อนหน้าเก่า แสดงหน้าใหม่)
    function switchPage(targetPageId) {
        // ลบคลาส active ออกจากทุกหน้าและปุ่ม
        document.querySelectorAll('.page-section').forEach(page => page.classList.remove('active'));
        document.querySelectorAll('.nav-btn').forEach(btn => btn.classList.remove('active'));

        // เพิ่มคลาส active ให้หน้าและปุ่มที่ถูกคลิก
        document.getElementById(targetPageId).classList.add('active');

        // อัปเดตสถานะปุ่มใน Navbar
        if (targetPageId === 'page-home') {
            navHome.classList.add('active');
        } else if (targetPageId === 'page-players') {
            navPlayers.classList.add('active');
        }
    }

    // 3. ผูกเหตุการณ์: เมื่อกดปุ่มใน Navbar ให้เรียกฟังก์ชัน switchPage
    navHome.addEventListener('click', () => switchPage('page-home'));
    navPlayers.addEventListener('click', () => switchPage('page-players'));

    // ==========================================
    // ส่วนที่ 2: ระบบจัดการผู้เล่น (Player Management)
    // ==========================================

    // ดึง Elements จากหน้า HTML
    const addPlayerForm = document.getElementById('add-player-form');
    const playerNameInput = document.getElementById('player-name-input');
    const playerList = document.getElementById('player-list');
    const playerCount = document.getElementById('player-count');

    // โหลดรายชื่อผู้เล่นจาก LocalStorage (ถ้าไม่มีให้เป็น Array ว่างๆ)
    let players = JSON.parse(localStorage.getItem('badminton_players')) || [];

    // ฟังก์ชันเซฟลง LocalStorage เพื่อไม่ให้ข้อมูลหายตอนปิดเว็บ
    function savePlayers() {
        localStorage.setItem('badminton_players', JSON.stringify(players));
    }

    const sortSelect = document.getElementById('sort-players');
    sortSelect.addEventListener('change', renderPlayers);

    // ฟังก์ชันแสดงผลรายชื่อผู้เล่นบนหน้าเว็บ
    function renderPlayers() {
        playerList.innerHTML = ''; // ล้างข้อมูลเก่าบนจอก่อน
        playerCount.textContent = players.length; // อัปเดตตัวเลขจำนวนคน

        // จำลองข้อมูลและจัดเรียงตามที่เลือก
        let sortedPlayers = [...players];
        const sortMode = sortSelect.value;
        if (sortMode === 'most_wins') {
            sortedPlayers.sort((a, b) => b.wins - a.wins);
        } else if (sortMode === 'most_matches') {
            sortedPlayers.sort((a, b) => b.matches - a.matches);
        }

        sortedPlayers.forEach(player => {
            const li = document.createElement('li');
            li.className = 'player-item';

            li.innerHTML = `
                <div class="player-info">
                    <span class="player-name">${player.name}</span>
                    <span class="player-stats">สถิติ: ชนะ ${player.wins} | แมตช์รวม ${player.matches}</span>
                </div>
                <div class="player-actions">
                    <button class="btn-action edit" onclick="editPlayer('${player.id}')">แก้ไข</button>
                    <button class="btn-action delete" onclick="deletePlayer('${player.id}')">ลบ</button>
                </div>
            `;
            playerList.appendChild(li);
        });
    }

    // เมื่อกดปุ่ม "เพิ่มผู้เล่น"
    addPlayerForm.addEventListener('submit', (e) => {
        e.preventDefault(); // ป้องกันเว็บกระตุก/โหลดใหม่
        const name = playerNameInput.value.trim();

        if (name) {
            // เช็คชื่อซ้ำ (ป้องกันตัวพิมพ์เล็กใหญ่ต่างกัน)
            const isDuplicate = players.some(p => p.name.toLowerCase() === name.toLowerCase());
            if (isDuplicate) {
                alert('มีชื่อนี้อยู่ในระบบแล้ว กรุณาใช้ชื่ออื่นครับ');
                return;
            }

            const newPlayer = {
                id: Date.now().toString(), // สร้าง ID ไม่ซ้ำกันด้วยเวลาปัจจุบัน
                name: name,
                wins: 0,
                matches: 0
            };
            players.push(newPlayer); // เพิ่มเข้าในระบบ
            savePlayers(); // บันทึก
            renderPlayers(); // รีเฟรชหน้าจอใหม่
            playerNameInput.value = ''; // ล้างช่องกรอกข้อความ
            playerNameInput.focus(); // ให้เมาส์ยังเคอร์เซอร์กะพริบที่เดิม เผื่อพิมพ์ต่อ
        }
    });

    // ฟังก์ชันลบผู้เล่น (ต้องทำให้เรียกจากปุ่มใน HTML ได้)
    window.deletePlayer = function (id) {
        if (confirm('คุณแน่ใจหรือไม่ว่าต้องการลบรายชื่อนี้?')) {
            players = players.filter(player => player.id !== id);
            savePlayers();
            renderPlayers();
        }
    };

    // ฟังก์ชันแก้ไขชื่อผู้เล่น
    window.editPlayer = function (id) {
        const player = players.find(p => p.id === id);
        if (player) {
            const newName = prompt('แก้ไขชื่อผู้เล่น:', player.name);
            // ตรวจสอบว่าไม่ได้กด Cancel และใส่ข้อความจริงๆ
            if (newName !== null && newName.trim() !== '') {
                const trimmedName = newName.trim();
                // เช็คชื่อซ้ำ แต่ไม่รวมตัวเอง
                const isDuplicate = players.some(p => p.id !== id && p.name.toLowerCase() === trimmedName.toLowerCase());
                if (isDuplicate) {
                    alert('มีชื่อนี้อยู่ในระบบแล้วครับ');
                    return;
                }
                player.name = trimmedName;
                savePlayers();
                renderPlayers();
            }
        }
    };

    // เรียกใช้ฟังก์ชัน render ทันทีเมื่อเปิดหน้าเว็บ เพื่อดึงข้อมูลเดิมมาแสดง
    renderPlayers();

    // ==========================================
    // ส่วนที่ 3: ระบบจัดการแข่งขัน และ นับคะแนน
    // ==========================================
    const btnStartTournament = document.getElementById('btn-start-tournament');
    const participantList = document.getElementById('participant-list');
    const selectedCountSpan = document.getElementById('selected-count');
    const btnGenerateMatch = document.getElementById('btn-generate-match');

    // รายชื่อทีมขำขัน
    const funnyTeamNames = [
        "ตบไม่ยั้ง", "ลูกขนไก่บิน", "ตีมั่ว", "แบดสายฮา", "ทีมตบเฟี้ยว",
        "หยอดจนงง", "รับไม่ทัน", "ตบก่อนค่อยคิด", "ตีเอามัน", "แชมป์เกือบได้",
        "ลูกออกตลอด", "ตบแรงแต่ติด", "ทีมไม้สั่น", "ขนไก่ล่องหน", "ตบหน้าเน็ต",
        "หยอดรักนักตบ", "รับไม่ไหวแล้ว", "วิ่งทั่วคอร์ต", "กินลม", "ตบเล่นแต่เอาจริง",
        "หมูเด้งแก๊ง", "ไก่กรอบยูไนเต็ด", "นอนก่อน", "สายฮา", "วิ่งมั่ว FC",
        "ชาบูไม่พัก", "แพ้แต่เท่", "ซีหนุง", "แมวส้มบุก", "ต้าวเพนกวิน",
        "ตื่นบ่าย", "ก๊วนหัวร้อน", "บะหมี่พลัง", "หิวตลอดเวลา", "ทีมปั่นจัด",
        "เต่านินจาแตก", "กดมั่วชนะ", "ข้าวเหนียวบิน", "แก๊งลืมเติม", "ตีไก่ไม่พัก"
    ];

    // สถานะของการแข่ง (State)
    let tournamentQueue = []; // เก็บ Array ของทีมทั้งหมดที่สุ่มได้
    let currentMatchNum = 1;
    let scoreA = 0;
    let scoreB = 0;

    // 3.1 เริ่มทัวร์นาเมนต์ (ไปหน้าตั้งค่า)
    btnStartTournament.addEventListener('click', () => {
        switchPage('page-tournament-setup');
        renderParticipantCheckboxes();
    });

    // แสดง Checkbox ให้เลือกคน
    function renderParticipantCheckboxes() {
        participantList.innerHTML = '';
        players.forEach(p => {
            const label = document.createElement('label');
            label.style.display = 'block';
            label.style.padding = '0.8rem';
            label.style.background = 'var(--bg-color)';
            label.style.border = '1px solid var(--glass-border)';
            label.style.borderRadius = '6px';
            label.style.cursor = 'pointer';

            label.innerHTML = `
                <input type="checkbox" class="player-checkbox" value="${p.id}" checked>
                <strong>${p.name}</strong> <small style="color:var(--primary-color)">[ชนะ ${p.wins} | เล่น ${p.matches}]</small>
            `;
            participantList.appendChild(label);
        });
        updateSelectedCount();

        document.querySelectorAll('.player-checkbox').forEach(cb => {
            cb.addEventListener('change', updateSelectedCount);
        });
    }

    function updateSelectedCount() {
        selectedCountSpan.textContent = document.querySelectorAll('.player-checkbox:checked').length;
    }

    // ฟังก์ชันสุ่มสลับตำแหน่งใน Array
    function shuffleArray(array) {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
    }

    // 3.2 ปุ่ม "สุ่มจับทีมและเริ่มแมตช์!"
    btnGenerateMatch.addEventListener('click', () => {
        const selectedIds = Array.from(document.querySelectorAll('.player-checkbox:checked')).map(cb => cb.value);
        if (selectedIds.length < 2) {
            alert('ต้องมีผู้เล่นอย่างน้อย 2 คนครับถึงจะตีได้!');
            return;
        }

        const mode = parseInt(document.querySelector('input[name="match_mode"]:checked').value);

        let shuffled = [...selectedIds];
        shuffleArray(shuffled);

        // สุ่มชื่อทีม
        let availableNames = [...funnyTeamNames];
        shuffleArray(availableNames);

        // จัดกลุ่มเป็นทีม ตามจำนวนโหมด (เช่น โหมด 2 ก็แบ่งทีละ 2 คน)
        tournamentQueue = [];
        for (let i = 0; i < shuffled.length; i += mode) {
            const teamIds = shuffled.slice(i, i + mode);
            // แปลงจาก ID เป็นข้อมูลจริง
            const teamMembers = teamIds.map(id => {
                const p = players.find(player => player.id === id);
                return { id: p.id, name: p.name };
            });

            // ดึงชื่อทีมสุดฮา
            const randomName = availableNames.length > 0 ? availableNames.pop() : `ทีมที่ ${tournamentQueue.length + 1}`;

            tournamentQueue.push({
                teamName: randomName,
                members: teamMembers,
                wins: 0,
                matches: 0
            });
        }

        if (tournamentQueue.length < 2) {
            alert('จำนวนคนไม่พอให้แบ่งเป็น 2 ทีมครับ รบกวนเลือกคนเพิ่มหรือเปลี่ยนโหมด');
            return;
        }

        currentMatchNum = 1;
        switchPage('page-match-queue');
        renderQueue();
    });

    // 3.3 การแสดงผลคิวรอแข่ง
    function renderQueue() {
        document.getElementById('match-number-display').textContent = currentMatchNum;

        const teamA = tournamentQueue[0];
        const teamB = tournamentQueue[1];

        // แสดงชื่อทีมที่กำลังตี
        document.getElementById('display-team-a').innerHTML = `<strong>${teamA.teamName}</strong><br><span style="font-size:0.9rem; font-weight:normal; color:var(--text-main);">${teamA.members.map(p => p.name).join(', ')}</span>`;
        document.getElementById('display-team-b').innerHTML = `<strong>${teamB.teamName}</strong><br><span style="font-size:0.9rem; font-weight:normal; color:var(--text-main);">${teamB.members.map(p => p.name).join(', ')}</span>`;

        // แสดงคิวที่รอ
        const queueList = document.getElementById('waiting-queue-list');
        queueList.innerHTML = '';
        for (let i = 2; i < tournamentQueue.length; i++) {
            const li = document.createElement('li');
            li.style.padding = '1rem';
            li.style.background = 'var(--bg-color)';
            li.style.border = '1px solid var(--glass-border)';
            li.style.marginBottom = '0.5rem';
            li.style.borderRadius = '8px';
            li.style.display = 'flex';
            li.style.justifyContent = 'space-between';
            li.style.alignItems = 'center';
            li.style.gap = '0.5rem';

            li.innerHTML = `
                <div style="flex:1;">
                    <span style="color:var(--text-muted); font-size:0.85rem;">คิวที่ ${i - 1}: <strong style="color:var(--primary-color);">${tournamentQueue[i].teamName}</strong></span><br>
                    <span style="font-size:0.9rem;">${tournamentQueue[i].members.map(p => p.name).join(' & ')}</span>
                </div>
                <div class="swap-actions">
                    <button class="btn-swap swap-a" onclick="swapTeam(${i}, 'A')">แทนน้ำเงิน</button>
                    <button class="btn-swap swap-b" onclick="swapTeam(${i}, 'B')">แทนแดง</button>
                </div>
            `;
            queueList.appendChild(li);
        }

        if (tournamentQueue.length <= 2) {
            queueList.innerHTML = '<li style="color:var(--text-muted); text-align:center; padding:1rem;">ไม่มีทีมรอคิว (ตีวนไปยาวๆ)</li>';
        }

        renderLiveStats(); // อัปเดตตารางสถิติเสมอเมื่อหน้าจอเปลี่ยน
    }

    // อัปเดตตารางสถิติเฉพาะในทัวร์นาเมนต์ปัจจุบัน
    function renderLiveStats() {
        const statsTbody = document.getElementById('live-stats-list');
        statsTbody.innerHTML = '';

        // เรียงลำดับตาม ชนะเยอะสุด -> เล่นเยอะสุด
        const sortedStats = [...tournamentQueue].sort((a, b) => {
            if (b.wins !== a.wins) return b.wins - a.wins;
            return b.matches - a.matches;
        });

        sortedStats.forEach(team => {
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td style="padding: 0.5rem 0; border-bottom: 1px solid var(--glass-border);">
                    <strong style="color:var(--primary-color);">${team.teamName}</strong><br>
                    <span style="font-size:0.8rem; color:var(--text-muted);">${team.members.map(m => m.name).join(', ')}</span>
                </td>
                <td style="text-align:center; padding: 0.5rem 0; color:var(--primary-color); font-weight:bold; border-bottom: 1px solid var(--glass-border);">${team.wins}</td>
                <td style="text-align:center; padding: 0.5rem 0; border-bottom: 1px solid var(--glass-border);">${team.matches}</td>
            `;
            statsTbody.appendChild(tr);
        });
    }

    // ฟังก์ชันสลับทีมจากคิว ขึ้นไปอยู่กระดาน (เอาทีมโดนเปลี่ยนไปต่อท้ายคิวสุด)
    window.swapTeam = function (queueIndex, side) {
        if (!confirm('ยืนยันการให้ทีมนี้ขึ้นไปเสียบแทน? (ทีมบนกระดานจะถูกส่งไปต่อท้ายสุดของคิว)')) return;

        const targetIndex = side === 'A' ? 0 : 1;

        // 1. ดึงทีมใหม่จากคิว และทีมบนกระดาน
        const newTeam = tournamentQueue[queueIndex];
        const teamOnBoard = tournamentQueue[targetIndex];

        // 2. เอาทีมใหม่ไปทับตำแหน่งบนกระดาน
        tournamentQueue[targetIndex] = newTeam;

        // 3. ลบทีมใหม่ออกจากคิวเดิม
        tournamentQueue.splice(queueIndex, 1);

        // 4. นำทีมเก่าบนกระดาน ไปต่อท้ายคิวสุด
        tournamentQueue.push(teamOnBoard);

        renderQueue(); // อัปเดตหน้าจอทันที
    };

    // ปุ่มจบทัวร์นาเมนต์
    document.getElementById('btn-end-tournament').addEventListener('click', () => {
        if (confirm('ต้องการจบการแข่งขันและล้างคิวทัวร์นาเมนต์นี้ใช่หรือไม่? (สถิติรวมของทุกคนจะยังคงอยู่)')) {
            tournamentQueue = [];
            switchPage('page-home');
        }
    });

    // 3.4 เข้าหน้านับคะแนน
    document.getElementById('btn-go-scoreboard').addEventListener('click', () => {
        scoreA = 0;
        scoreB = 0;
        updateScoreboardDisplay();

        const teamA = tournamentQueue[0];
        const teamB = tournamentQueue[1];
        document.getElementById('sb-team-a-name').innerHTML = `${teamA.teamName}<br><span style="font-size:1rem; font-weight:normal; color:rgba(255,255,255,0.7);">${teamA.members.map(p => p.name).join(', ')}</span>`;
        document.getElementById('sb-team-b-name').innerHTML = `${teamB.teamName}<br><span style="font-size:1rem; font-weight:normal; color:rgba(255,255,255,0.7);">${teamB.members.map(p => p.name).join(', ')}</span>`;

        switchPage('page-scoreboard');
    });

    // ออกจากหน้านับคะแนนกลับมาหน้าตาราง
    document.getElementById('btn-back-to-queue').addEventListener('click', () => {
        switchPage('page-match-queue');
    });

    // ควบคุมการนับคะแนน (ใช้ global function เผื่อ onclick)
    window.adjustScore = function (team, amount) {
        if (team === 'A') {
            scoreA = Math.max(0, scoreA + amount); // คะแนนไม่ติดลบ
        } else {
            scoreB = Math.max(0, scoreB + amount);
        }
        updateScoreboardDisplay();
    };

    window.resetScores = function () {
        if (confirm('ยืนยันการรีเซ็ตคะแนน?')) {
            scoreA = 0;
            scoreB = 0;
            updateScoreboardDisplay();
        }
    };

    function updateScoreboardDisplay() {
        document.getElementById('score-a').textContent = scoreA;
        document.getElementById('score-b').textContent = scoreB;
    }

    // 3.5 ระบบประกาศผู้ชนะ & จัดคิวแบบ "ชนะอยู่ต่อ แพ้ออก"
    window.declareWinner = function (winnerSide) {
        if (!confirm('ยืนยันผลการแข่งขัน?')) return;

        const teamA = tournamentQueue[0];
        const teamB = tournamentQueue[1];

        // 1. อัปเดตสถิติจำนวนแมตช์ (ของทีม และรายบุคคลในระบบหลัก)
        teamA.matches++;
        teamB.matches++;

        [...teamA.members, ...teamB.members].forEach(member => {
            const p = players.find(x => x.id === member.id);
            if (p) p.matches++;
        });

        // 2. จัดการผู้ชนะ/ผู้แพ้
        if (winnerSide === 'A') {
            // ทีมซ้ายชนะ! (ได้สถิติ + อยู่ต่อ)
            teamA.wins++;
            teamA.members.forEach(member => {
                const p = players.find(x => x.id === member.id);
                if (p) p.wins++;
            });
            // เอาทีมแพ้ (ทีม B Index ที่ 1) ออกไปต่อท้ายคิว
            const loserTeam = tournamentQueue.splice(1, 1)[0];
            tournamentQueue.push(loserTeam);

        } else {
            // ทีมขวาชนะ! (ได้สถิติ + อยู่ต่อ)
            teamB.wins++;
            teamB.members.forEach(member => {
                const p = players.find(x => x.id === member.id);
                if (p) p.wins++;
            });
            // เอาทีมแพ้ (ทีม A Index ที่ 0) ออกไปต่อท้ายคิว
            const loserTeam = tournamentQueue.splice(0, 1)[0];
            tournamentQueue.push(loserTeam);
            // หมายเหตุ: ทีม B จะเด้งขึ้นมาเป็น Index 0 (ทีมฝั่งซ้าย) อัตโนมัติเพราะ A โดนดึงออกไปแล้ว
        }

        // เซฟและอัปเดตระบบ
        savePlayers();
        renderPlayers();

        currentMatchNum++;
        switchPage('page-match-queue');
        renderQueue(); // โหลดคิวใหม่ โดนทีมใหม่จะเลื่อนขึ้นมาเป็นทีม B อัตโนมัติ
    };
});
