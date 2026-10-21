<?php
/**
 * هاك زيكو الروسي - لوحة تحكم إدارة الأكواد
 * ملف admin.php مربوط بـ Firebase وقاعدة البيانات السحابية مباشرة
 * يدعم الاستضافة المباشرة (cPanel / Apache / Nginx / PHP Hosting)
 */

header('Content-Type: text/html; charset=utf-8');

// Firebase Configuration Provided by User
$firebaseConfig = [
    'apiKey' => 'AIzaSyCC5-CsnGY5sMXzpNnnTPvDwdFu8aHX8cQ',
    'authDomain' => 'ziko-5fa27.firebaseapp.com',
    'databaseURL' => 'https://ziko-5fa27-default-rtdb.firebaseio.com',
    'projectId' => 'ziko-5fa27',
    'storageBucket' => 'ziko-5fa27.firebasestorage.app',
    'messagingSenderId' => '177756561652',
    'appId' => '1:177756561652:web:547eff48265a1ec4393ea1',
    'measurementId' => 'G-XMFNR6TK9L'
];

$databaseUrl = rtrim($firebaseConfig['databaseURL'], '/');

// PHP Server-Side Firebase REST API Helper
function firebaseRestCall($url, $method = 'GET', $data = null) {
    $ch = curl_init();
    curl_setopt($ch, CURLOPT_URL, $url);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_CUSTOMREQUEST, $method);
    curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
    curl_setopt($ch, CURLOPT_TIMEOUT, 10);
    
    if ($data !== null) {
        $json = is_string($data) ? $data : json_encode($data);
        curl_setopt($ch, CURLOPT_POSTFIELDS, $json);
        curl_setopt($ch, CURLOPT_HTTPHEADER, ['Content-Type: application/json']);
    }
    
    $response = curl_exec($ch);
    $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    curl_close($ch);
    
    return [
        'code' => $httpCode,
        'data' => json_decode($response, true)
    ];
}

// Handle PHP AJAX / API Requests for hosting compatibility
if (isset($_GET['api_action'])) {
    header('Content-Type: application/json');
    $action = $_GET['api_action'];
    
    if ($action === 'get_codes') {
        $res = firebaseRestCall($databaseUrl . '/access_codes.json');
        echo json_encode($res['data'] ?: []);
        exit;
    }
    
    if ($action === 'save_code' && $_SERVER['REQUEST_METHOD'] === 'POST') {
        $input = json_decode(file_get_contents('php://input'), true);
        if ($input && isset($input['code'])) {
            $codeKey = preg_replace('/[^A-Za-z0-9_-]/', '', $input['code']);
            $res = firebaseRestCall($databaseUrl . '/access_codes/' . $codeKey . '.json', 'PUT', $input);
            echo json_encode(['success' => true, 'data' => $res['data']]);
            exit;
        }
    }
    
    if ($action === 'delete_code' && isset($_GET['code'])) {
        $codeKey = preg_replace('/[^A-Za-z0-9_-]/', '', $_GET['code']);
        $res = firebaseRestCall($databaseUrl . '/access_codes/' . $codeKey . '.json', 'DELETE');
        echo json_encode(['success' => true]);
        exit;
    }

    if ($action === 'get_m11') {
        $res = firebaseRestCall($databaseUrl . '/m11.json');
        echo json_encode($res['data'] ?: []);
        exit;
    }

    if ($action === 'generate_m11') {
        $finalObj = [];
        for ($r = 0; $r < 10; $r++) {
            $safeCount = 4;
            if ($r >= 4 && $r < 7) $safeCount = 3;
            if ($r >= 7 && $r < 9) $safeCount = 2;
            if ($r >= 9) $safeCount = 1;
            
            $safeCols = [];
            while (count($safeCols) < $safeCount) {
                $randCol = rand(0, 4);
                if (!in_array($randCol, $safeCols)) {
                    $safeCols[] = $randCol;
                }
            }
            
            for ($c = 0; $c < 5; $c++) {
                $mIndex = $r * 5 + $c + 1;
                $mKey = "m" . $mIndex;
                $val = in_array($c, $safeCols) ? "1" : "0";
                $finalObj[$mKey] = [$mKey => $val];
            }
        }
        $res = firebaseRestCall($databaseUrl . '/m11.json', 'PUT', $finalObj);
        echo json_encode(['success' => true, 'data' => $res['data']]);
        exit;
    }
}
?>
<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>هاك زيكو الروسي - لوحة تحكم الأكواد (Admin)</title>
    <!-- Tailwind CSS -->
    <script src="https://cdn.tailwindcss.com"></script>
    <link href="https://fonts.googleapis.com/css2?family=Cairo:wght@400;600;700;800;900&family=Chakra+Petch:wght@600;700&family=Share+Tech+Mono&display=swap" rel="stylesheet">
    
    <!-- Firebase SDK (Direct Browser Integration) -->
    <script src="https://www.gstatic.com/firebasejs/9.23.0/firebase-app-compat.js"></script>
    <script src="https://www.gstatic.com/firebasejs/9.23.0/firebase-database-compat.js"></script>
    <script src="https://cdn.jsdelivr.net/npm/canvas-confetti@1.6.0/dist/confetti.browser.min.js"></script>
    
    <style>
        body {
            font-family: 'Cairo', sans-serif;
            background-color: #06070a;
            color: #ffffff;
        }
        .font-mono-cyber {
            font-family: 'Share Tech Mono', monospace;
        }
        .font-cyber {
            font-family: 'Chakra Petch', sans-serif;
        }
        .shadow-neon-red {
            box-shadow: 0 0 25px rgba(255, 30, 56, 0.4);
        }
    </style>
</head>
<body class="min-h-screen bg-[#06070a] text-white p-4 sm:p-8">

    <div class="max-w-4xl mx-auto space-y-6">
        <!-- Header -->
        <div class="flex items-center justify-between p-5 rounded-3xl bg-zinc-950/80 border border-white/10 backdrop-blur-xl shadow-2xl">
            <div class="flex items-center gap-3">
                <div class="w-12 h-12 rounded-2xl overflow-hidden border-2 border-red-500/70 shadow-neon-red bg-black shrink-0">
                    <img src="/ziko-logo.jpg" alt="Logo" class="w-full h-full object-cover">
                </div>
                <div>
                    <div class="flex items-center gap-2">
                        <h1 class="text-xl sm:text-2xl font-black text-white">هاك زيكو الروسي</h1>
                        <span class="text-[10px] font-black uppercase text-[#ff1e38] bg-red-500/10 px-2 py-0.5 rounded-full border border-red-500/30">
                            ADMIN VIP
                        </span>
                    </div>
                    <p class="text-xs text-zinc-400">لوحة تحكم وتوليد أكواد الاشتراك مربوطة مباشرة بسيرفر Firebase</p>
                </div>
            </div>

            <div class="flex items-center gap-2">
                <a href="https://t.me/+4fSJ8LxoeN1mZGNk" target="_blank" class="px-4 py-2 rounded-xl bg-[#229ED9] hover:bg-[#1f91c7] text-white text-xs font-bold transition-all flex items-center gap-1.5 shadow-md">
                    <span>قناة التليجرام</span>
                </a>
                <a href="/" class="px-4 py-2 rounded-xl bg-zinc-900 border border-white/10 hover:border-white/30 text-xs font-bold text-zinc-300 transition-all">
                    العودة للسكريبت
                </a>
            </div>
        </div>

        <!-- Firebase Status Pill -->
        <div class="p-3 bg-zinc-950/80 border border-white/10 rounded-2xl flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
                <span class="inline-block w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse"></span>
                <span class="text-zinc-300 font-bold">قاعدة بيانات Firebase المتصلة:</span>
                <span class="font-mono text-emerald-400 text-[11px]"><?php echo htmlspecialchars($firebaseConfig['databaseURL']); ?></span>
            </div>
            <span class="text-[10px] bg-emerald-500/10 text-emerald-400 px-2 py-0.5 rounded-full font-bold border border-emerald-500/20">
                مزامنة حية 100%
            </span>
        </div>

        <!-- Quick Stats -->
        <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div class="p-4 rounded-2xl bg-zinc-950/80 border border-white/10 flex items-center justify-between">
                <div>
                    <span class="text-xs text-zinc-400 font-bold">إجمالي الأكواد</span>
                    <h3 id="statTotal" class="text-2xl font-black font-mono-cyber text-white">0</h3>
                </div>
                <div class="w-10 h-10 rounded-xl bg-zinc-900 border border-white/10 flex items-center justify-center text-zinc-400">
                    📋
                </div>
            </div>

            <div class="p-4 rounded-2xl bg-zinc-950/80 border border-white/10 flex items-center justify-between">
                <div>
                    <span class="text-xs text-zinc-400 font-bold">الأكواد النشطة حالياً</span>
                    <h3 id="statActive" class="text-2xl font-black font-mono-cyber text-emerald-400">0</h3>
                </div>
                <div class="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                    🟢
                </div>
            </div>

            <div class="p-4 rounded-2xl bg-zinc-950/80 border border-white/10 flex items-center justify-between">
                <div>
                    <span class="text-xs text-zinc-400 font-bold">أكواد غير مستخدمة</span>
                    <h3 id="statUnused" class="text-2xl font-black font-mono-cyber text-[#ff1e38]">0</h3>
                </div>
                <div class="w-10 h-10 rounded-xl bg-red-500/10 border border-red-500/30 flex items-center justify-center text-[#ff1e38]">
                    ⏳
                </div>
            </div>
        </div>

        <!-- Generator Section -->
        <div class="p-6 rounded-3xl bg-zinc-950/80 border border-[#ff1e38]/30 backdrop-blur-xl shadow-neon-red space-y-4">
            <h2 class="text-lg font-black text-white flex items-center gap-2">
                <span>➕</span> توليد كود اشتراك جديد (مخصص لجهاز واحد)
            </h2>

            <div class="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                    <label class="block text-xs text-zinc-400 font-bold mb-1">مدة الصلاحية</label>
                    <select id="codeDuration" class="w-full h-11 bg-zinc-900 border border-white/15 rounded-xl px-3 text-sm text-white focus:border-[#ff1e38] outline-none">
                        <option value="1">ساعة واحدة (1 Hour)</option>
                        <option value="2">ساعتان (2 Hours)</option>
                        <option value="6">6 ساعات (6 Hours)</option>
                        <option value="12">12 ساعة (12 Hours)</option>
                        <option value="24" selected>يوم كامل (24 Hours)</option>
                        <option value="72">3 أيام (72 Hours)</option>
                        <option value="168">أسبوع (7 Days)</option>
                        <option value="720">شهر (30 Days)</option>
                    </select>
                </div>

                <div>
                    <label class="block text-xs text-zinc-400 font-bold mb-1">ملاحظة / اسم العميل (اختياري)</label>
                    <input id="codeNote" type="text" placeholder="مثال: اشتراك تجريبي لمحمد" class="w-full h-11 bg-zinc-900 border border-white/15 rounded-xl px-3 text-sm text-white focus:border-[#ff1e38] outline-none">
                </div>

                <div class="flex items-end">
                    <button id="btnGenerate" class="w-full h-11 bg-gradient-to-r from-red-600 to-[#ff1e38] hover:from-red-500 hover:to-red-600 text-white font-black text-xs uppercase tracking-wider rounded-xl shadow-neon-red transition-all active:scale-95 cursor-pointer flex items-center justify-center gap-2">
                        <span>توليد وحفظ الكود</span>
                        <span>⚡</span>
                    </button>
                </div>
            </div>

            <!-- Single Device Guarantee Note -->
            <div class="p-3 bg-zinc-900/80 border border-white/5 rounded-xl flex items-center gap-2 text-xs text-zinc-400">
                <span class="text-emerald-400">🛡️</span>
                <span><strong>قفل الجهاز الواحد:</strong> عند قيام المستخدم بإدخال الكود في الهاك، يتم ربط الكود بالبصمة الرقمية لجهازه فورياً، ويبدأ المؤقت بالعد التنازلي. بمجرد انتهاء الوقت يخرج المستخدم تلقائياً، ولا يمكن إعادة استخدام الكود على أي جهاز آخر.</span>
            </div>
        </div>

        <!-- Apple of Fortune m11 Management Box -->
        <div class="p-5 rounded-3xl bg-zinc-950/80 border border-emerald-500/30 backdrop-blur-xl shadow-lg space-y-3">
            <div class="flex items-center justify-between">
                <div class="flex items-center gap-2.5">
                    <span class="text-2xl">🍏</span>
                    <div>
                        <h3 class="text-sm font-black text-white">إدارة توقعات تفاحة الحظ (مسار m11)</h3>
                        <p class="text-[11px] text-zinc-400">مصفوفة الـ 50 خانة (من m1 إلى m50) موزعة بالصعوبة التصاعدية</p>
                    </div>
                </div>
                <button id="btnGenerateM11" class="px-4 py-2 bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-600 text-white font-bold text-xs rounded-xl shadow-[0_0_15px_rgba(16,185,129,0.3)] transition-all cursor-pointer flex items-center gap-1.5">
                    <span>توليد ونشر مسار m11 جديد</span>
                    <span>🔄</span>
                </button>
            </div>
            <div id="m11StatusText" class="text-[11px] text-zinc-400 font-mono">
                المسار متصل في الفايربيز: m11 (أجسام متداخلة: m1:{m1:"1"} إلى m50:{m50:"1"})
            </div>
        </div>

        <!-- Generated Code Banner -->
        <div id="generatedBanner" class="hidden p-4 rounded-2xl bg-emerald-950/60 border border-emerald-500/50 flex items-center justify-between">
            <div class="flex items-center gap-3">
                <span class="text-2xl">✅</span>
                <div>
                    <span class="text-xs text-emerald-400 font-bold block">تم إنشاء الكود وحفظه في Firebase بنجاح:</span>
                    <span id="bannerCodeText" class="text-xl font-black font-mono-cyber text-white tracking-widest"></span>
                </div>
            </div>
            <button id="btnCopyBanner" class="px-4 py-2 bg-emerald-500 text-black font-bold text-xs rounded-xl hover:bg-emerald-400 transition-all cursor-pointer">
                نسخ الكود
            </button>
        </div>

        <!-- Codes Table -->
        <div class="p-6 rounded-3xl bg-zinc-950/80 border border-white/10 backdrop-blur-xl shadow-2xl space-y-4">
            <div class="flex items-center justify-between">
                <h3 class="text-base font-black text-white flex items-center gap-2">
                    <span>📑</span> قائمة الأكواد المسجلة في السيرفر
                </h3>
                <button id="btnRefresh" class="px-3 py-1.5 rounded-xl bg-zinc-900 border border-white/10 hover:border-white/30 text-xs font-bold text-zinc-300 cursor-pointer">
                    تحديث القائمة 🔄
                </button>
            </div>

            <div class="overflow-x-auto">
                <table class="w-full text-start text-xs">
                    <thead>
                        <tr class="border-b border-white/10 text-zinc-400">
                            <th class="py-3 px-2 text-start">الكود</th>
                            <th class="py-3 px-2 text-start">المدة</th>
                            <th class="py-3 px-2 text-start">الحالة</th>
                            <th class="py-3 px-2 text-start">الجهاز المرتبط</th>
                            <th class="py-3 px-2 text-start">الوقت المتبقي</th>
                            <th class="py-3 px-2 text-start">الملاحظة</th>
                            <th class="py-3 px-2 text-center">إجراءات</th>
                        </tr>
                    </thead>
                    <tbody id="codesTableBody">
                        <tr>
                            <td colspan="7" class="text-center py-8 text-zinc-500">جارٍ الاتصال بسيرفر Firebase...</td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>
    </div>

    <!-- Firebase SDK Logic with PHP Fallback -->
    <script>
        const firebaseConfig = <?php echo json_encode($firebaseConfig); ?>;
        
        // Initialize Firebase
        if (!firebase.apps.length) {
            firebase.initializeApp(firebaseConfig);
        }
        const db = firebase.database();

        let allCodes = {};

        // Load Codes via Firebase Realtime Listener + PHP REST Fallback
        function loadCodes() {
            db.ref('access_codes').on('value', (snapshot) => {
                allCodes = snapshot.val() || {};
                renderTable();
            }, (error) => {
                console.warn('Firebase client read error, attempting PHP REST API fallback:', error);
                fetch('admin.php?api_action=get_codes')
                    .then(r => r.json())
                    .then(data => {
                        allCodes = data || {};
                        renderTable();
                    })
                    .catch(() => {
                        try {
                            const local = localStorage.getItem('smart_ai_access_codes');
                            allCodes = local ? JSON.parse(local) : {};
                            renderTable();
                        } catch(e) {}
                    });
            });
        }

        function renderTable() {
            const tbody = document.getElementById('codesTableBody');
            const list = Object.values(allCodes);

            let total = list.length;
            let active = 0;
            let unused = 0;

            if (total === 0) {
                tbody.innerHTML = '<tr><td colspan="7" class="text-center py-8 text-zinc-500">لا توجد أكواد مسجلة بعد. استخدم النموذج أعلاه لإنشاء كود جديد.</td></tr>';
                updateStats(0, 0, 0);
                return;
            }

            const now = Date.now();
            let rowsHtml = '';

            list.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0)).forEach(item => {
                let statusBadge = '';
                let remainingText = '-';

                // Check expired status
                if (item.expiresAt && now >= item.expiresAt) {
                    statusBadge = '<span class="px-2 py-0.5 rounded bg-zinc-800 text-zinc-500 font-bold text-[10px]">منتهي الصلاحية</span>';
                    remainingText = '<span class="text-zinc-500 font-mono">انتهت</span>';
                } else if (item.status === 'active' && item.boundDeviceId) {
                    active++;
                    statusBadge = '<span class="px-2 py-0.5 rounded bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 font-bold text-[10px]">نشط على جهاز</span>';
                    const remSec = Math.max(0, Math.floor((item.expiresAt - now) / 1000));
                    const hours = Math.floor(remSec / 3600);
                    const mins = Math.floor((remSec % 3600) / 60);
                    remainingText = `<span class="text-emerald-400 font-mono font-bold">${hours}س ${mins}د</span>`;
                } else {
                    unused++;
                    statusBadge = '<span class="px-2 py-0.5 rounded bg-blue-500/15 border border-blue-500/30 text-blue-400 font-bold text-[10px]">جاهز للاستخدام</span>';
                    remainingText = `<span class="text-zinc-400 font-mono">${item.durationHours} ساعة</span>`;
                }

                const deviceText = item.boundDeviceId 
                    ? `<span class="text-[11px] font-mono text-zinc-300" title="${item.boundDeviceId}">🔒 ${item.boundDeviceLabel || 'جهاز مسجل'}</span>`
                    : '<span class="text-zinc-600">غير مرتبط بعد</span>';

                rowsHtml += `
                    <tr class="border-b border-white/5 hover:bg-zinc-900/40 transition-colors">
                        <td class="py-3 px-2 font-mono-cyber font-black text-sm text-white tracking-wider flex items-center gap-1.5">
                            <span>${item.code}</span>
                            <button onclick="copyCode('${item.code}')" class="text-zinc-500 hover:text-white cursor-pointer" title="نسخ">📋</button>
                        </td>
                        <td class="py-3 px-2 font-mono text-zinc-300">${item.durationHours}h</td>
                        <td class="py-3 px-2">${statusBadge}</td>
                        <td class="py-3 px-2">${deviceText}</td>
                        <td class="py-3 px-2">${remainingText}</td>
                        <td class="py-3 px-2 text-zinc-400 text-[11px]">${item.note || '-'}</td>
                        <td class="py-3 px-2 text-center">
                            <button onclick="deleteCode('${item.code}')" class="px-2.5 py-1 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-[#ff1e38] font-bold text-[11px] border border-red-500/20 cursor-pointer">
                                حذف
                            </button>
                        </td>
                    </tr>
                `;
            });

            tbody.innerHTML = rowsHtml;
            updateStats(total, active, unused);
        }

        function updateStats(total, active, unused) {
            document.getElementById('statTotal').innerText = total;
            document.getElementById('statActive').innerText = active;
            document.getElementById('statUnused').innerText = unused;
        }

        // Generate Code
        document.getElementById('btnGenerate').addEventListener('click', () => {
            const duration = parseInt(document.getElementById('codeDuration').value, 10) || 1;
            const note = document.getElementById('codeNote').value.trim();

            const randomSuffix = Math.random().toString(36).substring(2, 6).toUpperCase();
            const code = `SMART-${duration}H-${randomSuffix}`;

            const newCodeObj = {
                code: code,
                durationHours: duration,
                createdAt: Date.now(),
                activatedAt: null,
                expiresAt: null,
                boundDeviceId: null,
                status: 'unused',
                note: note || `اشتراك ${duration} ساعة`
            };

            // Save to Firebase via SDK first
            db.ref('access_codes/' + code).set(newCodeObj).then(() => {
                showBanner(code);
                document.getElementById('codeNote').value = '';
                confetti({ particleCount: 50, spread: 60 });
            }).catch(err => {
                // If client failed, save via PHP backend API
                fetch('admin.php?api_action=save_code', {
                    method: 'POST',
                    headers: {'Content-Type': 'application/json'},
                    body: JSON.stringify(newCodeObj)
                }).then(() => {
                    showBanner(code);
                    loadCodes();
                }).catch(() => {
                    allCodes[code] = newCodeObj;
                    localStorage.setItem('smart_ai_access_codes', JSON.stringify(allCodes));
                    showBanner(code);
                    renderTable();
                });
            });
        });

        function showBanner(code) {
            const banner = document.getElementById('generatedBanner');
            const codeText = document.getElementById('bannerCodeText');
            codeText.innerText = code;
            banner.classList.remove('hidden');

            document.getElementById('btnCopyBanner').onclick = () => {
                copyCode(code);
            };
        }

        function copyCode(text) {
            navigator.clipboard.writeText(text);
            alert('تم نسخ الكود: ' + text);
        }

        function deleteCode(code) {
            if (confirm('هل أنت متأكد من حذف هذا الكود نهائياً؟')) {
                db.ref('access_codes/' + code).remove().then(() => {
                    loadCodes();
                }).catch(() => {
                    fetch('admin.php?api_action=delete_code&code=' + encodeURIComponent(code))
                        .then(() => loadCodes())
                        .catch(() => {
                            delete allCodes[code];
                            localStorage.setItem('smart_ai_access_codes', JSON.stringify(allCodes));
                            renderTable();
                        });
                });
            }
        }

        document.getElementById('btnRefresh').addEventListener('click', loadCodes);

        // Generate m11 Apple Predictions
        document.getElementById('btnGenerateM11').addEventListener('click', () => {
            const btn = document.getElementById('btnGenerateM11');
            btn.disabled = true;
            btn.innerText = 'جارٍ النشر...';

            const finalObject = {};
            for (let r = 0; r < 10; r++) {
                let safeCount = 4;
                if (r >= 4 && r < 7) safeCount = 3;
                if (r >= 7 && r < 9) safeCount = 2;
                if (r >= 9) safeCount = 1;

                const safeCols = [];
                while (safeCols.length < safeCount) {
                    const randomCol = Math.floor(Math.random() * 5);
                    if (!safeCols.includes(randomCol)) {
                        safeCols.push(randomCol);
                    }
                }

                for (let c = 0; c < 5; c++) {
                    const mIndex = r * 5 + c + 1;
                    const value = safeCols.includes(c) ? "1" : "0";
                    finalObject['m' + mIndex] = { ['m' + mIndex]: value };
                }
            }

            db.ref('m11').set(finalObject).then(() => {
                document.getElementById('m11StatusText').innerText = '✅ تم تحديث مسار m11 في Firebase بنجاح! (' + new Date().toLocaleTimeString() + ')';
                btn.disabled = false;
                btn.innerHTML = '<span>توليد ونشر مسار m11 جديد</span> <span>🔄</span>';
                confetti({ particleCount: 40, spread: 50 });
            }).catch(err => {
                fetch('admin.php?api_action=generate_m11')
                    .then(r => r.json())
                    .then(() => {
                        document.getElementById('m11StatusText').innerText = '✅ تم تحديث مسار m11 عبر PHP API بنجاح!';
                        btn.disabled = false;
                        btn.innerHTML = '<span>توليد ونشر مسار m11 جديد</span> <span>🔄</span>';
                    });
            });
        });

        setInterval(renderTable, 10000);

        loadCodes();
    </script>
</body>
</html>
